// --- DATA & STATE ---

// Init Data
let listings = [];
// In a real app, we would have user authentication. Here we simulate "My Items" by storing IDs.
let myListings = JSON.parse(localStorage.getItem('agroMyListings')) || [];
let offers = JSON.parse(localStorage.getItem('agroOffers')) || [];

async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        listings = await response.json();
        renderMarket();
    } catch (error) {
        console.error('Error loading products:', error);
        const grid = document.getElementById('market-grid');
        if (grid) {
            grid.innerHTML = '<p class="text-red-500 text-center col-span-full">Failed to load market listings. Please try again later.</p>';
        }
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
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(el => el.classList.add('hidden'));
    
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
    if (amount === undefined || amount === null) return 'KSh 0';
    return 'KSh ' + amount.toLocaleString();
}

// Market Rendering
function renderMarket() {
    const grid = document.getElementById('market-grid');
    if (!grid) return;

    const searchInput = document.getElementById('search-input');
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    
    const filterType = document.getElementById('filter-type');
    const filterLoc = document.getElementById('filter-location');
    
    const typeFilter = filterType ? filterType.value : 'all';
    const locFilter = filterLoc ? filterLoc.value : 'all';

    grid.innerHTML = '';

    const filtered = listings.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search) || 
                              (item.category && item.category.toLowerCase().includes(search));
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        const matchesLoc = locFilter === 'all' || item.location === locFilter;
        return matchesSearch && matchesType && matchesLoc;
    });

    const emptyMarket = document.getElementById('empty-market');
    if (filtered.length === 0) {
        if (emptyMarket) emptyMarket.classList.remove('hidden');
    } else {
        if (emptyMarket) emptyMarket.classList.add('hidden');

        filtered.forEach(item => {
            let priceDisplay = '';
            let badge = '';
            let btnText = '';
            let btnColor = '';

            if (item.type === 'cash') {
                priceDisplay = '<span class="text-xl font-bold text-kenyagreen-700">' + formatCurrency(item.price) + '</span>';
                badge = '<span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">For Sale</span>';
                btnText = 'Buy Now';
                btnColor = 'bg-kenyagreen-600 hover:bg-kenyagreen-700';
            } else {
                const bDesc = item.barter_desc || item.barterDesc || 'Trade requested';
                priceDisplay = '<span class="text-sm font-bold text-purple-700">Exchange:</span> <span class="text-sm text-gray-600 italic line-clamp-2">' + bDesc + '</span>';
                badge = '<span class="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-bold">Barter / Trade</span>';
                btnText = 'Make Offer';
                btnColor = 'bg-purple-600 hover:bg-purple-700';
            }

            const isMine = myListings.includes(item.id);
            let actionBtn = '';

            if (isMine) {
                actionBtn = '<button disabled class="w-full py-2 bg-gray-200 text-gray-500 rounded font-medium cursor-not-allowed">Your Item</button>';
            } else {
                actionBtn = '<button onclick="openTradeModal(' + item.id + ')" class="w-full py-2 ' + btnColor + ' text-white rounded font-bold transition shadow">' + btnText + '</button>';
            }

            let imagePath = item.image_url || 'images/seed_pack.jpg';
            if (!imagePath.startsWith('/user/') && !imagePath.startsWith('http')) {
                const cleanName = imagePath.replace('images/', '');
                imagePath = '/user/images/' + cleanName;
            }

            const card = '<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300 flex flex-col h-full">' +
                '<div class="flex-1">' +
                    '<div class="h-40 w-full overflow-hidden bg-gray-100 relative">' +
                        '<img src="' + imagePath + '" alt="' + item.name + '" onerror="this.src=\'/user/images/seed_pack.jpg\'" class="w-full h-full object-cover">' +
                        '<div class="absolute top-2 left-2 flex gap-1">' +
                            '<span class="bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] px-2 py-1 rounded-full uppercase tracking-wide font-bold shadow-sm">' + (item.category || 'General') + '</span>' +
                        '</div>' +
                        '<div class="absolute top-2 right-2">' + badge + '</div>' +
                    '</div>' +
                    '<div class="p-4 flex-1">' +
                        '<h3 class="font-bold text-gray-800 mb-1 leading-tight text-lg line-clamp-1">' + item.name + '</h3>' +
                        '<div class="flex items-center text-xs text-gray-500 mb-3">' +
                            '<i class="fa-solid fa-location-dot mr-1"></i> ' + item.location +
                            '<span class="mx-2 text-gray-300">•</span>' +
                            '<i class="fa-regular fa-clock mr-1"></i> ' + (item.date || 'Today') +
                        '</div>' +
                        '<p class="text-sm text-gray-600 mb-4 line-clamp-2 h-10">' + (item.description || item.desc || 'No description provided.') + '</p>' +
                        '<div class="mb-0">' + priceDisplay + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="p-4 border-t border-gray-100 bg-gray-50">' + actionBtn + '</div>' +
            '</div>';
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
        container.innerHTML = '<p class="text-gray-500 italic">You haven\'t listed any items yet.</p>';
    } else {
        myItems.forEach(item => {
            container.innerHTML += '<div class="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">' +
                '<div>' +
                    '<h4 class="font-bold text-gray-800">' + item.name + '</h4>' +
                    '<p class="text-xs text-gray-500">' + (item.date || 'Active') + '</p>' +
                '</div>' +
                '<button onclick="deleteListing(' + item.id + ')" class="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition">' +
                    '<i class="fa-solid fa-trash"></i>' +
                '</button>' +
            '</div>';
        });
    }

    const offersContainer = document.getElementById('incoming-offers-container');
    if (!offersContainer) return;
    offersContainer.innerHTML = '';

    if (offers.length === 0) {
        offersContainer.innerHTML = '<div class="bg-blue-50 border border-blue-100 p-4 rounded-lg text-center text-blue-600"><p class="text-sm">No active offers yet.</p></div>';
    } else {
        offers.forEach(offer => {
            const item = listings.find(i => i.id === offer.itemId || i.id === offer.product_id);
            if (!item) return; 

            const offerText = offer.barter_offer || offer.barterOffer ? 'Offer: "' + (offer.barter_offer || offer.barterOffer) + '"' : 'Wants to buy for listed price';
            const sellerName = item.seller || 'Unknown Seller';

            offersContainer.innerHTML += '<div class="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">' +
                '<div class="flex justify-between items-start mb-2">' +
                    '<span class="text-xs font-bold text-gray-400 uppercase">Offer for: ' + item.name + '</span>' +
                    '<span class="text-xs text-gray-400">Just now</span>' +
                '</div>' +
                '<div class="flex items-center gap-2 text-sm text-gray-600 mb-2">' +
                    '<i class="fa-solid fa-user"></i> Seller: ' + sellerName +
                '</div>' +
                '<p class="font-bold text-gray-800 mb-2">' + offerText + '</p>' +
                '<div class="flex items-center gap-2 text-sm text-gray-600 mb-3">' +
                    '<i class="fa-solid fa-phone"></i> ' + (offer.buyer_phone || offer.phone || 'N/A') +
                '</div>' +
                '<div class="flex gap-2">' +
                    '<button onclick="removeOffer(' + offer.id + ')" class="flex-1 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">Accept</button>' +
                    '<button onclick="removeOffer(' + offer.id + ')" class="flex-1 py-1 bg-gray-100 text-gray-600 text-sm rounded hover:bg-gray-200">Decline</button>' +
                '</div>' +
            '</div>';
        });
    }
}

// --- MODAL LOGIC ---

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('hidden');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden');
}

