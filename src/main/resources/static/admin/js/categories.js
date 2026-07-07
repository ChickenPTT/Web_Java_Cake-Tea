async function loadCategories() {
    const res = await fetch('/api/admin/categories');
    const categories = await res.json();
    const container = document.getElementById('category-list-container');
    if (categories.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:20px;">Chưa có danh mục.</p>';
        return;
    }
    container.innerHTML = categories.map(cat => `
        <div class="list-table-format">
            <p>${cat.id}</p>
            <p>${cat.menuName}</p>
            <img src="${cat.menuImage || '/admin/assets/upload_area.png'}" alt="" style="width:50px;height:50px;object-fit:cover;">
            <p>
                <span onclick="editCategory(${cat.id}, '${cat.menuName}', '${cat.menuImage || ''}')" style="cursor:pointer;color:blue;margin-right:10px;">Sửa</span>
                <span onclick="deleteCategory(${cat.id})" style="cursor:pointer;color:red;">Xóa</span>
            </p>
        </div>
    `).join('');
}

function editCategory(id, name, image) {
    document.getElementById('category-id').value = id;
    document.getElementById('category-name').value = name;
    document.getElementById('category-image').value = image;
}

async function deleteCategory(id) {
    if (!confirm('Xóa danh mục này?')) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
        showNotification('Đã xóa danh mục');
        loadCategories();
    } else {
        showNotification('Xóa thất bại', 'error');
    }
}

document.getElementById('category-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('category-id').value;
    const body = {
        menuName: document.getElementById('category-name').value,
        menuImage: document.getElementById('category-image').value
    };
    const url = id ? `/api/admin/categories/${id}` : '/api/admin/categories';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (res.ok) {
        showNotification(id ? 'Cập nhật thành công' : 'Thêm danh mục thành công');
        this.reset();
        document.getElementById('category-id').value = '';
        loadCategories();
    } else {
        const err = await res.json().catch(() => ({}));
        showNotification(err.message || 'Lỗi lưu danh mục', 'error');
    }
});

document.addEventListener('DOMContentLoaded', loadCategories);
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
