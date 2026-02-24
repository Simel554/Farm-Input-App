# Farm Input App - Shamba Trade Kenya

A comprehensive farming marketplace platform built with Flask (backend) and vanilla JavaScript (frontend) for Kenyan farmers.

## Features

- **User Authentication**: Farmer and Admin login system
- **Marketplace**: Browse and list farm products (cash and barter)
- **Admin Dashboard**: Manage users, products, and purchase requests
- **Purchase Requests**: Buyers can make offers on products
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Backend**: Python Flask with SQLite database
- **Frontend**: HTML, CSS (Tailwind), JavaScript
- **Database**: SQLite with SQLAlchemy-style queries

## Getting Started

### Prerequisites
- Python 3.8+
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/farm-input-app.git
cd farm-input-app
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r backend/requirements.txt
```

4. Initialize database:
```bash
cd backend
python create_test_users.py
```

5. Run the application:
```bash
# Backend (in one terminal)
python app.py

# Frontend (in another terminal)
cd ../frontend
python -m http.server 3000
```

6. Open browser to `http://localhost:3000`

## Test Accounts

**Farmer Account:**
- Phone: 712345678
- Password: farmer123

**Admin Account:**
- Phone: 700000000
- Password: admin123

## Project Structure

```
farm-input-app/
├── backend/
│   ├── app.py              # Flask API server
│   ├── database.py         # Database setup and utilities
│   ├── create_test_users.py # Test data creation
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── admin/              # Admin dashboard
│   ├── user/               # User marketplace
│   └── shared/             # Shared components
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `DELETE /api/products/<id>` - Delete product

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - All users
- `GET /api/admin/offers` - Purchase requests
- `PUT /api/admin/offers/<id>` - Update request status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.