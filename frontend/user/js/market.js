// --- DATA & STATE ---

// Mock Data specifically for Kenya
// --- DATA & STATE ---

// Init Data
let listings = [];
// In a real app, we would have user authentication. Here we simulate "My Items" by storing IDs.
let myListings = JSON.parse(localStorage.getItem('agroMyListings')) || [];
let offers = JSON.parse(localStorage.getItem('agroOffers')) || [];

async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        listings = await response.json();
        renderMarket();
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback or error state
        document.getElementById('market-grid').innerHTML = '<p class="text-red-500 text-center col-span-full">Failed to load market listings. Please try again later.</p>';
    }
}


// --- FUNCTIONS ---

function saveData() {
    localStorage.setItem('agroListings', JSON.stringify(listings));
    localStorage.setItem('agroMyListings', JSON.stringify(myListings));
    localStorage.setItem('agroOffers', JSON.stringify(offers));
}

// View Navigation
function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    const view = document.getElementById(`view-${viewName}`);
    if (view) view.classList.remove('hidden');

    if (viewName === 'market') renderMarket();
    if (viewName === 'selling') renderMyListings();
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('hidden');
}

function formatCurrency(amount) {
    return 'KSh ' + amount.toLocaleString();
}

// Market Rendering
function renderMarket() {
    const grid = document.getElementById('market-grid');
    if (!grid) return;

    const searchInput = document.getElementById('search-input');
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const typeFilter = document.getElementById('filter-type').value;
    const locFilter = document.getElementById('filter-location').value;

    grid.innerHTML = '';

    const filtered = listings.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search) || item.category.toLowerCase().includes(search);
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        const matchesLoc = locFilter === 'all' || item.location === locFilter;
        return matchesSearch && matchesType && matchesLoc;
    });

    if (filtered.length === 0) {
        document.getElementById('empty-market').classList.remove('hidden');
    } else {
        document.getElementById('empty-market').classList.add('hidden');

        filtered.forEach(item => {
            // Logic for display: Cash vs Barter
            let priceDisplay = '';
            let badge = '';
            let btnText = '';
            let btnColor = '';

            if (item.type === 'cash') {
                priceDisplay = `<span class="text-xl font-bold text-kenyagreen-700">${formatCurrency(item.price)}</span>`;
                badge = `<span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">For Sale</span>`;
                btnText = 'Buy Now';
                btnColor = 'bg-kenyagreen-600 hover:bg-kenyagreen-700';
            } else {
                priceDisplay = `<span class="text-sm font-bold text-purple-700">Exchange:</span> <span class="text-sm text-gray-600 italic line-clamp-2">${item.barterDesc}</span>`;
                badge = `<span class="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-bold">Barter / Trade</span>`;
                btnText = 'Make Offer';
                btnColor = 'bg-purple-600 hover:bg-purple-700';
            }

            // Check if it's my item
            const isMine = myListings.includes(item.id);
            let actionBtn = '';

            if (isMine) {
                actionBtn = `<button disabled class="w-full py-2 bg-gray-200 text-gray-500 rounded font-medium cursor-not-allowed">Your Item</button>`;
            } else {
                actionBtn = `<button onclick="openTradeModal(${item.id})" class="w-full py-2 ${btnColor} text-white rounded font-bold transition shadow">${btnText}</button>`;
            }

            const card = `
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300 flex flex-col h-full">
                    <div class="p-5 flex-1">
                        <div class="h-40 w-full overflow-hidden bg-gray-100 relative">
                            <img src="${item.image_url || 'images/seed_pack.jpg'}" alt="${item.name}" class="w-full h-full object-cover">
                            <div class="absolute top-2 left-2 flex gap-1">
                                <span class="bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] px-2 py-1 rounded-full uppercase tracking-wide font-bold shadow-sm">${item.category}</span>
                            </div>
                            <div class="absolute top-2 right-2">
                                ${badge}
                            </div>
                        </div>
                        <div class="p-4 flex-1">
                            <h3 class="font-bold text-gray-800 mb-1 leading-tight text-lg line-clamp-1">${item.name}</h3>
                            <div class="flex items-center text-xs text-gray-500 mb-3">
                                <i class="fa-solid fa-location-dot mr-1"></i> ${item.location}
                                <span class="mx-2 text-gray-300">•</span>
                                <i class="fa-regular fa-clock mr-1"></i> ${item.date}
                            </div>
                            <p class="text-sm text-gray-600 mb-4 line-clamp-2 h-10">${item.desc || 'No description provided.'}</p>
                            <div class="mb-0">
                                ${priceDisplay}
                            </div>
                        </div>
                    </div>
                    <div class="p-4 border-t border-gray-100 bg-gray-50">
                        ${actionBtn}
                    </div>
                </div>
            `;
            grid.innerHTML += card;
        });
    }
}

