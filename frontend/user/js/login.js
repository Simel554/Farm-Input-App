// Role state
let selectedRole = 'farmer';

/**
 * Handles switching UI styles between Farmer and Admin tabs
 */
function selectRole(role) {
    selectedRole = role;
    const farmerTab = document.getElementById('farmer-tab');
    const adminTab = document.getElementById('admin-tab');

    if (!farmerTab || !adminTab) return;

    if (role === 'farmer') {
        // Active Farmer Tab
        farmerTab.className = 'flex-1 py-3 px-4 rounded-md font-bold transition-all duration-200 bg-kenyagreen-600 text-white shadow-md';
        adminTab.className = 'flex-1 py-3 px-4 rounded-md font-bold transition-all duration-200 bg-transparent text-gray-600 hover:bg-gray-200';
    } else {
        // Active Admin Tab
        farmerTab.className = 'flex-1 py-3 px-4 rounded-md font-bold transition-all duration-200 bg-transparent text-gray-600 hover:bg-gray-200';
        adminTab.className = 'flex-1 py-3 px-4 rounded-md font-bold transition-all duration-200 bg-kenyagreen-600 text-white shadow-md';
    }
}

/**
 * Handles the login form submission
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const phoneInput = document.getElementById('phone');
    const passInput = document.getElementById('password');
    
    if (!phoneInput || !passInput) return;

    const phone = phoneInput.value;
    const pass = passInput.value;

    // Simple Kenyan phone number validation (assuming format like 0712345678 or 712345678)
    if (phone.length < 9) {
        alert("Please enter a valid Kenyan phone number.");
        return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    // UI Loading State
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Verifying...';
    btn.disabled = true;
    btn.classList.add('opacity-75', 'cursor-not-allowed');

    try {
        // Use relative path '/api/login' to hit the Flask backend on the same origin
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: phone,
                password: pass
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Store user info for session management in local storage
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            // REDIRECTION FIX: 
            // We use the Flask endpoint paths.
            // '/admin' serves the admin dashboard.
            // '/market' (or '/index') serves index.html via Flask.
            if (data.user.role === 'admin') {
                window.location.href = '/admin'; 
            } else {
                window.location.href = '/market'; 
            }
        } else {
            // Show specific error from server (e.g., "Invalid phone or password")
            alert(data.error || 'Login failed. Please check your credentials.');
        }

    } catch (error) {
        console.error('Login Error:', error);
        alert('Could not connect to the server. Please ensure your Python app.py is running on http://127.0.0.1:5000');
    } finally {
        // Reset UI state
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.classList.remove('opacity-75', 'cursor-not-allowed');
    }
}

/**
 * Toggles visibility of the password field
 */
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        icon.classList.add('text-kenyagreen-600');
    } else {
        input.type = "password";
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        icon.classList.remove('text-kenyagreen-600');
    }
}