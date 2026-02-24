from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from database import init_db, get_db_connection

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize DB on startup
init_db()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    fullname = data.get('fullname')
    phone = data.get('phone')
    password = data.get('password')
    role = data.get('role', 'farmer')  # Default to farmer if not provided

    if not all([fullname, phone, password]):
        return jsonify({'error': 'Missing fields'}), 400
    
    # Validate role
    if role not in ['farmer', 'admin']:
        return jsonify({'error': 'Invalid role. Must be farmer or admin'}), 400

    conn = get_db_connection()
    try:
        with conn:
            conn.execute(
                'INSERT INTO users (fullname, phone, password, role) VALUES (?, ?, ?, ?)',
                (fullname, phone, password, role)
            )
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Phone number already exists'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    phone = data.get('phone')
    password = data.get('password')

    if not all([phone, password]):
        return jsonify({'error': 'Missing fields'}), 400

    conn = get_db_connection()
    user = conn.execute(
        'SELECT * FROM users WHERE phone = ? AND password = ?',
        (phone, password)
    ).fetchone()
    conn.close()

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
    else:
        return jsonify({'error': 'Invalid phone or password'}), 401

@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM products ORDER BY created_at DESC').fetchall()
    conn.close()
    
    products_list = [dict(row) for row in products]
    return jsonify(products_list), 200

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.get_json()
    
    name = data.get('name')
    category = data.get('category')
    product_type = data.get('type')
    price = data.get('price', 0)
    barter_desc = data.get('barterDesc', '')
    location = data.get('location')
    seller = data.get('seller', 'Unknown')
    description = data.get('desc', '')
    image_url = data.get('image_url', 'images/seed_pack.jpg')
    date_str = data.get('date', 'Just now')

    if not all([name, category, product_type, location]):
        return jsonify({'error': 'Missing required fields'}), 400

    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute(
                '''INSERT INTO products (name, category, type, price, barter_desc, location, seller, description, image_url, date)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                (name, category, product_type, price, barter_desc, location, seller, description, image_url, date_str)
            )
            product_id = cursor.lastrowid
        return jsonify({'message': 'Product listed successfully', 'id': product_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product_shared(product_id):
    conn = get_db_connection()
    try:
        cur = conn.execute('DELETE FROM products WHERE id = ?', (product_id,))
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({'error': 'Product not found'}), 404
        return jsonify({'message': 'Product deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/offers', methods=['POST'])
def create_offer():
    data = request.get_json()
    
    product_id = data.get('productId')
    buyer_name = data.get('buyerName')
    buyer_phone = data.get('buyerPhone')
    buyer_email = data.get('buyerEmail', '')
    offer_amount = data.get('offerAmount')
    barter_offer = data.get('barterOffer', '')
    message = data.get('message', '')

    if not all([product_id, buyer_name, buyer_phone]):
        return jsonify({'error': 'Missing required fields'}), 400

    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute(
                '''INSERT INTO offers (product_id, buyer_name, buyer_phone, buyer_email, offer_amount, barter_offer, message, status)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                (product_id, buyer_name, buyer_phone, buyer_email, offer_amount, barter_offer, message, 'pending')
            )
            offer_id = cursor.lastrowid
        return jsonify({'message': 'Offer sent successfully', 'id': offer_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Admin endpoints
@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    conn = get_db_connection()
    
    # Get user counts
    total_users = conn.execute('SELECT COUNT(*) as count FROM users').fetchone()['count']
    farmer_count = conn.execute('SELECT COUNT(*) as count FROM users WHERE role = "farmer"').fetchone()['count']
    admin_count = conn.execute('SELECT COUNT(*) as count FROM users WHERE role = "admin"').fetchone()['count']
    
    # Get product count
    total_products = conn.execute('SELECT COUNT(*) as count FROM products').fetchone()['count']
    
    conn.close()
    
    return jsonify({
        'totalUsers': total_users,
        'farmerCount': farmer_count,
        'adminCount': admin_count,
        'totalProducts': total_products
    }), 200

@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    conn = get_db_connection()
    users = conn.execute('SELECT id, fullname, phone, role, created_at FROM users ORDER BY created_at DESC').fetchall()
    conn.close()
    
    users_list = [dict(row) for row in users]
    return jsonify(users_list), 200

@app.route('/api/admin/products/<int:product_id>', methods=['DELETE'])
def delete_product_admin(product_id):
    # Reuse the same logic or just call the other function if internal
    return delete_product_shared(product_id)

@app.route('/api/admin/offers', methods=['GET'])
def get_all_offers():
    conn = get_db_connection()
    offers = conn.execute('''
        SELECT o.*, p.name as product_name, p.seller as seller_name, p.price as product_price, p.type as product_type
        FROM offers o
        JOIN products p ON o.product_id = p.id
        ORDER BY o.created_at DESC
    ''').fetchall()
    conn.close()
    
    offers_list = [dict(row) for row in offers]
    return jsonify(offers_list), 200

@app.route('/api/admin/offers/<int:offer_id>', methods=['PUT'])
def update_offer_status(offer_id):
    data = request.get_json()
    status = data.get('status')
    
    if status not in ['pending', 'accepted', 'rejected']:
        return jsonify({'error': 'Invalid status'}), 400

    conn = get_db_connection()
    try:
        cur = conn.execute('UPDATE offers SET status = ? WHERE id = ?', (status, offer_id))
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({'error': 'Offer not found'}), 404
        return jsonify({'message': 'Offer status updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('DEBUG', 'False').lower() == 'true')
