// Get status class based on status
function getStatusClass(status) {
    switch (status) {
        case "Processing": return "status-processing";
        case "Preparing": return "status-preparing";
        case "Out for Delivery": return "status-delivering";
        case "Delivered": return "status-delivered";
        default: return "status-processing";
    }
}

// Get status display text in Vietnamese
function getStatusText(status) {
    switch (status) {
        case "Processing": return "Đang xử lý";
        case "Preparing": return "Đang chuẩn bị";
        case "Out for Delivery": return "Đang giao hàng";
        case "Delivered": return "Đã giao hàng";
        default: return status;
    }
}

// Render orders
function renderOrders() {
    const ordersContainer = document.getElementById('orders-container');
    if (!ordersContainer) return;

    // Get orders from localStorage (in real app, fetch from Java backend)
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');

    if (orders.length === 0) {
        ordersContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Chưa có đơn hàng nào. Hãy bắt đầu mua sắm để xem đơn hàng của bạn tại đây!</p>';
        return;
    }

    ordersContainer.innerHTML = orders.map((order) => {
        const itemsText = order.items.map((item, idx) => {
            if (idx === order.items.length - 1) {
                return item.name + " x " + item.quantity;
            } else {
                return item.name + " x " + item.quantity + ", ";
            }
        }).join('');

        const date = new Date(order.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="my-orders-order">
                <div class="order-icon">
                    <img src="/user/assets/bag_icon.png" alt="">
                </div>
                <div class="order-info">
                    <p class="order-items">${itemsText}</p>
                    <p class="order-date">${date}</p>
                </div>
                <p class="order-amount">$${order.amount}.00</p>
                <p class="order-count">Số lượng: ${order.items.length}</p>
                <p class="order-status ${getStatusClass(order.status)}">
                    <span class="status-dot"></span>
                    ${getStatusText(order.status)}
                </p>
                <button onclick="refreshOrders()" class="track-btn">Cập nhật</button>
            </div>
        `;
    }).join('');
}

// Refresh orders
function refreshOrders() {
    // In real app, fetch from Java backend
    renderOrders();
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

// Check if user should be on this page
function checkAccess() {
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAccess();
    renderOrders();
    updateAuthUI();
    updateCartUI();
});

// Make functions globally available
window.logout = logout;
window.refreshOrders = refreshOrders;
