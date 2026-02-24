import sqlite3
import os

DB_NAME = "farm_app.db"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    with conn:
        # Users Table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fullname TEXT NOT NULL,
                phone TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'farmer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Products Table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                type TEXT NOT NULL,
                price REAL DEFAULT 0,
                barter_desc TEXT,
                location TEXT NOT NULL,
                seller TEXT NOT NULL,
                description TEXT,
                image_url TEXT,
                date TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Offers/Requests Table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS offers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                buyer_name TEXT NOT NULL,
                buyer_phone TEXT NOT NULL,
                buyer_email TEXT,
                offer_amount REAL,
                barter_offer TEXT,
                message TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products (id)
            )
        ''')
        
    # Seed Products if empty
    cursor = conn.execute('SELECT COUNT(*) FROM products')
    if cursor.fetchone()[0] == 0:
        seed_products(conn)
        
    conn.close()
    print(f"Database {DB_NAME} initialized.")

def seed_products(conn):
    products = [
        ("90kg Maize Bag", "Cereals", "cash", 4500, "", "Eldoret", "John K.", "Dry maize, harvested last week. Good for milling.", "images/maize.png", "2 hrs ago"),
        ("Dairy Cow (Fresian)", "Livestock", "barter", 0, "Looking for a Motorcycle or 30 bags of cement", "Nakuru", "Mama Wanjiku", "Healthy heifer, 2 years old.", "images/cow.png", "5 hrs ago"),
        ("Yellow Beans (100kg)", "Vegetables", "cash", 12000, "", "Machakos", "Peter M.", "Clean yellow beans, no weevils.", "images/yellowbeans.png", "1 day ago"),
        ("DAP Fertilizer", "Inputs (Fertilizer/Seeds)", "barter", 0, "Will trade 2 bags of DAP for 3 bags of Charcoal", "Nairobi", "AgroVet Ltd", "Excess stock, unopened bags.", "images/dapfertiliser.png", "2 days ago"),
        ("Second hand Jembe & Panga", "Tools/Machinery", "cash", 800, "", "Kisumu", "Ochieng", "Selling as a set. Good condition.", "images/tools.png", "3 hrs ago"),
        ("Pishori Rice (Mwea)", "Cereals", "cash", 200, "", "Nairobi", "Mwea Traders", "Pure pishori rice, price is per KG.", "images/pishoririce.png", "Just now"),
        ("Black Beans (100kg)", "Vegetables", "cash", 12000, "", "Machakos", "Joseph Kamau.", "Best black beans on the market.", "images/blackbeans.png", "1 day ago"),
        ("Red Onions (Net)", "Vegetables", "cash", 1500, "", "Nyeri", "Karanja Farms", "Fresh red onions, medium size.", "images/redonions.png", "4 hrs ago"),
        ("Wheelbarrow (Heavy Duty)", "Tools/Machinery", "cash", 4500, "", "Thika", "Hardware City", "Brand new, heavy gauge.", "images/wheelbarrow.png", "1 day ago"),
        ("Goat (Male)", "Livestock", "cash", 7000, "", "Kajiado", "Ole Lenku", "Healthy male goat, 1 year old.", "images/malegoat.png", "6 hrs ago"),
        ("Kales (Sukuma Wiki)", "Vegetables", "cash", 500, "", "Kiambu", "Mama Mboga", "Large sack of fresh kales.", "images/kales.png", "30 mins ago"),
        ("Chicken (Kienyeji)", "Livestock", "cash", 1200, "", "Kakamega", "Ingo Poultry", "Pure Kienyeji rooster.", "images/chicken.png", "2 days ago"),
        ("CAN Fertilizer", "Inputs (Fertilizer/Seeds)", "cash", 3800, "", "Eldoret", "Farmers Choice", "50kg bag, top dressing.", "images/canfertilizer.png", "5 hrs ago"),
        ("Sprayer (Knapsack)", "Tools/Machinery", "cash", 2500, "", "Nakuru", "Agro Tools", "16L manual sprayer.", "images/sprayer.png", "1 week ago"),
        ("Water Pump (Petrol)", "Tools/Machinery", "barter", 0, "Exchange for 2 Dairy Goats", "Mwea", "Irrigation Solutions", "3 inch water pump, slightly used.", "images/waterpump.png", "2 weeks ago"),
        ("Sweet Potatoes (90kg)", "Vegetables", "cash", 3500, "", "Kabondo", "Sweet Roots", "Red fleshed sweet potatoes.", "images/sweetpotatoes.png", "3 days ago"),
        ("Sorghum - White", "Cereals", "cash", 4000, "", "Siaya", "Lake Basin", "Clean sorghum for brewing or porridge.", "images/sorghum.png", "4 hrs ago"),
        ("Millet (Wimbi)", "Cereals", "cash", 6000, "", "Meru", "Highland Grains", "Brown millet, high quality.", "images/millet.png", "1 day ago"),
        ("Potatoes", "Vegetables", "cash", 2500, "", "Nyandarua", "Kinangop Farms", "Fresh harvest Shangi potatoes.", "images/potatoes.png", "2 hrs ago"),
        ("Cabbage", "Vegetables", "cash", 30, "", "Limuru", "Green Hills", "Large heads, price per piece.", "images/cabbage.png", "Just now"),
        ("Dairy Meal", "Inputs (Fertilizer/Seeds)", "cash", 2200, "", "Nairobi", "Feeds Kenya", "High yield dairy meal, 70kg.", "images/dairymeal.png", "1 day ago"),
        ("Tomatoes (Crate)", "Vegetables", "cash", 8000, "", "Kirinyaga", "Red Golds", "Large crate of ripe tomatoes.", "images/tomato.png", "5 hrs ago"),
        ("Napier Grass", "Inputs (Fertilizer/Seeds)", "cash", 1500, "", "Muranga", "Fodder Mart", "Pickup truck full of napier grass.", "images/napiergrass.png", "6 hrs ago"),
        ("Charcoal Bags", "Inputs (Fertilizer/Seeds)", "barter", 0, "Looking for Maize or Beans", "Kitui", "Energy Source", "Large bags of charcoal.", "images/charcoalbag.png", "2 days ago")
    ]
    
    with conn:
        conn.executemany('''
            INSERT INTO products (name, category, type, price, barter_desc, location, seller, description, image_url, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', products)
    print(f"Seeded {len(products)} products.")

if __name__ == "__main__":
    init_db()