function renderMyListings() {
    const container = document.getElementById('my-listings-container');
    if (!container) return;
    container.innerHTML = '';

    const myItems = listings.filter(item => myListings.includes(item.id));

    if (myItems.length === 0) {
        container.innerHTML = `<p class="text-gray-500 italic">You haven't listed any items yet.</p>`;
    } else {
        myItems.forEach(item => {
            container.innerHTML += `
                <div class="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                    <div>
                        <h4 class="font-bold text-gray-800">${item.name}</h4>
                        <p class="text-xs text-gray-500">${item.date}</p>
                    </div>
                    <button onclick="deleteListing(${item.id})" class="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
        });
    }

    // Render Offers
    const offersContainer = document.getElementById('incoming-offers-container');
    if (!offersContainer) return;
    offersContainer.innerHTML = '';

    if (offers.length === 0) {
        offersContainer.innerHTML = `<div class="bg-blue-50 border border-blue-100 p-4 rounded-lg text-center text-blue-600"><p class="text-sm">No active offers yet.</p></div>`;
    } else {
        offers.forEach(offer => {
            const item = listings.find(i => i.id === offer.itemId);
            if (!item) return; // Item deleted

            const offerText = offer.type === 'cash' ? `Wants to buy for listed price` : `Offer: "${offer.offerDesc}"`;

            offersContainer.innerHTML += `
                <div class="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-xs font-bold text-gray-400 uppercase">Offer for: ${item.name}</span>
                        <span class="text-xs text-gray-400">Just now</span>
                    </div>
                    <p class="font-bold text-gray-800 mb-2">${offerText}</p>
                    <div class="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <i class="fa-solid fa-phone"></i> ${offer.phone}
                    </div>
                    <div class="flex gap-2">
                        <button onclick="removeOffer(${offer.id})" class="flex-1 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">Accept</button>
                        <button onclick="removeOffer(${offer.id})" class="flex-1 py-1 bg-gray-100 text-gray-600 text-sm rounded hover:bg-gray-200">Decline</button>
                    </div>
                </div>
            `;
        });
    }
}

// --- MODAL LOGIC ---

function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

// Selling Logic
function openSellModal() {
    document.getElementById('sell-form').reset();
    togglePriceMode(); // Reset to cash inputs
    openModal('sell-modal');
}

function togglePriceMode() {
    const typeRadio = document.querySelector('input[name="transType"]:checked');
    if (!typeRadio) return;

    const type = typeRadio.value;
    const priceDiv = document.getElementById('price-input-container');
    const barterDiv = document.getElementById('barter-input-container');
    const priceInput = document.getElementById('item-price');
    const barterInput = document.getElementById('item-barter-desc');

    if (type === 'cash') {
        priceDiv.classList.remove('hidden');
        barterDiv.classList.add('hidden');
        priceInput.required = true;
        barterInput.required = false;
    } else {
        priceDiv.classList.add('hidden');
        barterDiv.classList.remove('hidden');
        priceInput.required = false;
        barterInput.required = true;
    }
}

async function handleSellSubmit(e) {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('You must be logged in to sell items.');
        window.location.href = 'login.html';
        return;
    }

    const name = document.getElementById('item-name').value;
    const category = document.getElementById('item-category').value;
    const location = document.getElementById('item-location').value;
    const type = document.querySelector('input[name="transType"]:checked').value;
    const desc = document.getElementById('item-desc').value;

    let price = 0;
    let barterDesc = '';

    if (type === 'cash') {
        price = parseFloat(document.getElementById('item-price').value);
    } else {
        barterDesc = document.getElementById('item-barter-desc').value;
    }

    const newItem = {
        name,
        category,
        type,
        price,
        barterDesc,
        location,
        seller: currentUser.fullname,
        desc,
        date: 'Just now'
    };

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Listing...';
    btn.disabled = true;

    try {
        const response = await fetch('http://localhost:5000/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
        });

        if (response.ok) {
            const data = await response.json();
            if (data.id) {
                myListings.push(data.id);
                saveData();
            }
            closeModal('sell-modal');
            showToast('Item listed successfully!');
            fetchProducts(); // Refresh the list
            switchView('market');
        } else {
            const err = await response.json();
            alert(err.error || 'Failed to list item.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error. Please try again.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function deleteListing(id) {
    if (confirm('Remove this listing?')) {
        try {
            const response = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showToast('Listing removed');
                myListings = myListings.filter(mid => mid !== id);
                saveData();
                fetchProducts(); // Refresh lists
            } else {
                const err = await response.json();
                alert(err.error || 'Failed to delete listing.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Connection error.');
        }
    }
}

// Buying/Trading Logic
function openTradeModal(itemId) {
    const item = listings.find(i => i.id === itemId);
    if (!item) return;

    document.getElementById('trade-target-id').value = itemId;
    document.getElementById('trade-item-name').innerText = item.name;
    document.getElementById('trade-item-location').innerText = item.location;

    // Customize modal based on Cash vs Barter
    const title = document.getElementById('trade-modal-title');
    const sub = document.getElementById('trade-modal-subtitle');
    const icon = document.getElementById('trade-icon-container');
    const priceDisplay = document.getElementById('trade-item-price');
    const barterSection = document.getElementById('barter-offer-section');
    const barterInput = document.getElementById('trade-offer-desc');

    if (item.type === 'cash') {
        title.innerText = "Contact Seller to Buy";
        sub.innerText = "You are inquiring to buy this item with cash.";
        icon.innerHTML = '<i class="fa-solid fa-money-bill-wave text-2xl"></i>';
        icon.className = "inline-block p-3 rounded-full bg-green-100 text-green-600 mb-3";
        priceDisplay.innerText = formatCurrency(item.price);
        barterSection.classList.add('hidden');
        barterInput.required = false;
    } else {
        title.innerText = "Make a Barter Offer";
        sub.innerText = "Propose an exchange for this item.";
        icon.innerHTML = '<i class="fa-solid fa-right-left text-2xl"></i>';
        icon.className = "inline-block p-3 rounded-full bg-purple-100 text-purple-600 mb-3";
        priceDisplay.innerText = `Seeking: ${item.barterDesc}`;
        barterSection.classList.remove('hidden');
        barterInput.required = true;
    }

    openModal('trade-modal');
}

async function handleTradeSubmit(e) {
    e.preventDefault();
    const itemId = parseInt(document.getElementById('trade-target-id').value);
    const item = listings.find(i => i.id === itemId);
    const phone = document.querySelector('#trade-modal input[type="tel"]').value;
    const offerDesc = document.getElementById('trade-offer-desc').value;

    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please login first to make an offer.');
        return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';
    btn.disabled = true;

    try {
        // Prepare offer data based on item type
        const offerData = {
            productId: itemId,
            buyerName: currentUser.fullname,
            buyerPhone: phone,
            buyerEmail: currentUser.email || '',
            message: item.type === 'cash' ? 'Interested in purchasing this item' : offerDesc
        };

        if (item.type === 'cash') {
            offerData.offerAmount = item.price;
        } else {
            offerData.barterOffer = offerDesc;
        }

        const response = await fetch('http://localhost:5000/api/offers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(offerData)
        });

        if (response.ok) {
            closeModal('trade-modal');
            showToast('Request sent to seller successfully!');
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Failed to send offer.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error. Please try again.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Helper: Toast Notification
function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    document.getElementById('toast-message').innerText = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

function removeOffer(id) {
    offers = offers.filter(o => o.id !== id);
    saveData();
    renderMyListings();
    showToast('Offer handled');
}

// Toggle Profile Dropdown
function toggleProfileMenu() {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const profileContainer = document.getElementById('user-profile-container');
    const dropdown = document.getElementById('profile-dropdown');

    if (dropdown && !dropdown.classList.contains('hidden') &&
        profileContainer && !profileContainer.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

// Load User Profile
function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser && currentUser.fullname) {
        // Get initials from full name
        const initials = currentUser.fullname
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

        // Desktop view
        const userLoggedIn = document.getElementById('user-logged-in');
        const loginLink = document.getElementById('login-link');
        const userAvatar = document.getElementById('user-avatar');
        const userDisplayName = document.getElementById('user-display-name');

        if (userLoggedIn && loginLink && userAvatar && userDisplayName) {
            userAvatar.textContent = initials;
            userDisplayName.textContent = currentUser.fullname;
            loginLink.classList.add('hidden');
            userLoggedIn.classList.remove('hidden');
        }

        // Dropdown content
        const dropdownAvatar = document.getElementById('dropdown-avatar');
        const dropdownName = document.getElementById('dropdown-name');
        const dropdownPhone = document.getElementById('dropdown-phone');

        if (dropdownAvatar) dropdownAvatar.textContent = initials;
        if (dropdownName) dropdownName.textContent = currentUser.fullname;
        if (dropdownPhone) dropdownPhone.textContent = `+254 ${currentUser.phone}`;

        // Load user stats
        loadUserStats();

        // Mobile view
        const mobileLoggedIn = document.getElementById('mobile-logged-in');
        const mobileLoginLink = document.getElementById('mobile-login-link');
        const mobileUserAvatar = document.getElementById('mobile-user-avatar');
        const mobileUserName = document.getElementById('mobile-user-name');

        if (mobileLoggedIn && mobileLoginLink && mobileUserAvatar && mobileUserName) {
            mobileUserAvatar.textContent = initials;
            mobileUserName.textContent = currentUser.fullname;
            mobileLoginLink.classList.add('hidden');
            mobileLoggedIn.classList.remove('hidden');
        }
    }
}

// Load User Stats
function loadUserStats() {
    // Count from localStorage
    const listingsCount = myListings.length || 0;
    const tradesCount = offers.length || 0;

    const listingsElement = document.getElementById('user-listings-count');
    const tradesElement = document.getElementById('user-trades-count');

    if (listingsElement) listingsElement.textContent = listingsCount;
    if (tradesElement) tradesElement.textContent = tradesCount;
}

// Handle Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Init
window.onload = () => {
    // Only attempt render if elements exist
    if (document.getElementById('market-grid')) {
        fetchProducts();
        loadUserProfile();
    }
};
