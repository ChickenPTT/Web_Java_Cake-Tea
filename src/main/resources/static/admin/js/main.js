function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = '/admin/login';
}
window.adminLogout = adminLogout;

function showNotification(message, type = 'success') {
    const el = document.createElement('div');
    el.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed`;
    el.style.cssText = 'top:20px;right:20px;z-index:99999;min-width:280px;box-shadow:0 4px 12px rgba(0,0,0,.15);';
    el.innerHTML = `<i class="mdi mdi-${type === 'success' ? 'check-circle' : 'alert-circle'} mr-2"></i>${message}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

async function updateDashboardStats() {
    try {
        const res = await fetch('/api/admin/dashboard/stats');
        const data = await res.json();
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? 0; };
        set('total-items', data.totalItems);
        set('total-orders', data.totalOrders);
        set('pending-orders', data.pendingOrders);
    } catch (e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    if (!path.includes('/admin/login') && localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = '/admin/login';
        return;
    }
    if (path === '/admin' || path === '/admin/') {
        updateDashboardStats();
    }
});
