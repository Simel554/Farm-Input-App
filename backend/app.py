from flask import Flask, request, jsonify, render_template, send_from_directory, redirect, url_for
from flask_cors import CORS
import sqlite3
import os
import logging
from datetime import datetime
from database import init_db, get_db_connection

# --- LOGGING CONFIGURATION ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- CONFIGURATION ---
app = Flask(__name__, 
            template_folder='../frontend/user', 
            static_folder='../frontend',
            static_url_path='')

CORS(app)  # Enable Cross-Origin Resource Sharing

# Initialize DB on startup
try:
    init_db()
    logger.info("Database initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize database: {e}")

# --- REDIRECT HELPER & URL CLEANING ---
@app.route('/<path:path>')
def catch_all(path):
    """Handles legacy .html requests and redirects to clean routes."""
    if path.endswith('.html'):
        clean_route = path.replace('.html', '')
        if clean_route in ['register', 'signup']:
            return redirect(url_for('home'))
        return redirect(f'/{clean_route}')
    # If file doesn't exist in static, return 404
    static_file_path = os.path.join(app.static_folder, path)
    if os.path.exists(static_file_path):
        return send_from_directory(app.static_folder, path)
    return jsonify({'error': 'Resource not found'}), 404 

# --- FRONTEND ROUTES ---

@app.route('/')
def home():
    """Entry point: Registration Page."""
    return render_template('register.html')

@app.route('/login')
def login_page():
    """Login Page."""
    return render_template('login.html')

@app.route('/market')
def market_page():
    """Main Market Marketplace."""
    return render_template('index.html')

@app.route('/admin')
def admin_dashboard():
    """Admin Dashboard."""
    return send_from_directory('../frontend/admin', 'index.html')

# --- USER & AUTH API ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON body'}), 400
        
    fullname = data.get('fullname')
    phone = data.get('phone')
    password = data.get('password')
    role = data.get('role', 'farmer')

    if not all([fullname, phone, password]):
        return jsonify({'error': 'Fullname, phone, and password are required'}), 400
    
    if role not in ['farmer', 'admin']:
        return jsonify({'error': 'Invalid role choice'}), 400

    conn = get_db_connection()
    try:
        with conn:
            conn.execute(
                'INSERT INTO users (fullname, phone, password, role) VALUES (?, ?, ?, ?)',
                (fullname, phone, password, role)
            )
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Phone number already registered'}), 409
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    phone = data.get('phone')
    password = data.get('password')

    if not all([phone, password]):
        return jsonify({'error': 'Missing login credentials'}), 400

    conn = get_db_connection()
    try:
        user = conn.execute(
            'SELECT * FROM users WHERE phone = ? AND password = ?',
            (phone, password)
        ).fetchone()
        
        if user:
            return jsonify({
                'message': 'Login successful',
                'user': {
                    'id': user['id'],
                    'fullname': user['fullname'],
                    'phone': user['phone'],
                    'role': user['role']
                }
            }), 200
        return jsonify({'error': 'Invalid phone or password'}), 401
    finally:
        conn.close()

# --- PRODUCT API ---

