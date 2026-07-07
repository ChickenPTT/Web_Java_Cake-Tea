// Global variable to store all food items from backend
let allFoodItems = [];
let allMenuItems = [];

// Render menu categories
function renderMenuCategories() {
    const menuContainer = document.getElementById('menu-categories');
    if (!menuContainer) return;

    // Use backend data if available, otherwise use local data
    const menuData = allMenuItems.length > 0 ? allMenuItems : menulist;

    menuContainer.innerHTML = menuData.map((item) => {
        const menuName = item.menuName || item.menu_name;
        const menuImage = item.menuImage || item.menu_image;
        const isActive = currentCategory === menuName ? 'active' : '';
        return `
            <div onclick="setCategory('${menuName}')" class="explore-menu-list-item">
                <img class="${isActive}" src="${menuImage}" alt="${menuName}">
                <p>${menuName}</p>
            </div>
        `;
    }).join('');
}

// Set category
function setCategory(category) {
    currentCategory = category === currentCategory ? 'All' : category;
    renderMenuCategories();
    renderFoodItems();
}

// Render food items
function renderFoodItems(itemsToRender = null) {
    const foodContainer = document.getElementById('food-list');
    if (!foodContainer) return;

    // Use provided items or fallback to current data
    let items = itemsToRender;
    
    // If no items provided, use local data or backend data
    if (!items) {
        if (allFoodItems.length > 0) {
            items = allFoodItems;
        } else {
            items = foodlist;
        }
    }

    // Filter by category if needed
    if (currentCategory !== 'All' && !itemsToRender) {
        items = items.filter(item => item.category === currentCategory);
    }

    foodContainer.innerHTML = items.map((item) => {
        const itemId = item.id || item._id;
        // Cart functionality will be implemented with Java backend
        const cartControl = `<img class="add" onclick="addToCart('${itemId}')" src="/user/assets/add_icon_green.png" alt="">`;

        return `
            <div class="food-item">
                <div class="food-item-img-container">
                    <img class="food-item-img" src="${item.image}" alt="${item.name}">
                    ${cartControl}
                </div>
                <div class="food-item-info">
                    <div class="food-item-name-rating">
                        <p>${item.name}</p>
                        <img src="/user/assets/rating_starts.jpg" alt="">
                    </div>
                    <p class="food-item-desc">${item.description}</p>
                    <p class="food-item-price">$${item.price}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Login popup functionality
let isLoginMode = true;

function showLoginPopup() {
    document.getElementById('login-popup').style.display = 'grid';
}

function closeLoginPopup() {
    document.getElementById('login-popup').style.display = 'none';
}

function toggleLoginMode() {
    isLoginMode = !isLoginMode;
    const title = document.getElementById('login-title');
    const nameInput = document.getElementById('name-input');
    const button = document.getElementById('login-button');
    const toggle = document.getElementById('login-toggle');

    if (isLoginMode) {
        title.textContent = 'Login';
        nameInput.style.display = 'none';
        button.textContent = 'Login';
        toggle.innerHTML = 'Create a new account? <span onclick="toggleLoginMode()">Click here!</span>';
    } else {
        title.textContent = 'Sign Up';
        nameInput.style.display = 'block';
        button.textContent = 'Create Account';
        toggle.innerHTML = 'Already have an account? <span onclick="toggleLoginMode()">Login here!</span>';
    }
}

// Handle login form submission
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    const name = document.getElementById('name-input').value;

    if (isLoginMode) {
        // Login logic - integrate with Java backend
        if (login(email, password)) {
            closeLoginPopup();
            updateAuthUI();
        }
    } else {
        // Sign up logic - integrate with Java backend
        if (name && email && password) {
            if (login(email, password)) {
                closeLoginPopup();
                updateAuthUI();
            }
        }
    }
});

// Update authentication UI
function updateAuthUI() {
    const signinBtn = document.getElementById('signin-btn');
    const navbarProfile = document.getElementById('navbar-profile');

    if (isLoggedIn()) {
        signinBtn.style.display = 'none';
        navbarProfile.style.display = 'block';
    } else {
        signinBtn.style.display = 'block';
        navbarProfile.style.display = 'none';
    }
}

// Refresh food items when data changes
function refreshFoodItems() {
    renderFoodItems();
}

// Search functionality
function handleSearch(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}

function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm.length > 0) {
        // Call backend API to search
        fetch(`/api/food/search?name=${encodeURIComponent(searchTerm)}`)
            .then(response => response.json())
            .then(data => {
                allFoodItems = data;
                renderFoodItems(data);
                currentCategory = 'All'; // Reset category filter
                renderMenuCategories();
            })
            .catch(error => {
                console.error('Error searching food:', error);
                // Fallback to local search if backend fails
                const localResults = foodlist.filter(item => 
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                renderFoodItems(localResults);
            });
    } else {
        // If search is empty, load all food from backend
        loadAllFood();
    }
}

function loadAllFood() {
    fetch('/api/food')
        .then(response => response.json())
        .then(data => {
            allFoodItems = data;
            renderFoodItems(data);
        })
        .catch(error => {
            console.error('Error loading food:', error);
            // Fallback to local data
            allFoodItems = [];
            renderFoodItems();
        });
}

function loadAllMenus() {
    fetch('/api/menu')
        .then(response => response.json())
        .then(data => {
            allMenuItems = data;
            renderMenuCategories();
        })
        .catch(error => {
            console.error('Error loading menus:', error);
            // Fallback to local data
            allMenuItems = [];
            renderMenuCategories();
        });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // loadAllMenus(); // Load menus from backend on page load
    // loadAllFood(); // Load food from backend on page load
    renderMenuCategories(); // Use local data from data.js
    renderFoodItems(); // Use local data from data.js
    updateAuthUI();
});

// Make functions globally available
window.setCategory = setCategory;
window.showLoginPopup = showLoginPopup;
window.closeLoginPopup = closeLoginPopup;
window.toggleLoginMode = toggleLoginMode;
window.logout = logout;
window.refreshFoodItems = refreshFoodItems;
window.handleSearch = handleSearch;
window.performSearch = performSearch;

// Cart functions - loaded from cart.js
// These functions are implemented in cart.js
