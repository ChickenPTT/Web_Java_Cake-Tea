const imageFileInput = document.getElementById('category-image-file');
const imagePreview = document.getElementById('category-image-preview');
const imageUrlInput = document.getElementById('category-image');
const nameInput = document.getElementById('category-name');
const slugInput = document.getElementById('category-slug');
const slugAutoCheckbox = document.getElementById('category-slug-auto');

const editMatch = window.location.pathname.match(/\/admin\/categories\/edit\/(\d+)/);
const categoryId = editMatch ? editMatch[1] : null;

function toSlug(text) {
    return (text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'd')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function setSlugAuto(enabled) {
    slugAutoCheckbox.checked = enabled;
    if (enabled) {
        slugInput.value = toSlug(nameInput.value);
        slugInput.readOnly = true;
    } else {
        slugInput.readOnly = false;
    }
}

nameInput.addEventListener('input', () => {
    if (slugAutoCheckbox.checked) {
        slugInput.value = toSlug(nameInput.value);
    }
});

slugAutoCheckbox.addEventListener('change', () => {
    if (slugAutoCheckbox.checked) {
        slugInput.value = toSlug(nameInput.value);
        slugInput.readOnly = true;
    } else {
        slugInput.readOnly = false;
        slugInput.focus();
    }
});

imageFileInput.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { imagePreview.src = ev.target.result; };
    reader.readAsDataURL(file);
});

async function uploadCategoryImage(file) {
    const uploadData = new FormData();
    uploadData.append('image', file);
    const res = await fetch('/api/admin/categories/upload', {
        method: 'POST',
        credentials: 'same-origin',
        body: uploadData
    });
    if (!res.ok) throw new Error('Upload thất bại');
    const data = await res.json();
    return data.imageUrl;
}

async function loadCategoryForEdit(id) {
    const res = await fetch(`/api/admin/categories/${id}`, { credentials: 'same-origin' });
    if (!res.ok) {
        showNotification('Không tải được danh mục', 'error');
        return;
    }
    const cat = await res.json();
    document.getElementById('category-id').value = cat.id;
    nameInput.value = cat.menuName || '';
    slugInput.value = cat.slug || '';
    setSlugAuto(false);
    imageUrlInput.value = cat.menuImage || '';
    imagePreview.src = cat.menuImage || '/admin/assets/upload_area.png';
}

document.getElementById('category-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const id = document.getElementById('category-id').value || categoryId;
    try {
        let imageUrl = imageUrlInput.value;
        if (imageFileInput.files[0]) {
            imageUrl = await uploadCategoryImage(imageFileInput.files[0]);
            imageUrlInput.value = imageUrl;
        }

        if (slugAutoCheckbox.checked) {
            slugInput.value = toSlug(nameInput.value);
        }

        const body = {
            menuName: nameInput.value.trim(),
            slug: slugInput.value.trim(),
            menuImage: imageUrl || '/admin/assets/upload_area.png'
        };

        const res = await fetch(id ? `/api/admin/categories/${id}` : '/api/admin/categories', {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(body)
        });

        if (res.ok) {
            showNotification(id ? 'Cập nhật thành công' : 'Thêm danh mục thành công');
            setTimeout(() => { window.location.href = '/admin/categories'; }, 600);
        } else {
            const err = await res.json().catch(() => ({}));
            showNotification(err.message || 'Lưu thất bại', 'error');
        }
    } catch (err) {
        showNotification(err.message || 'Lỗi kết nối', 'error');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    if (categoryId) {
        document.getElementById('page-title').textContent = 'Sửa danh mục';
        document.getElementById('breadcrumb-action').textContent = 'Sửa';
        document.getElementById('submit-btn').innerHTML = '<i class="mdi mdi-content-save mr-1"></i> Cập nhật';
        await loadCategoryForEdit(categoryId);
    } else {
        setSlugAuto(true);
    }
});
