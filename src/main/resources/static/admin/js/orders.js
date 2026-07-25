let allOrders = [];
let activeStatus = 'all';
let searchQuery = '';

const STATUS_OPTIONS = [
    'Pending',
    'Processing',
    'Preparing',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
];

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price || 0) + ' đ';
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function parseOrderPayload(itemsStr) {
    if (!itemsStr) return { products: [], delivery: null };
    try {
        const parsed = typeof itemsStr === 'string' ? JSON.parse(itemsStr) : itemsStr;
        if (Array.isArray(parsed)) return { products: parsed, delivery: null };
        return {
            products: Array.isArray(parsed.products) ? parsed.products : [],
            delivery: parsed.delivery || null
        };
    } catch (_) {
        return { products: [], delivery: null };
    }
}

function getStatusText(status) {
    switch (status) {
        case 'Pending': return 'Chờ xử lý';
        case 'Processing': return 'Đang xử lý';
        case 'Preparing': return 'Đang chuẩn bị';
        case 'Out for Delivery': return 'Đang giao hàng';
        case 'Delivered': return 'Đã giao hàng';
        case 'Cancelled': return 'Đã hủy';
        default: return status || 'Chờ xử lý';
    }
}

function getStatusClass(status) {
    switch (status) {
        case 'Pending': return 'pending';
        case 'Processing': return 'processing';
        case 'Preparing': return 'preparing';
        case 'Out for Delivery': return 'shipping';
        case 'Delivered': return 'delivered';
        case 'Cancelled': return 'cancelled';
        default: return 'pending';
    }
}

function renderStats(orders) {
    const el = document.getElementById('order-stats');
    if (!el) return;

    const total = orders.length;
    const pending = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
    const shipping = orders.filter(o => o.status === 'Preparing' || o.status === 'Out for Delivery').length;
    const done = orders.filter(o => o.status === 'Delivered').length;

    el.innerHTML = `
        <div class="order-stat-card">
            <div class="order-stat-icon total"><i class="mdi mdi-clipboard-text-outline"></i></div>
            <div class="order-stat-meta">
                <p class="order-stat-label">Tổng đơn</p>
                <p class="order-stat-value">${total}</p>
            </div>
        </div>
        <div class="order-stat-card">
            <div class="order-stat-icon pending"><i class="mdi mdi-timer-sand"></i></div>
            <div class="order-stat-meta">
                <p class="order-stat-label">Chờ / xử lý</p>
                <p class="order-stat-value">${pending}</p>
            </div>
        </div>
        <div class="order-stat-card">
            <div class="order-stat-icon shipping"><i class="mdi mdi-truck-delivery-outline"></i></div>
            <div class="order-stat-meta">
                <p class="order-stat-label">Đang giao</p>
                <p class="order-stat-value">${shipping}</p>
            </div>
        </div>
        <div class="order-stat-card">
            <div class="order-stat-icon done"><i class="mdi mdi-check-circle-outline"></i></div>
            <div class="order-stat-meta">
                <p class="order-stat-label">Hoàn thành</p>
                <p class="order-stat-value">${done}</p>
            </div>
        </div>
    `;
}

function getFilteredOrders() {
    const q = searchQuery.trim().toLowerCase();
    return allOrders.filter(order => {
        const matchStatus = activeStatus === 'all' || order.status === activeStatus;
        if (!matchStatus) return false;
        if (!q) return true;
        const hay = [
            String(order.id || ''),
            order.userName || '',
            order.userEmail || '',
            order.status || ''
        ].join(' ').toLowerCase();
        return hay.includes(q);
    });
}

