const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('image-preview');
const nameInput = document.getElementById('product-name');
const slugInput = document.getElementById('product-slug');
const slugAutoCheckbox = document.getElementById('product-slug-auto');
const existingImageInput = document.getElementById('existing-image');
let uploadedImageUrl = '';

const editMatch = window.location.pathname.match(/\/admin\/products\/edit\/(\d+)/);
const productId = editMatch ? editMatch[1] : null;

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

imageInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (ev) { imagePreview.src = ev.target.result; };
        reader.readAsDataURL(file);
    }
});

async function loadCategories(selected) {
    const select = document.getElementById('category-select');
    try {
        const res = await fetch('/api/admin/categories', { credentials: 'same-origin' });
        const categories = await res.json();
        select.innerHTML = '<option value="">-- Chọn danh mục --</option>';
        categories.forEach(cat => {
            const isSelected = selected && selected === cat.menuName ? 'selected' : '';
            select.innerHTML += `<option value="${cat.menuName}" ${isSelected}>${cat.menuName}</option>`;
        });
    } catch (e) {
        console.error('Lỗi tải danh mục:', e);
    }
}

async function loadProductForEdit(id) {
    const res = await fetch(`/api/admin/products/${id}`, { credentials: 'same-origin' });
    if (!res.ok) {
        showNotification('Không tải được sản phẩm', 'error');
        return;
    }
    const product = await res.json();
    document.getElementById('product-id').value = product.id;
    nameInput.value = product.name || '';
    slugInput.value = product.slug || '';
    // Khi edit: giữ slug hiện tại, cho phép sửa tay
    setSlugAuto(false);
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-price').value = product.price ?? '';
    existingImageInput.value = product.image || '';
    uploadedImageUrl = product.image || '';
    imagePreview.src = product.image || '/admin/assets/upload_area.png';
    await loadCategories(product.category);
}

document.getElementById('add-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const imageFile = imageInput.files[0];
    const id = document.getElementById('product-id').value || productId;

    try {
        if (imageFile) {
            const uploadData = new FormData();
            uploadData.append('image', imageFile);
            const uploadRes = await fetch('/api/admin/products/upload', {
                method: 'POST',
                credentials: 'same-origin',
                body: uploadData
            });
            if (uploadRes.ok) {
                const uploadResult = await uploadRes.json();
                uploadedImageUrl = uploadResult.imageUrl;
            } else {
                const err = await uploadRes.json().catch(() => ({}));
                showNotification(err.message || 'Upload ảnh thất bại', 'error');
                return;
            }
        }

        const slug = slugAutoCheckbox.checked
            ? toSlug(formData.get('name'))
            : (formData.get('slug') || '').trim();

        const product = {
            name: formData.get('name'),
            slug,
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            category: formData.get('category'),
            image: uploadedImageUrl || existingImageInput.value || '/admin/assets/upload_area.png'
        };

        const res = await fetch(id ? `/api/admin/products/${id}` : '/api/admin/products', {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(product)
        });

        if (res.ok) {
            showNotification(id ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
            setTimeout(() => { window.location.href = '/admin/products'; }, 600);
        } else {
            const err = await res.json().catch(() => ({}));
            showNotification(err.message || 'Lưu sản phẩm thất bại', 'error');
        }
    } catch (err) {
        showNotification('Lỗi kết nối server', 'error');
    }
});

document.addEventListener('DOMContentLoaded', async function () {
    if (productId) {
        document.getElementById('page-title').textContent = 'Sửa sản phẩm';
        document.getElementById('breadcrumb-action').textContent = 'Sửa';
        document.getElementById('submit-btn').innerHTML = '<i class="mdi mdi-content-save mr-1"></i> Cập nhật';
        await loadProductForEdit(productId);
    } else {
        setSlugAuto(true);
        await loadCategories();
    }
});
