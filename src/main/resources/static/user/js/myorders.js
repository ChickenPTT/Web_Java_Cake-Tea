function getStatusClass(status) {
    switch (status) {
        case "Pending": return "status-processing";
        case "Processing": return "status-processing";
        case "Preparing": return "status-preparing";
        case "Out for Delivery": return "status-delivering";
        case "Delivered": return "status-delivered";
        case "Cancelled": return "status-processing";
        default: return "status-processing";
    }
}

function getStatusText(status) {
    switch (status) {
        case "Pending": return "Chờ xử lý";
        case "Processing": return "Đang xử lý";
        case "Preparing": return "Đang chuẩn bị";
        case "Out for Delivery": return "Đang giao hàng";
        case "Delivered": return "Đã giao hàng";
        case "Cancelled": return "Đã hủy";
        default: return status || "Chờ xử lý";
    }
}

function parseOrderItems(itemsField) {
    if (!itemsField) return [];
    try {
        const parsed = typeof itemsField === 'string' ? JSON.parse(itemsField) : itemsField;
        if (Array.isArray(parsed)) return parsed;
        if (parsed && Array.isArray(parsed.products)) return parsed.products;
        return [];
    } catch (_) {
        return [];
    }
}

function formatAmount(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount || 0) + ' đ';
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

function renderOrders(orders) {
    const ordersContainer = document.getElementById('orders-container');
    if (!ordersContainer) return;

    if (!orders || orders.length === 0) {
        ordersContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Chưa có đơn hàng nào. Hãy bắt đầu mua sắm để xem đơn hàng của bạn tại đây!</p>';
        return;
    }

    ordersContainer.innerHTML = orders.map((order) => {
        const items = parseOrderItems(order.items);
        const itemsText = items.length === 0
            ? 'Không có chi tiết sản phẩm'
            : items.map((item) => {
                const name = item.title || item.name || 'SP';
                const qty = item.quantity || 1;
                return `${name} x ${qty}`;
            }).join(', ');

        return `
            <div class="my-orders-order">
                <div class="order-icon">
                    <img src="/user/assets/bag_icon.png" alt="">
                </div>
                <div class="order-info">
                    <p class="order-items">${itemsText}</p>
                    <p class="order-date">${formatDate(order.createdAt)}</p>
                </div>
                <p class="order-amount">${formatAmount(order.amount)}</p>
                <p class="order-count">Số lượng: ${items.length}</p>
                <p class="order-status ${getStatusClass(order.status)}">
                    <span class="status-dot"></span>
                    ${getStatusText(order.status)}
                </p>
                <button type="button" onclick="refreshOrders()" class="track-btn">Cập nhật</button>
            </div>
        `;
    }).join('');
}

async function loadOrders() {
    const ordersContainer = document.getElementById('orders-container');
    if (ordersContainer) {
        ordersContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Đang tải đơn hàng...</p>';
    }

    try {
        const res = await fetch('/api/orders/user/current', { credentials: 'same-origin' });
        if (res.status === 401) {
            alert('Vui lòng đăng nhập để xem đơn hàng');
            window.location.href = '/';
            return;
        }
        if (!res.ok) {
            throw new Error('Không tải được đơn hàng');
        }
        const orders = await res.json();
        renderOrders(Array.isArray(orders) ? orders : []);
    } catch (e) {
        console.error(e);
        if (ordersContainer) {
            ordersContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: #c00;">Lỗi tải đơn hàng. Vui lòng thử lại.</p>';
        }
    }
}

function refreshOrders() {
    loadOrders();
}

async function checkAccess() {
    try {
        const res = await fetch('/api/current-user', { credentials: 'same-origin' });
        const data = await res.json();
        if (!data.authenticated) {
            alert('Vui lòng đăng nhập để xem đơn hàng');
            window.location.href = '/';
            return false;
        }
        return true;
    } catch (e) {
        console.error(e);
        window.location.href = '/';
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    const ok = await checkAccess();
    if (!ok) return;
    if (typeof checkUserSession === 'function') {
        checkUserSession();
    }
    if (typeof loadCartItems === 'function') {
        loadCartItems();
    }
    await loadOrders();
});

window.refreshOrders = refreshOrders;
