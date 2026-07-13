function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
}

function parseItems(itemsStr) {
    try { return JSON.parse(itemsStr); } catch { return [{ name: itemsStr || 'N/A', quantity: 1 }]; }
}

async function renderOrders() {
    const container = document.getElementById('order-list-container');
    try {
        const res = await fetch('/api/admin/orders');
        const orders = await res.json();
        if (orders.length === 0) {
            container.innerHTML = '<p class="text-center text-muted py-5 mb-0">Chưa có đơn hàng.</p>';
            return;
        }
        container.innerHTML = `<div class="table-responsive"><table class="table table-hover">
            <thead><tr><th>Mã</th><th>Khách hàng</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Ngày</th><th>Trạng thái</th></tr></thead>
            <tbody>${orders.map(order => {
                const items = parseItems(order.items);
                const itemsText = items.map(i => `${i.name || i.title || 'SP'} x${i.quantity || 1}`).join(', ');
                const statuses = ['Pending', 'Processing', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
                const options = statuses.map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s}</option>`).join('');
                return `<tr>
                    <td>#${order.id}</td>
                    <td><strong>${order.userName || 'Khách'}</strong><br><small class="text-muted">${order.userEmail || ''}</small></td>
                    <td style="max-width:220px;">${itemsText}</td>
                    <td class="font-weight-bold">${formatPrice(order.amount)}</td>
                    <td><small>${order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : ''}</small></td>
                    <td><select class="form-control form-control-sm" onchange="updateStatus(${order.id}, this.value)">${options}</select></td>
                </tr>`;
            }).join('')}</tbody></table></div>`;
    } catch (e) {
        container.innerHTML = '<p class="text-danger text-center py-4">Lỗi tải đơn hàng</p>';
    }
}

async function updateStatus(orderId, newStatus) {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) showNotification('Cập nhật trạng thái thành công!');
    else showNotification('Cập nhật thất bại', 'error');
}

document.addEventListener('DOMContentLoaded', renderOrders);
window.updateStatus = updateStatus;
