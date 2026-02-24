// Admin Panel JavaScript

// Current view state
let currentView = 'dashboard';

// API Base URL
const API_URL = 'http://localhost:5000/api';

// Load Dashboard Stats
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/admin/stats`);
        const stats = await response.json();

        // Update dashboard cards
        document.querySelector('#total-users').textContent = stats.totalUsers || 0;
        document.querySelector('#total-products').textContent = stats.totalProducts || 0;
        document.querySelector('#farmer-count').textContent = stats.farmerCount || 0;
        document.querySelector('#admin-count').textContent = stats.adminCount || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load Users
async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/admin/users`);
        const users = await response.json();

        const tableBody = document.getElementById('users-table-body');
        tableBody.innerHTML = '';

        users.forEach(user => {
            const roleClass = user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700';
            const roleIcon = user.role === 'admin' ? 'fa-user-shield' : 'fa-seedling';
            const date = new Date(user.created_at).toLocaleDateString();

            tableBody.innerHTML += `
                <tr class="hover:bg-gray-50 transition">
                    <td class="px-6 py-4 font-bold text-gray-800">${user.fullname}</td>
                    <td class="px-6 py-4 text-gray-600">${user.phone}</td>
                    <td class="px-6 py-4">
                        <span class="${roleClass} px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                            <i class="fa-solid ${roleIcon}"></i> ${user.role}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-gray-500 text-sm">${date}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load Products
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();

        const tableBody = document.getElementById('products-table-body');
        tableBody.innerHTML = '';

        products.forEach(product => {
            const typeClass = product.type === 'cash' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700';
            const priceDisplay = product.type === 'cash' ? `KSh ${product.price}` : 'Barter';

            tableBody.innerHTML += `
                <tr class="hover:bg-gray-50 transition" id="product-row-${product.id}">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <img src="../user/${product.image_url}" alt="${product.name}" class="w-12 h-12 rounded object-cover" onerror="this.src='../user/images/seed_pack.jpg'">
                            <div>
                                <p class="font-bold text-gray-800">${product.name}</p>
                                <p class="text-xs text-gray-500">${product.category}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-600">${product.seller}</td>
                    <td class="px-6 py-4">
                        <span class="${typeClass} px-2 py-1 rounded-full text-xs font-bold">${priceDisplay}</span>
                    </td>
                    <td class="px-6 py-4 text-gray-600">${product.location}</td>
                    <td class="px-6 py-4 text-right space-x-2">
                        <button onclick="deleteProduct(${product.id})" class="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded transition" title="Delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load Requests
async function loadRequests() {
    try {
        const response = await fetch(`${API_URL}/admin/offers`);
        const offers = await response.json();

        const tableBody = document.getElementById('requests-table-body');
        tableBody.innerHTML = '';

        offers.forEach(offer => {
            const statusClass = {
                'pending': 'bg-yellow-100 text-yellow-700',
                'accepted': 'bg-green-100 text-green-700',
                'rejected': 'bg-red-100 text-red-700'
            }[offer.status] || 'bg-gray-100 text-gray-700';

            const offerDisplay = offer.product_type === 'cash' 
                ? `KSh ${offer.offer_amount || 'N/A'}` 
                : offer.barter_offer || 'Barter offer';

            const date = new Date(offer.created_at).toLocaleDateString();

            tableBody.innerHTML += `
                <tr class="hover:bg-gray-50 transition" id="request-row-${offer.id}">
                    <td class="px-6 py-4">
                        <div>
                            <p class="font-bold text-gray-800">${offer.product_name}</p>
                            <p class="text-xs text-gray-500">Seller: ${offer.seller_name}</p>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <div>
                            <p class="font-bold text-gray-800">${offer.buyer_name}</p>
                            <p class="text-xs text-gray-500">${offer.buyer_phone}</p>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <p class="text-sm text-gray-700">${offerDisplay}</p>
                        ${offer.message ? `<p class="text-xs text-gray-500 mt-1">"${offer.message}"</p>` : ''}
                    </td>
                    <td class="px-6 py-4">
                        <span class="${statusClass} px-2 py-1 rounded-full text-xs font-bold capitalize">${offer.status}</span>
                    </td>
                    <td class="px-6 py-4 text-gray-500 text-sm">${date}</td>
                    <td class="px-6 py-4 text-right space-x-2">
                        ${offer.status === 'pending' ? `
                            <button onclick="updateOfferStatus(${offer.id}, 'accepted')" class="text-green-500 hover:text-green-700 bg-green-50 p-2 rounded transition" title="Accept">
                                <i class="fa-solid fa-check"></i>
                            </button>
                            <button onclick="updateOfferStatus(${offer.id}, 'rejected')" class="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded transition" title="Reject">
                                <i class="fa-solid fa-times"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading requests:', error);
    }
}

// Delete Product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/products/${productId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Product deleted successfully');
            // Remove row from table
            const row = document.getElementById(`product-row-${productId}`);
            if (row) {
                row.style.opacity = '0.5';
                setTimeout(() => row.remove(), 300);
            }
            // Reload stats
            loadDashboardStats();
        } else {
            const data = await response.json();
            showToast(data.error || 'Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('An error occurred');
    }
}

// Update Offer Status
async function updateOfferStatus(offerId, status) {
    try {
        const response = await fetch(`${API_URL}/admin/offers/${offerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: status })
        });

        if (response.ok) {
            showToast(`Offer ${status} successfully`);
            // Reload requests
            loadRequests();
        } else {
            const data = await response.json();
            showToast(data.error || `Failed to ${status} offer`);
        }
    } catch (error) {
        console.error('Error updating offer status:', error);
        showToast('An error occurred');
    }
}

// Switch Views
function switchView(viewName) {
    currentView = viewName;

    // Hide all views
    document.querySelectorAll('.admin-view').forEach(view => view.classList.add('hidden'));

    // Show selected view
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) targetView.classList.remove('hidden');

    // Update navigation active state
    document.querySelectorAll('aside nav a').forEach(link => {
        link.classList.remove('bg-kenyagreen-600', 'border-l-4', 'border-yellow-400', 'text-white');
        link.classList.add('text-gray-300');
    });

    const activeLink = document.querySelector(`aside nav a[onclick="switchView('${viewName}')"]`);
    if (activeLink) {
        activeLink.classList.add('bg-kenyagreen-600', 'border-l-4', 'border-yellow-400', 'text-white');
        activeLink.classList.remove('text-gray-300');
    }

    // Update header title
    const titles = {
        'dashboard': 'Dashboard Overview',
        'users': 'User Management',
        'products': 'Product Management',
        'requests': 'Purchase Requests'
    };
    const headerTitle = document.querySelector('header h2');
    if (headerTitle) headerTitle.textContent = titles[viewName] || 'Admin Panel';

    // Load data for view
    if (viewName === 'users') {
        loadUsers();
    } else if (viewName === 'products') {
        loadProducts();
    } else if (viewName === 'requests') {
        loadRequests();
    }
}

// Toast Notification
function showToast(msg) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-message');
    if (toast && msgEl) {
        msgEl.textContent = msg;
        toast.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }
}

// Load User Profile
function loadAdminProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser && currentUser.fullname) {
        // Get initials
        const initials = currentUser.fullname
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

        // Update avatar and name in header
        const avatarImg = document.querySelector('header img');
        const userName = document.querySelector('header .text-sm.font-bold');

        if (avatarImg) {
            avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullname)}&background=004d00&color=fff`;
        }

        if (userName) {
            userName.textContent = currentUser.fullname;
        }
    }
}

// Initialize
window.onload = () => {
    loadDashboardStats();
    loadAdminProfile();
    switchView('dashboard');
};
