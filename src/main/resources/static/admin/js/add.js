const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('image-preview');
let uploadedImageUrl = '';

imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) { imagePreview.src = ev.target.result; };
        reader.readAsDataURL(file);
    }
});

async function loadCategories() {
    const select = document.getElementById('category-select');
    try {
        const res = await fetch('/api/admin/categories');
        const categories = await res.json();
        select.innerHTML = '<option value="">-- Chọn danh mục --</option>';
        categories.forEach(cat => {
            select.innerHTML += `<option value="${cat.menuName}">${cat.menuName}</option>`;
        });
    } catch (e) {
        console.error('Lỗi tải danh mục:', e);
    }
}

document.getElementById('add-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const imageFile = imageInput.files[0];

    if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        const uploadRes = await fetch('/api/admin/products/upload', { method: 'POST', body: uploadData });
        if (uploadRes.ok) {
            const uploadResult = await uploadRes.json();
            uploadedImageUrl = uploadResult.imageUrl;
        }
    }

    const product = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        image: uploadedImageUrl || '/admin/assets/upload_area.png'
    };

    try {
        const res = await fetch('/api/admin/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        if (res.ok) {
            showNotification('Thêm sản phẩm thành công!');
            this.reset();
            imagePreview.src = '/admin/assets/upload_area.png';
            uploadedImageUrl = '';
        } else {
            showNotification('Thêm sản phẩm thất bại', 'error');
        }
    } catch (err) {
        showNotification('Lỗi kết nối server', 'error');
    }
});

document.addEventListener('DOMContentLoaded', loadCategories);
