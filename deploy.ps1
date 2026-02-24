# Farm Input App - Deployment Script (Windows)
# This script helps set up GitHub repository and deployment

Write-Host "🚀 Farm Input App - Deployment Setup" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Check if git is initialized
if (!(Test-Path ".git")) {
    Write-Host "❌ Git repository not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Adding all files to git..." -ForegroundColor Yellow
git add .

Write-Host "💾 Creating initial commit..." -ForegroundColor Yellow
git commit -m @"
Initial commit: Farm Input App - Complete farming marketplace

Features:
- User authentication (Farmer/Admin)
- Product marketplace with cash/barter options
- Admin dashboard with user/product management
- Purchase request system
- Responsive design with Tailwind CSS

Tech Stack:
- Backend: Python Flask + SQLite
- Frontend: HTML/CSS/JS
- Database: SQLite with proper schema
"@

Write-Host "✅ Local git repository ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Create a new repository on GitHub (https://github.com/new)" -ForegroundColor White
Write-Host "2. Copy the repository URL" -ForegroundColor White
Write-Host "3. Run: git remote add origin <your-repo-url>" -ForegroundColor White
Write-Host "4. Run: git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "🌐 For hosting options, see the README.md file" -ForegroundColor Cyan