function renderOrderCard(order) {
    const { products, delivery } = parseOrderPayload(order.items);
    const options = STATUS_OPTIONS.map(s =>
        `<option value="${s}" ${order.status === s ? 'selected' : ''}>${getStatusText(s)}</option>`
    ).join('');

    const productsHtml = products.length === 0
        ? '<p class="order-product-meta">Không có chi tiết sản phẩm</p>'
        : products.map(item => {
            const name = item.title || item.name || 'Sản phẩm';
            const qty = item.quantity || 1;
            const price = item.price != null ? formatPrice(item.price) : '';
            const image = item.image || '/user/assets/food_1.jpg';
            return `
                <div class="order-product">
                    <img src="${image}" alt="${name}">
                    <div class="order-product-info">
                        <p class="order-product-name">${name}</p>
                        <p class="order-product-meta">SL: ${qty}${price ? ' · ' + price : ''}</p>
                    </div>
                </div>
            `;
        }).join('');

    let addressHtml = '';
    if (delivery) {
        const fullName = [delivery.firstName, delivery.lastName].filter(Boolean).join(' ');
        const address = [delivery.street, delivery.city, delivery.state, delivery.country]
            .filter(Boolean).join(', ');
        addressHtml = `
            ${fullName ? `<p>${fullName}</p>` : ''}
            ${address ? `<p>${address}</p>` : ''}
            ${delivery.phone ? `<p>SĐT: ${delivery.phone}</p>` : ''}
        `;
    }

    return `
        <article class="order-card">
            <div class="order-card-top">
                <div>
                    <p class="order-card-id">Đơn hàng <span>#${order.id}</span></p>
                    <p class="order-card-date">${formatDate(order.createdAt)}</p>
                </div>
                <span class="order-badge ${getStatusClass(order.status)}">${getStatusText(order.status)}</span>
            </div>
            <div class="order-card-body">
                <div class="order-products">${productsHtml}</div>
                <div class="order-customer">
                    <h4>Khách hàng</h4>
                    <p class="name">${order.userName || 'Khách'}</p>
                    <p>${order.userEmail || ''}</p>
                    ${addressHtml}
                </div>
                <div class="order-summary">
                    <h4>Thanh toán</h4>
                    <p>${order.paymentMethod || 'COD'}</p>
                    <p>${order.paymentStatus || 'Pending'}</p>
                    <p class="amount">${formatPrice(order.amount)}</p>
                </div>
            </div>
            <div class="order-card-footer">
                <div class="order-payment">
                    <strong>${products.length}</strong> sản phẩm trong đơn
                </div>
                <div class="order-status-control">
                    <label for="status-${order.id}">Cập nhật</label>
                    <select id="status-${order.id}" onchange="updateStatus(${order.id}, this.value)">
                        ${options}
                    </select>
                </div>
            </div>
        </article>
    `;
}

function renderOrdersList() {
    const container = document.getElementById('order-list-container');
    if (!container) return;

    const orders = getFilteredOrders();
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="order-empty">
                <i class="mdi mdi-package-variant"></i>
                <p>Không có đơn hàng phù hợp.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map(renderOrderCard).join('');
}

async function loadOrders() {
    const container = document.getElementById('order-list-container');
    try {
        const res = await fetch('/api/admin/orders', { credentials: 'same-origin' });
        if (!res.ok) {
            container.innerHTML = '<p class="text-danger text-center py-4">Lỗi tải đơn hàng</p>';
            return;
        }
        const orders = await res.json();
        allOrders = Array.isArray(orders) ? orders : [];
        allOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        renderStats(allOrders);
        renderOrdersList();
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="text-danger text-center py-4">Lỗi tải đơn hàng</p>';
    }
}

async function updateStatus(orderId, newStatus) {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
        const order = allOrders.find(o => o.id === orderId);
        if (order) order.status = newStatus;
        renderStats(allOrders);
        renderOrdersList();
        showNotification('Cập nhật trạng thái thành công!');
    } else {
        showNotification('Cập nhật thất bại', 'error');
        loadOrders();
    }
}

function initFilters() {
    document.querySelectorAll('.order-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.order-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeStatus = btn.dataset.status || 'all';
            renderOrdersList();
        });
    });

    const search = document.getElementById('order-search');
    if (search) {
        search.addEventListener('input', () => {
            searchQuery = search.value || '';
            renderOrdersList();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    loadOrders();
});

window.updateStatus = updateStatus;
