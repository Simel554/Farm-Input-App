/**
 * Handles the registration form submission
 */
async function handleRegister(e) {
    e.preventDefault();
    
    // Retrieve values
    const fullname = document.getElementById('fullname').value;
    const phone = document.getElementById('r_phone').value;
    const pass = document.getElementById('r_password').value;
    const confirmPass = document.getElementById('r_confirm_password').value;
    
    // Get role safely (defaults to 'farmer' if nothing checked)
    const roleEl = document.querySelector('input[name="role"]:checked');
    const role = roleEl ? roleEl.value : 'farmer';

    // --- FRONTEND VALIDATION ---
    
    if (phone.length < 9) {
        alert("Please enter a valid Kenyan phone number.");
        return;
    }

    if (pass !== confirmPass) {
        alert("Passwords do not match!");
        return;
    }

    if (pass.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    // UI Loading State
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating Account...';
    btn.disabled = true; 
    btn.classList.add('opacity-75', 'cursor-not-allowed');

    try {
        // 
        // Hit the Flask API endpoint using a relative path
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullname: fullname,
                phone: phone,
                password: pass,
                role: role
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Success Feedback
            alert(`Account created successfully for ${fullname}! Redirecting to Login...`);
            
            // REDIRECTION FIX: 
            // Use the Flask route '/login' defined in app.py
            window.location.href = '/login'; 
            
        } else {
            // Handle server-side errors (e.g., "Phone number already exists")
            alert(data.error || 'Registration failed. Please try again.');
        }

    } catch (error) {
        console.error('Registration Error:', error);
        alert('Could not connect to the server. Please ensure your Python backend is running.');
    } finally {
        // Reset UI state
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.classList.remove('opacity-75', 'cursor-not-allowed');
    }
}

/**
 * Toggles visibility of the password fields
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