@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db_connection()
    try:
        products = conn.execute('SELECT * FROM products ORDER BY created_at DESC').fetchall()
        return jsonify([dict(row) for row in products]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.get_json()
    name = data.get('name')
    category = data.get('category')
    p_type = data.get('type')
    price = data.get('price', 0)
    b_desc = data.get('barterDesc', '')
    loc = data.get('location')
    seller = data.get('seller', 'Farmer')
    desc = data.get('desc', '')
    img = data.get('image_url', 'images/seed_pack.jpg')

    if not all([name, category, p_type, loc]):
        return jsonify({'error': 'Missing product details'}), 400

    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute(
                '''INSERT INTO products (name, category, type, price, barter_desc, location, seller, description, image_url)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                (name, category, p_type, price, b_desc, loc, seller, desc, img)
            )
        return jsonify({'message': 'Product added', 'id': cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    conn = get_db_connection()
    try:
        cur = conn.execute('DELETE FROM products WHERE id = ?', (product_id,))
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({'error': 'Product not found'}), 404
        return jsonify({'message': 'Deleted successfully'}), 200
    finally:
        conn.close()

# --- OFFERS API ---

@app.route('/api/offers', methods=['POST'])
def create_offer():
    data = request.get_json()
    # Handle both camelCase and snake_case for frontend flexibility
    pid = data.get('productId') or data.get('product_id')
    b_name = data.get('buyerName') or data.get('buyer_name')
    b_phone = data.get('buyerPhone') or data.get('buyer_phone')
    b_email = data.get('buyerEmail', '')
    amt = data.get('offerAmount', 0)
    b_offer = data.get('barterOffer', '')
    msg = data.get('message', '')

    if not all([pid, b_name, b_phone]):
        return jsonify({'error': 'Incomplete offer data'}), 400

    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute(
                '''INSERT INTO offers (product_id, buyer_name, buyer_phone, buyer_email, offer_amount, barter_offer, message, status)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                (pid, b_name, b_phone, b_email, amt, b_offer, msg, 'pending')
            )
        return jsonify({'message': 'Offer sent', 'id': cursor.lastrowid}), 201
    except Exception as e:
        logger.error(f"Offer submission failed: {e}")
        return jsonify({'error': 'Database transaction failed'}), 500
    finally:
        conn.close()

# --- ADMIN API ---

@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    conn = get_db_connection()
    try:
        u_count = conn.execute('SELECT COUNT(*) as c FROM users').fetchone()['c']
        f_count = conn.execute('SELECT COUNT(*) as c FROM users WHERE role = "farmer"').fetchone()['c']
        a_count = conn.execute('SELECT COUNT(*) as c FROM users WHERE role = "admin"').fetchone()['c']
        p_count = conn.execute('SELECT COUNT(*) as c FROM products').fetchone()['c']
        o_count = conn.execute('SELECT COUNT(*) as c FROM offers').fetchone()['c']
        
        return jsonify({
            'totalUsers': u_count,
            'farmerCount': f_count,
            'adminCount': a_count,
            'totalProducts': p_count,
            'totalOffers': o_count
        }), 200
    finally:
        conn.close()

@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    conn = get_db_connection()
    try:
        users = conn.execute('SELECT id, fullname, phone, role, created_at FROM users ORDER BY created_at DESC').fetchall()
        return jsonify([dict(row) for row in users]), 200
    finally:
        conn.close()

@app.route('/api/admin/offers', methods=['GET'])
def get_all_offers():
    conn = get_db_connection()
    try:
        # Using LEFT JOIN to ensure offers show even if product is deleted
        query = '''
            SELECT o.*, p.name as product_name, p.seller as seller_name, p.type as product_type
            FROM offers o
            LEFT JOIN products p ON o.product_id = p.id
            ORDER BY o.created_at DESC
        '''
        offers = conn.execute(query).fetchall()
        return jsonify([dict(row) for row in offers]), 200
    finally:
        conn.close()

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    conn = get_db_connection()
    try:
        cur = conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'message': 'Deleted successfully'}), 200
    finally:
        conn.close()

# --- ADMIN: DELETE PRODUCT ---
@app.route('/api/admin/products/<int:product_id>', methods=['DELETE'])
def admin_delete_product(product_id):
    conn = get_db_connection()
    try:
        cur = conn.execute('DELETE FROM products WHERE id = ?', (product_id,))
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({'error': 'Product not found'}), 404
        return jsonify({'message': 'Deleted successfully'}), 200
    finally:
        conn.close()

# --- ADMIN: UPDATE OFFER STATUS ---
@app.route('/api/admin/offers/<int:offer_id>', methods=['PUT'])
def update_offer_status(offer_id):
    data = request.get_json()
    status = data.get('status')
    
    if not status or status not in ['accepted', 'rejected']:
        return jsonify({'error': 'Invalid status. Must be "accepted" or "rejected"'}), 400
    
    conn = get_db_connection()
    try:
        cur = conn.execute('UPDATE offers SET status = ? WHERE id = ?', (status, offer_id))
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({'error': 'Offer not found'}), 404
        return jsonify({'message': f'Offer {status} successfully'}), 200
    finally:
        conn.close()

# --- SYSTEM HEALTH ---
@app.route('/api/health')
def health_check():
    return jsonify({'status': 'online', 'timestamp': datetime.now().isoformat()}), 200

if __name__ == '__main__':
    # Using 0.0.0.0 makes the server accessible over the local network
    app.run(host='0.0.0.0', port=5000, debug=True)