function openSellModal() {
    const form = document.getElementById('sell-form');
    if (form) form.reset();
    togglePriceMode(); 
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
        if (priceDiv) priceDiv.classList.remove('hidden');
        if (barterDiv) barterDiv.classList.add('hidden');
        if (priceInput) priceInput.required = true;
        if (barterInput) barterInput.required = false;
    } else {
        if (priceDiv) priceDiv.classList.add('hidden');
        if (barterDiv) barterDiv.classList.remove('hidden');
        if (priceInput) priceInput.required = false;
        if (barterInput) barterInput.required = true;
    }
}

async function handleSellSubmit(e) {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('You must be logged in to sell items.');
        window.location.href = '/login';
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
        const response = await fetch('/api/products', {
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
            fetchProducts(); 
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
            const response = await fetch('/api/products/' + id, {
                method: 'DELETE'
            });

            if (response.ok) {
                showToast('Listing removed');
                myListings = myListings.filter(mid => mid !== id);
                saveData();
                fetchProducts(); 
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

function openTradeModal(itemId) {
    const item = listings.find(i => i.id === itemId);
    if (!item) return;

    const targetIdInput = document.getElementById('trade-target-id');
    const nameLabel = document.getElementById('trade-item-name');
    const locLabel = document.getElementById('trade-item-location');
    const title = document.getElementById('trade-modal-title');
    const subtitle = document.getElementById('trade-modal-subtitle');
    const iconContainer = document.getElementById('trade-icon-container');
    const priceDisplay = document.getElementById('trade-item-price');
    const barterSection = document.getElementById('barter-offer-section');
    const barterInput = document.getElementById('trade-offer-desc');

    if (targetIdInput) targetIdInput.value = itemId;
    if (nameLabel) nameLabel.innerText = item.name;
    if (locLabel) locLabel.innerText = item.location;

    if (item.type === 'cash') {
        if (title) title.innerText = "Contact Seller to Buy";
        if (subtitle) subtitle.innerText = "You are inquiring to buy this item with cash.";
        if (iconContainer) {
            iconContainer.innerHTML = '<i class="fa-solid fa-money-bill-wave text-2xl"></i>';
            iconContainer.className = "inline-block p-3 rounded-full bg-green-100 text-green-600 mb-3";
        }
        if (priceDisplay) priceDisplay.innerText = formatCurrency(item.price);
        if (barterSection) barterSection.classList.add('hidden');
        if (barterInput) barterInput.required = false;
    } else {
        if (title) title.innerText = "Make a Barter Offer";
        if (subtitle) subtitle.innerText = "Propose an exchange for this item.";
        if (iconContainer) {
            iconContainer.innerHTML = '<i class="fa-solid fa-right-left text-2xl"></i>';
            iconContainer.className = "inline-block p-3 rounded-full bg-purple-100 text-purple-600 mb-3";
        }
        const bDesc = item.barter_desc || item.barterDesc || 'Trade requested';
        if (priceDisplay) priceDisplay.innerText = 'Seeking: ' + bDesc;
        if (barterSection) barterSection.classList.remove('hidden');
        if (barterInput) barterInput.required = true;
    }

    openModal('trade-modal');
}

async function handleTradeSubmit(e) {
    e.preventDefault();
    
    const itemIdVal = document.getElementById('trade-target-id').value;
    const itemId = parseInt(itemIdVal);
    const item = listings.find(i => i.id === itemId);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert("Please login first to make an offer.");
        return;
    }

    const phoneInput = document.getElementById('trade-phone');
    const inputVal = phoneInput ? phoneInput.value.trim() : '';
    const buyerPhone = inputVal || currentUser.phone || '';

    if (!buyerPhone) {
        alert("Please provide a phone number so the seller can reach you.");
        return;
    }

    const offerDesc = document.getElementById('trade-offer-desc').value.trim();

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';
    btn.disabled = true;

    try {
        const offerData = {
            productId: itemId,
            buyerName: currentUser.fullname,
            buyerPhone: buyerPhone,
            buyerEmail: currentUser.email || '',
            message: item.type === 'cash' ? 'Interested in purchasing this item' : offerDesc
        };

        if (item.type === 'cash') {
            offerData.offerAmount = item.price;
        } else {
            offerData.barterOffer = offerDesc;
        }

        const response = await fetch('/api/offers', {
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

function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;
    
    toastMsg.innerText = msg;
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

function toggleProfileMenu() {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

document.addEventListener('click', function (event) {
    const profileContainer = document.getElementById('user-profile-container');
    const dropdown = document.getElementById('profile-dropdown');

    if (dropdown && !dropdown.classList.contains('hidden') &&
        profileContainer && !profileContainer.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser && currentUser.fullname) {
        const initials = currentUser.fullname
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

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

        const dropdownAvatar = document.getElementById('dropdown-avatar');
        const dropdownName = document.getElementById('dropdown-name');
        const dropdownPhone = document.getElementById('dropdown-phone');

        if (dropdownAvatar) dropdownAvatar.textContent = initials;
        if (dropdownName) dropdownName.textContent = currentUser.fullname;
        if (dropdownPhone) dropdownPhone.textContent = '+254 ' + currentUser.phone;

        loadUserStats();

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

function loadUserStats() {
    const listingsCount = myListings.length || 0;
    const tradesCount = offers.length || 0;

    const listingsElement = document.getElementById('user-listings-count');
    const tradesElement = document.getElementById('user-trades-count');

    if (listingsElement) listingsElement.textContent = listingsCount;
    if (tradesElement) tradesElement.textContent = tradesCount;
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('market-grid')) {
        fetchProducts();
        loadUserProfile();
    }
});
