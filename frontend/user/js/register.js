async function handleRegister(e) {
    e.preventDefault();
    const fullname = document.getElementById('fullname').value;
    const phone = document.getElementById('r_phone').value;
    const pass = document.getElementById('r_password').value;
    const confirmPass = document.getElementById('r_confirm_password').value;
    const role = document.querySelector('input[name="role"]:checked').value;

    // Simple Validation
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

    // Loading State
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating Account...';
    btn.classList.add('opacity-75', 'cursor-not-allowed');

    try {
        const response = await fetch('http://localhost:5000/api/register', {
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
            alert(`Account created successfully for ${fullname}! Redirecting to Login...`);
            window.location.href = 'login.html';
        } else {
            alert(data.error || 'Registration failed. Please try again.');
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
