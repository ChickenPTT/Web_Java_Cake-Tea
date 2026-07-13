// Update cart totals
function updateCartTotals() {
    const subtotal = getTotalCartAmount();
    const deliveryFee = subtotal === 0 ? 0 : 2;
    const total = subtotal === 0 ? 0 : subtotal + deliveryFee;

    document.getElementById('subtotal').textContent = `$${subtotal}`;
    document.getElementById('delivery-fee').textContent = `$${deliveryFee}`;
    document.getElementById('total').textContent = `$${total}`;
}

// Handle order form submission
document.getElementById('order-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Check if user is logged in
    if (!isLoggedIn()) {
        alert('Please login to place an order');
        window.location.href = 'index.html';
        return;
    }

    // Check if cart is empty
    if (getTotalCartAmount() === 0) {
        alert('Your cart is empty');
        window.location.href = 'cart.html';
        return;
    }

    // Get form data
    const formData = new FormData(this);
    const orderData = {
        address: {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            street: formData.get('street'),
            city: formData.get('city'),
            state: formData.get('state'),
            zipcode: formData.get('zipcode'),
            country: formData.get('country'),
            phone: formData.get('phone')
        },
        items: [],
        amount: getTotalCartAmount() + 2
    };

    // Add cart items to order
    foodlist.forEach((item) => {
        if (cartItems[item._id] > 0) {
            orderData.items.push({
                ...item,
                quantity: cartItems[item._id]
            });
        }
    });

    // Here you would send the order data to your Java backend
    // For now, we'll simulate successful order placement
    console.log('Order data:', orderData);
    
    // Save order to localStorage for demo purposes
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push({
        ...orderData,
        _id: Date.now().toString(),
        date: new Date().toISOString(),
        status: 'Processing'
    });
    localStorage.setItem('orders', JSON.stringify(orders));

    // Clear cart
    cartItems = {};
    saveCart();

    // Show success message
    alert('Order placed successfully! 🎉');

    // Redirect to orders page
    window.location.href = 'myorders.html';
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

// Check if user should be on this page
function checkAccess() {
    if (!isLoggedIn()) {
        window.location.href = 'cart.html';
        return;
    }
    if (getTotalCartAmount() === 0) {
        window.location.href = 'cart.html';
        return;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAccess();
    updateCartTotals();
    updateAuthUI();
    updateCartUI();
});

// Make functions globally available
window.logout = logout;