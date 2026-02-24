#!/bin/bash

# Farm Input App - Deployment Script
# This script helps set up GitHub repository and deployment

echo "🚀 Farm Input App - Deployment Setup"
echo "===================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Adding all files to git..."
git add .

echo "💾 Creating initial commit..."
git commit -m "Initial commit: Farm Input App - Complete farming marketplace

Features:
- User authentication (Farmer/Admin)
- Product marketplace with cash/barter options
- Admin dashboard with user/product management
- Purchase request system
- Responsive design with Tailwind CSS

Tech Stack:
- Backend: Python Flask + SQLite
- Frontend: HTML/CSS/JS
- Database: SQLite with proper schema"

echo "✅ Local git repository ready!"
echo ""
echo "📋 Next Steps:"
echo "1. Create a new repository on GitHub (https://github.com/new)"
echo "2. Copy the repository URL"
echo "3. Run: git remote add origin <your-repo-url>"
echo "4. Run: git push -u origin main"
echo ""
echo "🌐 For hosting options, see the README.md file"