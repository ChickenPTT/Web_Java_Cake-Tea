async function fetchFoodList() {
    const res = await fetch('/api/admin/products');
    return res.json();
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
}

async function renderFoodList() {
    const container = document.getElementById('food-list-container');
    try {
        const foodList = await fetchFoodList();
        if (foodList.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:20px;color:#666;">Chưa có sản phẩm.</p>';
            return;
        }
        container.innerHTML = foodList.map(item => `
            <div class="list-table-format">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='/admin/assets/upload_area.png'">
                <p>${item.name}</p>
                <p>${item.category}</p>
                <p>${formatPrice(item.price)}</p>
                <p onclick="removeFood(${item.id})" class="cursor" style="cursor:pointer;color:red;">Xóa</p>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = '<p style="color:red;">Lỗi tải danh sách sản phẩm</p>';
    }
}

async function removeFood(id) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
        showNotification('Đã xóa sản phẩm');
        renderFoodList();
    } else {
        showNotification('Xóa thất bại', 'error');
    }
}

document.addEventListener('DOMContentLoaded', renderFoodList);
window.removeFood = removeFood;
