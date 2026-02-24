// Role state
let selectedRole = 'farmer';

function selectRole(role) {
    selectedRole = role;
    const farmerTab = document.getElementById('farmer-tab');
    const adminTab = document.getElementById('admin-tab');

    if (role === 'farmer') {
        farmerTab.className = 'flex-1 py-3 px-4 rounded-md font-bold transition-all duration-200 bg-kenyagreen-600 text-white shadow-md';
        adminTab.className = 'flex-1 py-3 px-4 rounded-md font-bold transition-all duration-200 bg-transparent text-gray-600 hover:bg-gray-200';
    } else {
        farmerTab.className = 'flex-1 py-3 px-4 rounded-md font-bold transition-all duration-200 bg-transparent text-gray-600 hover:bg-gray-200';
        adminTab.className = 'flex-1 py-3 px-4 rounded-md font-bold transition-all duration-200 bg-purple-600 text-white shadow-md';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const phone = document.getElementById('phone').value;
    const pass = document.getElementById('password').value;

    // Simple Mock Validation
    if (phone.length < 9) {
        alert("Please enter a valid Kenyan phone number.");
        return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    // Loading State
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Verifying...';
    btn.classList.add('opacity-75', 'cursor-not-allowed');

    try {
        const response = await fetch('http://localhost:5000/api/login', {
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
            // Store user info
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            // Redirect based on role from backend
            if (data.user.role === 'admin') {
                window.location.href = '../admin/index.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            alert(data.error || 'Login failed. Please check your credentials.');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please check your connection.');
    } finally {
        btn.innerHTML = originalText;
        btn.classList.remove('opacity-75', 'cursor-not-allowed');
    }
}

function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
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
