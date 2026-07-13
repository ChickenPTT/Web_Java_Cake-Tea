// Handle order form submission
document.getElementById('order-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Check if cart is empty
    if (cartData.cartItems.length === 0) {
        alert('Giỏ hàng của bạn đang trống');
        window.location.href = 'cart.html';
        return;
    }

    // Get form data
    const formData = new FormData(this);
    const deliveryFee = 2;
    const totalAmount = cartData.total + deliveryFee;

    // Prepare order data
    const orderData = {
        items: JSON.stringify(cartData.cartItems),
        amount: totalAmount,
        paymentMethod: 'COD',
        paymentStatus: 'Pending',
        status: 'Pending'
    };

    // Send order to backend
    fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Clear cart after successful order
            clearCart();
            
            // Show success message
            alert('Đặt hàng thành công! Mã đơn hàng: ' + data.orderId);
            
            // Redirect to orders page
            window.location.href = 'myorders.html';
        } else {
            alert('Lỗi đặt hàng: ' + (data.message || 'Vui lòng thử lại'));
        }
    })
    .catch(error => {
        console.error('Error placing order:', error);
        alert('Lỗi kết nối. Vui lòng thử lại');
    });
});

// Update authentication UI
function updateAuthUI() {
    const signinBtn = document.getElementById('signin-btn');
    const navbarProfile = document.getElementById('navbar-profile');

    if (signinBtn) {
        signinBtn.style.display = 'none';
        signinBtn.onclick = function() {
            window.location.href = '/login';
        };
    }
}

// Check if user should be on this page
function checkAccess() {
    fetch('/api/current-user')
        .then(response => response.json())
        .then(data => {
            if (!data.authenticated) {
                alert('Vui lòng đăng nhập để đặt hàng');
                window.location.href = '/login';
            }
        })
        .catch(error => console.error('Error checking auth:', error));
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAccess();
    updateCartTotals();
    updateAuthUI();
});

// Make functions globally available
window.logout = logout;