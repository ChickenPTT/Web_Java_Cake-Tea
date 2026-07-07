// Cart functionality with Java backend integration

let cartData = {
    cartItems: [],
    total: 0,
    count: 0
};

// Load cart item
function loadCartItems() {
    fetch('/api/cart')
        .then(response => response.json())
        .then(data => {
            cartData = data;
            renderCartItems();
            updateCartTotals();
            updateCartDot();
        })
        .catch(error => {
            console.error('Error loading cart:', error);
        });
}

// Render cart items vao trong page
function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;

    if (cartData.cartItems.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">Your cart is empty</p>';
        return;
    }

    container.innerHTML = cartData.cartItems.map(item => `
        <div class="cart-items-item" style="display: grid; grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 0.5fr; align-items: center; margin: 10px 0px;">
            <img src="${item.image || '/user/assets/food_1.jpg'}" alt="${item.title}" style="width: 50px; height: 60px;">
            <p>${item.title}</p>
            <p>$${item.price}</p>
            <div class="cart-quantity-control" style="display: flex; align-items: center; gap: 5px;">
                <button onclick="updateQuantity(${item.productId}, ${item.quantity - 1})" style="width: 20px; height: 20px; border: 1px solid #e2e2e2; background: white; cursor: pointer;">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.productId}, ${item.quantity + 1})" style="width: 20px; height: 20px; border: 1px solid #e2e2e2; background: white; cursor: pointer;">+</button>
            </div>
            <p>$${item.total}</p>
            <img class="cross" onclick="removeFromCart(${item.productId})" src="/user/assets/cross_icon.png" alt="Remove" style="width: 15px; cursor: pointer;">
        </div>
    `).join('');
}

// Update cart totals
function updateCartTotals() {
    const subtotal = cartData.total;
    const deliveryFee = subtotal > 0 ? 2 : 0;
    const total = subtotal + deliveryFee;

    const subtotalEl = document.getElementById('subtotal');
    const deliveryFeeEl = document.getElementById('delivery-fee');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (deliveryFeeEl) deliveryFeeEl.textContent = `$${deliveryFee.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

// Update cart dot indicator
function updateCartDot() {
    const cartDot = document.getElementById('cart-dot');
    if (cartDot) {
        cartDot.style.display = cartData.count > 0 ? 'block' : 'none';
    }
}

// Add item to cart
function addToCart(id) {
    fetch(`/api/cart/add/${id}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        cartData = data;
        updateCartDot();
        // Show success message
        alert('Item added to cart!');
    })
    .catch(error => {
        console.error('Error adding to cart:', error);
    });
}

// Remove item from cart
function removeFromCart(id) {
    fetch(`/api/cart/remove/${id}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        cartData = data;
        renderCartItems();
        updateCartTotals();
        updateCartDot();
    })
    .catch(error => {
        console.error('Error removing from cart:', error);
    });
}

// Update item quantity
function updateQuantity(id, quantity) {
    if (quantity < 0) return;

    fetch(`/api/cart/update/${id}?quantity=${quantity}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        cartData = data;
        renderCartItems();
        updateCartTotals();
        updateCartDot();
    })
    .catch(error => {
        console.error('Error updating quantity:', error);
    });
}

// Clear cart
function clearCart() {
    fetch('/api/cart/clear', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        cartData = data;
        renderCartItems();
        updateCartTotals();
        updateCartDot();
    })
    .catch(error => {
        console.error('Error clearing cart:', error);
    });
}

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();
});

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.clearCart = clearCart;