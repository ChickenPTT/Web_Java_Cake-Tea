async function loadCategories() {
    const container = document.getElementById('category-list-container');
    const res = await fetch('/api/admin/categories');
    const categories = await res.json();
    if (categories.length === 0) {
        container.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Chưa có danh mục.</td></tr>';
        return;
    }
    container.innerHTML = categories.map(cat => `
        <tr>
            <td>${cat.id}</td>
            <td class="font-weight-medium">${cat.menuName}</td>
            <td><img src="${cat.menuImage || '/admin/assets/upload_area.png'}" class="thumb" alt=""></td>
            <td>
                <button class="btn btn-sm btn-info mr-1" onclick='editCategory(${cat.id}, ${JSON.stringify(cat.menuName)}, ${JSON.stringify(cat.menuImage || "")})'><i class="fas fa-pen-to-square"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteCategory(${cat.id})"><i class="far fa-trash-can"></i></button>
            </td>
        </tr>
    `).join('');
}

function editCategory(id, name, image) {
    document.getElementById('category-id').value = id;
    document.getElementById('category-name').value = name;
    document.getElementById('category-image').value = image;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteCategory(id) {
    if (!confirm('Xóa danh mục này?')) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    if (res.ok) { showNotification('Đã xóa danh mục'); loadCategories(); }
    else showNotification('Xóa thất bại', 'error');
}

document.getElementById('category-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('category-id').value;
    const body = {
        menuName: document.getElementById('category-name').value,
        menuImage: document.getElementById('category-image').value
    };
    const res = await fetch(id ? `/api/admin/categories/${id}` : '/api/admin/categories', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (res.ok) {
        showNotification(id ? 'Cập nhật thành công' : 'Thêm danh mục thành công');
        this.reset();
        document.getElementById('category-id').value = '';
        loadCategories();
    } else showNotification('Lưu thất bại', 'error');
});

document.addEventListener('DOMContentLoaded', loadCategories);
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
