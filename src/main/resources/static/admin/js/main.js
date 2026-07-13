// API URL - replace with your Java backend URL
const API_URL = 'http://localhost:8080/api';

// Set active sidebar option based on current page
function setActiveSidebar() {
    const currentPage = window.location.pathname.split('/').pop();
    const sidebarOptions = document.querySelectorAll('.sidebar-option');
    
    sidebarOptions.forEach(option => {
        option.classList.remove('active');
    });

    if (currentPage === 'add.html' || currentPage === 'add') {
        document.getElementById('nav-add')?.classList.add('active');
    } else if (currentPage === 'list.html' || currentPage === 'list') {
        document.getElementById('nav-list')?.classList.add('active');
    } else if (currentPage === 'orders.html' || currentPage === 'orders') {
        document.getElementById('nav-orders')?.classList.add('active');
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    // In real implementation, fetch from Java backend
    const totalItems = localStorage.getItem('totalItems') || '0';
    const totalOrders = localStorage.getItem('totalOrders') || '0';
    const pendingOrders = localStorage.getItem('pendingOrders') || '0';

    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('pending-orders').textContent = pendingOrders;
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 5px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Admin logout function
function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'login.html';
}

// Make function globally available
window.adminLogout = adminLogout;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check admin authentication
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }
    
    setActiveSidebar();
    
    // Update dashboard if on index page
    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('admin/')) {
        updateDashboardStats();
    }
});