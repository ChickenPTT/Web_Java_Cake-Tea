async function loadCategories() {
    const container = document.getElementById('category-list-container');
    try {
        const res = await fetch('/api/admin/categories', { credentials: 'same-origin' });
        const categories = await res.json();
        if (categories.length === 0) {
            container.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Chưa có danh mục.</td></tr>';
            return;
        }
        container.innerHTML = categories.map(cat => `
            <tr>
                <td>${cat.id}</td>
                <td><img src="${cat.menuImage || '/admin/assets/upload_area.png'}" class="thumb" alt="" onerror="this.src='/admin/assets/upload_area.png'"></td>
                <td class="font-weight-medium">${cat.menuName || ''}</td>
                <td><code>${cat.slug || '-'}</code></td>
                <td>
                    <a class="btn btn-sm btn-info mr-1" href="/admin/categories/edit/${cat.id}" title="Sửa">
                        <i class="fas fa-pen-to-square"></i>
                    </a>
                    <button class="btn btn-sm btn-danger" onclick="deleteCategory(${cat.id})" title="Xóa">
                        <i class="far fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        container.innerHTML = '<tr><td colspan="5" class="text-danger text-center">Lỗi tải dữ liệu</td></tr>';
    }
}

async function deleteCategory(id) {
    if (!confirm('Xóa danh mục này?')) return;
    const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin'
    });
    if (res.ok) {
        showNotification('Đã xóa danh mục');
        loadCategories();
    } else {
        showNotification('Xóa thất bại', 'error');
    }
}

document.addEventListener('DOMContentLoaded', loadCategories);
window.deleteCategory = deleteCategory;
