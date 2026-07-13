async function renderFoodList() {
    const container = document.getElementById('food-list-container');
    try {
        const res = await fetch('/api/admin/products');
        const foodList = await res.json();
        if (foodList.length === 0) {
            container.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Chưa có sản phẩm.</td></tr>';
            return;
        }
        container.innerHTML = foodList.map(item => `
            <tr>
                <td><img src="${item.image}" class="thumb" alt="" onerror="this.src='/admin/assets/upload_area.png'"></td>
                <td class="font-weight-medium">${item.name}</td>
                <td><span class="badge badge-info">${item.category}</span></td>
                <td>${formatPrice(item.price)}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="removeFood(${item.id})"><i class="far fa-trash-can"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        container.innerHTML = '<tr><td colspan="5" class="text-danger text-center">Lỗi tải dữ liệu</td></tr>';
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
}

async function removeFood(id) {
    if (!confirm('Xóa sản phẩm này?')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) { showNotification('Đã xóa sản phẩm'); renderFoodList(); }
    else showNotification('Xóa thất bại', 'error');
}

document.addEventListener('DOMContentLoaded', renderFoodList);
window.removeFood = removeFood;
