// Render menu categories
function renderMenuCategories() {
    const menuContainer = document.getElementById('menu-categories');
    if (!menuContainer) return;

    menuContainer.innerHTML = menulist.map((item, index) => {
        const isActive = currentCategory === item.menu_name ? 'active' : '';
        return `
            <div onclick="setCategory('${item.menu_name}')" class="explore-menu-list-item">
                <img class="${isActive}" src="${item.menu_image}" alt="${item.menu_name}">
                <p>${item.menu_name}</p>
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
function renderFoodItems() {
    const foodContainer = document.getElementById('food-list');
    if (!foodContainer) return;

    const filteredItems = currentCategory === 'All' 
        ? foodlist 
        : foodlist.filter(item => item.category === currentCategory);

    foodContainer.innerHTML = filteredItems.map((item) => {
        const cartCount = cartItems[item._id] || 0;
        const cartControl = cartCount === 0 
            ? `<img class="add" onclick="addToCart('${item._id}')" src="/user/assets/add_icon_green.png" alt="">`
            : `<div class="food-item-counter">
                <img onclick="removeFromCart('${item._id}')" src="/user/assets/remove_icon_red.png" alt="">
                <p>${cartCount}</p>
                <img onclick="addToCart('${item._id}')" src="/user/assets/add_icon_green.png" alt="">
               </div>`;

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

// Refresh food items when cart changes
function refreshFoodItems() {
    renderFoodItems();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderMenuCategories();
    renderFoodItems();
    updateAuthUI();
    updateCartUI();
});

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.setCategory = setCategory;
window.showLoginPopup = showLoginPopup;
window.closeLoginPopup = closeLoginPopup;
window.toggleLoginMode = toggleLoginMode;
window.logout = logout;
window.refreshFoodItems = refreshFoodItems;
