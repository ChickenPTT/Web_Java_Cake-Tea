// Cart functionality with Java backend integration

let cartData = {
    cartItems: [],
    total: 0,
    count: 0
};

function normalizeCartPayload(data) {
    const items = data.cartItems;
    return {
        cartItems: Array.isArray(items) ? items : (items ? Object.values(items) : []),
        total: Number(data.total) || 0,
        count: Number(data.count) || 0
    };
}

// Load cart item — trả về Promise để order.js có thể await
function loadCartItems() {
    return fetch('/api/cart', { credentials: 'same-origin' })
        .then(response => response.json())
        .then(data => {
            cartData = normalizeCartPayload(data);
            renderCartItems();
            updateCartTotals();
            updateCartDot();
            return cartData;
        })
        .catch(error => {
            console.error('Error loading cart:', error);
            cartData = { cartItems: [], total: 0, count: 0 };
            renderCartItems();
            updateCartTotals();
            updateCartDot();
            return cartData;
        });
}

// Render cart items vao trong page
function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;

    if (!cartData.cartItems || cartData.cartItems.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">Giỏ hàng của bạn đang trống</p>';
        return;
    }

    container.innerHTML = cartData.cartItems.map(item => `
        <div class="cart-items-item" style="display: grid; grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 0.5fr; align-items: center; margin: 10px 0px;">
            <img src="${item.image || '/user/assets/food_1.jpg'}" alt="${item.title}" style="width: 50px; height: 60px;">
            <p>${item.title}</p>
            <p>${Number(item.price).toLocaleString('vi-VN')} đ</p>
            <div class="cart-quantity-control" style="display: flex; align-items: center; gap: 5px;">
                <button type="button" onclick="updateQuantity(${item.productId}, ${item.quantity - 1})" style="width: 20px; height: 20px; border: 1px solid #e2e2e2; background: white; cursor: pointer;">-</button>
                <span>${item.quantity}</span>
                <button type="button" onclick="updateQuantity(${item.productId}, ${item.quantity + 1})" style="width: 20px; height: 20px; border: 1px solid #e2e2e2; background: white; cursor: pointer;">+</button>
            </div>
            <p>${Number(item.total).toLocaleString('vi-VN')} đ</p>
            <p class="cross" onclick="removeFromCart(${item.productId})" style="width: 15px; cursor: pointer;">x</p>
        </div>
    `).join('');
}

// Update cart totals
function updateCartTotals() {
    const subtotal = cartData.total || 0;
    const deliveryFee = subtotal > 0 ? 2 : 0;
    const total = subtotal + deliveryFee;

    const subtotalEl = document.getElementById('subtotal');
    const deliveryFeeEl = document.getElementById('delivery-fee');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = `${subtotal.toLocaleString('vi-VN')} đ`;
    if (deliveryFeeEl) deliveryFeeEl.textContent = `${deliveryFee.toLocaleString('vi-VN')} đ`;
    if (totalEl) totalEl.textContent = `${total.toLocaleString('vi-VN')} đ`;
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
        method: 'POST',
        credentials: 'same-origin'
    })
        .then(response => response.json())
        .then(data => {
            cartData = normalizeCartPayload(data);
            updateCartDot();
            alert('Đã thêm sản phẩm vào giỏ hàng!');
        })
        .catch(error => {
            console.error('Error adding to cart:', error);
        });
}

// Remove item from cart
function removeFromCart(id) {
    fetch(`/api/cart/remove/${id}`, {
        method: 'POST',
        credentials: 'same-origin'
    })
        .then(response => response.json())
        .then(data => {
            cartData = normalizeCartPayload(data);
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
        method: 'POST',
        credentials: 'same-origin'
    })
        .then(response => response.json())
        .then(data => {
            cartData = normalizeCartPayload(data);
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
    return fetch('/api/cart/clear', {
        method: 'POST',
        credentials: 'same-origin'
    })
        .then(response => response.json())
        .then(data => {
            cartData = normalizeCartPayload(data);
            renderCartItems();
            updateCartTotals();
            updateCartDot();
            return cartData;
        })
        .catch(error => {
            console.error('Error clearing cart:', error);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    // order.js sẽ tự load cart; tránh double-load nếu đang ở trang order
    if (!document.getElementById('order-form')) {
        loadCartItems();
    }
});

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.clearCart = clearCart;
window.loadCartItems = loadCartItems;
window.updateCartTotals = updateCartTotals;
