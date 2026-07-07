const API_URL = '';

function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = '/admin/login';
}
window.adminLogout = adminLogout;

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white; border-radius: 5px; z-index: 10000;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

async function updateDashboardStats() {
    try {
        const res = await fetch('/api/admin/dashboard/stats');
        const data = await res.json();
        const totalItems = document.getElementById('total-items');
        const totalOrders = document.getElementById('total-orders');
        const pendingOrders = document.getElementById('pending-orders');
        if (totalItems) totalItems.textContent = data.totalItems ?? 0;
        if (totalOrders) totalOrders.textContent = data.totalOrders ?? 0;
        if (pendingOrders) pendingOrders.textContent = data.pendingOrders ?? 0;
    } catch (e) {
        console.error('Lỗi tải dashboard:', e);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    if (!path.includes('/admin/login') && localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = '/admin/login';
        return;
    }
    if (path === '/admin' || path === '/admin/' || path.endsWith('/admin/index')) {
        updateDashboardStats();
    }
});
