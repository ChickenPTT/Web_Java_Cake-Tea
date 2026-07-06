// Render cart items
function renderCartItems() {
    const cartContainer = document.getElementById('cart-items-container');
    if (!cartContainer) return;

    const cartItemsHtml = foodlist.map((item) => {
        if (cartItems[item._id] > 0) {
            return `
                <div>
                    <div class="cart-items-title cart-items-item">
                        <img src="${item.image}" alt="${item.name}">
                        <p>${item.name}</p>
                        <p>$${item.price}</p>
                        <p>${cartItems[item._id]}</p>
                        <p>$${item.price * cartItems[item._id]}</p>
                        <p onclick="removeFromCart('${item._id}')" class="cross">x</p>
                    </div>
                    <hr>
                </div>
            `;
        }
        return '';
    }).join('');

    cartContainer.innerHTML = cartItemsHtml || '<p style="text-align: center; padding: 20px;">Your cart is empty</p>';
    updateCartTotals();
}

// Update cart totals
function updateCartTotals() {
    const subtotal = getTotalCartAmount();
    const deliveryFee = subtotal === 0 ? 0 : 2;
    const total = subtotal === 0 ? 0 : subtotal + deliveryFee;

    document.getElementById('subtotal').textContent = `$${subtotal}`;
    document.getElementById('delivery-fee').textContent = `$${deliveryFee}`;
    document.getElementById('total').textContent = `$${total}`;
}

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

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderCartItems();
    updateAuthUI();
    updateCartUI();
});

// Make functions globally available
window.removeFromCart = removeFromCart;
window.logout = logout;