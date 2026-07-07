async function fetchAllOrders() {
    const res = await fetch('/api/admin/orders');
    return res.json();
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
}

function parseItems(itemsStr) {
    try {
        return JSON.parse(itemsStr);
    } catch {
        return [{ name: itemsStr || 'N/A', quantity: 1 }];
    }
}

async function renderOrders() {
    const container = document.getElementById('order-list-container');
    try {
        const orders = await fetchAllOrders();
        if (orders.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:40px;color:#666;">Chưa có đơn hàng.</p>';
            return;
        }
        container.innerHTML = orders.map(order => {
            const items = parseItems(order.items);
            const itemsText = items.map(i => `${i.name || i.title || 'SP'} x ${i.quantity || 1}`).join(', ');
            const statuses = ['Pending', 'Processing', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
            const options = statuses.map(s =>
                `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s}</option>`
            ).join('');

            return `
                <div class="order-item">
                    <img src="/admin/assets/parcel_icon.png" alt="">
                    <div>
                        <p class="order-item-food">${itemsText}</p>
                        <p class="order-item-name">${order.userName || 'Khách'}</p>
                        <p class="order-item-phone">${order.userEmail || ''}</p>
                        <p style="font-size:12px;color:#888;">${order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : ''}</p>
                    </div>
                    <p>${formatPrice(order.amount)}</p>
                    <select onchange="updateStatus(${order.id}, this.value)">${options}</select>
                </div>
            `;
        }).join('');
    } catch (e) {
        container.innerHTML = '<p style="color:red;">Lỗi tải đơn hàng</p>';
    }
}

async function updateStatus(orderId, newStatus) {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
        showNotification('Cập nhật trạng thái thành công!');
    } else {
        showNotification('Cập nhật thất bại', 'error');
    }
}

document.addEventListener('DOMContentLoaded', renderOrders);
window.updateStatus = updateStatus;
