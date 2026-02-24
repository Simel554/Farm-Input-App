from database import get_db_connection

def create_test_users():
    conn = get_db_connection()
    
    # Test accounts
    test_users = [
        ("John Farmer", "712345678", "farmer123", "farmer"),
        ("Admin User", "700000000", "admin123", "admin")
    ]
    
    try:
        with conn:
            for fullname, phone, password, role in test_users:
                try:
                    conn.execute(
                        'INSERT INTO users (fullname, phone, password, role) VALUES (?, ?, ?, ?)',
                        (fullname, phone, password, role)
                    )
                    print(f"Created {role} account: {fullname} (phone: {phone})")
                except Exception as e:
                    print(f"Failed to create {fullname}: {e}")
        
        print("\n=== Test Accounts Created ===")
        print("\nFARMER ACCOUNT:")
        print("  Phone: 712345678")
        print("  Password: farmer123")
        print("  Redirects to Market page\n")
        
        print("ADMIN ACCOUNT:")
        print("  Phone: 700000000")
        print("  Password: admin123")
        print("  Redirects to Admin dashboard\n")
        
    finally:
        conn.close()

if __name__ == "__main__":
    create_test_users()
