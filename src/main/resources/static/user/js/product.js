// Trang chi tiết sản phẩm — lấy id từ query string ?id=, gọi API và render.

let currentProduct = null;
let selectedQty = 1;

// Định dạng giá theo VND
function formatPrice(value) {
    return `${Number(value || 0).toLocaleString('vi-VN')} VND`;
}

// Lấy id sản phẩm từ URL (?id=123)
function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Khởi tạo trang
function initProductPage() {
    const id = getProductId();
    const container = document.getElementById('product-detail');

    if (!id) {
        showError('Không tìm thấy sản phẩm.');
        return;
    }

    fetch(`/api/food/${encodeURIComponent(id)}`, { credentials: 'same-origin' })
        .then(response => {
            if (!response.ok) throw new Error('not found');
            return response.json();
        })
        .then(product => {
            currentProduct = product;
            renderProduct(product);
            loadRelatedProducts(product);
        })
        .catch(error => {
            console.error('Error loading product:', error);
            showError('Không thể tải thông tin sản phẩm.');
        });
}

function showError(message) {
    const container = document.getElementById('product-detail');
    if (container) {
        container.innerHTML = `
            <div class="product-error">
                <p>${message}</p>
                <p><a href="index.html">← Quay lại trang chủ</a></p>
            </div>`;
    }
    const related = document.getElementById('related-section');
    if (related) related.style.display = 'none';
}

// Render phần chi tiết sản phẩm
function renderProduct(product) {
    document.title = `${product.name} - Sugar Petals`;

    const image = product.image || '/user/assets/food_1.jpg';
    const category = product.category || 'Món ngọt';
    const description = product.description || 'Sản phẩm được chế biến thủ công từ nguyên liệu chọn lọc tại Sugar Petals.';

    // Gallery: sản phẩm chỉ có 1 ảnh -> tạo vài thumbnail từ chính ảnh đó
    const thumbs = [image, image, image];

    const container = document.getElementById('product-detail');
    container.innerHTML = `
        <div class="product-gallery">
            <div class="product-gallery-main">
                <img id="gallery-main-img" src="${image}" alt="${product.name}">
            </div>
            <div class="product-gallery-thumbs">
                ${thumbs.map((src, i) => `
                    <img class="product-thumb${i === 0 ? ' active' : ''}"
                         src="${src}" alt="${product.name}"
                         onclick="selectThumb(this, '${src.replace(/'/g, "\\'")}')">
                `).join('')}
            </div>
        </div>

        <div class="product-info">
            <span class="product-info-category">${category}</span>
            <h1 class="product-info-name">${product.name}</h1>
            <div class="product-info-rating">
                <img src="/user/assets/rating_starts.jpg" alt="Đánh giá">
                <span>(Được yêu thích)</span>
            </div>
            <p class="product-info-price">${formatPrice(product.price)}</p>
            <p class="product-info-desc">${description}</p>

            <div class="product-actions">
                <div class="product-qty">
                    <button type="button" onclick="changeQty(-1)">-</button>
                    <span id="qty-value">1</span>
                    <button type="button" onclick="changeQty(1)">+</button>
                </div>
                <button class="btn-add-cart" onclick="addProductToCart()">Thêm vào giỏ hàng</button>
            </div>

            <div class="product-specs">
                <h3>Thông số kỹ thuật</h3>
                <table>
                    <tbody>
                        <tr><td>Mã sản phẩm</td><td>SP${String(product.id).padStart(4, '0')}</td></tr>
                        <tr><td>Danh mục</td><td>${category}</td></tr>
                        <tr><td>Giá</td><td>${formatPrice(product.price)}</td></tr>
                        <tr><td>Tình trạng</td><td>Còn hàng</td></tr>
                        <tr><td>Bảo quản</td><td>Ngăn mát tủ lạnh, dùng trong 2-3 ngày</td></tr>
                        <tr><td>Xuất xứ</td><td>Sugar Petals Bakery</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Cập nhật breadcrumb
    const crumb = document.getElementById('breadcrumb-current');
    if (crumb) crumb.textContent = product.name;

    // Reset số lượng
    selectedQty = 1;
}

// Chọn ảnh thumbnail
function selectThumb(el, src) {
    const mainImg = document.getElementById('gallery-main-img');
    if (mainImg) mainImg.src = src;
    document.querySelectorAll('.product-thumb').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
}

// Thay đổi số lượng
function changeQty(delta) {
    selectedQty = Math.max(1, selectedQty + delta);
    const qtyValue = document.getElementById('qty-value');
    if (qtyValue) qtyValue.textContent = selectedQty;
}

// Thêm vào giỏ hàng với số lượng đã chọn
function addProductToCart() {
    if (!currentProduct) return;
    const id = currentProduct.id;

    // mThêm 1 lần để tạo ite, sau đó cập nhật đúng số lượng mong muốn
    fetch(`/api/cart/add/${id}`, { method: 'POST', credentials: 'same-origin' })
        .then(response => response.json())
        .then(() => {
            if (selectedQty > 1) {
                return fetch(`/api/cart/update/${id}?quantity=${selectedQty}`, {
                    method: 'POST',
                    credentials: 'same-origin'
                }).then(r => r.json());
            }
            return null;
        })
        .then(data => {
            if (data && typeof updateCartDotFromData === 'function') {
                updateCartDotFromData(data);
            }
            alert(`Đã thêm ${selectedQty} "${currentProduct.name}" vào giỏ hàng!`);
        })
        .catch(error => {
            console.error('Error adding to cart:', error);
            alert('Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
        });
}

// Cập nhật chấm đỏt rên icon giỏ hàng từ dữ liệu trả về
function updateCartDotFromData(data) {
    const cartDot = document.getElementById('cart-dot');
    if (cartDot) {
        const count = Number(data.count) || 0;
        cartDot.style.display = count > 0 ? 'block' : 'none';
    }
}

// Tải sản phẩm liên quan (cùng danh mục), loại bỏ chính sản phẩm hiện tại
function loadRelatedProducts(product) {
    const category = product.category;
    const listEl = document.getElementById('related-products-list');
    if (!listEl) return;

    const url = category
        ? `/api/food/category/${encodeURIComponent(category)}`
        : '/api/food';

    fetch(url, { credentials: 'same-origin' })
        .then(response => response.json())
        .then(items => {
            let related = (items || []).filter(item => item.id !== product.id);

            // Nếu cùng danh mục không đủ, bổ sung từ toàn bộ sản phẩm
            if (related.length < 4 && category) {
                fetch('/api/food', { credentials: 'same-origin' })
                    .then(r => r.json())
                    .then(all => {
                        const extra = (all || []).filter(i =>
                            i.id !== product.id && !related.some(r => r.id === i.id));
                        renderRelated(related.concat(extra).slice(0, 4));
                    })
                    .catch(() => renderRelated(related.slice(0, 4)));
            } else {
                renderRelated(related.slice(0, 4));
            }
        })
        .catch(error => {
            console.error('Error loading related products:', error);
            const section = document.getElementById('related-section');
            if (section) section.style.display = 'none';
        });
}

// Render danh sách sản phẩm liên quan (dùng lại style .food-item của trang chủ)
function renderRelated(items) {
    const listEl = document.getElementById('related-products-list');
    const section = document.getElementById('related-section');
    if (!listEl) return;

    if (!items || items.length === 0) {
        if (section) section.style.display = 'none';
        return;
    }

    listEl.innerHTML = items.map(item => {
        const image = item.image || '/user/assets/food_1.jpg';
        return `
            <div class="food-item" onclick="window.location.href='product.html?id=${item.id}'" style="cursor:pointer;">
                <div class="food-item-img-container">
                    <img class="food-item-img" src="${image}" alt="${item.name}">
                    <img class="add" onclick="event.stopPropagation(); addToCart('${item.id}')" src="/user/assets/add_icon_green.png" alt="Thêm">
                </div>
                <div class="food-item-info">
                    <div class="food-item-name-rating">
                        <p>${item.name}</p>
                        <img src="/user/assets/rating_starts.jpg" alt="">
                    </div>
                    <p class="food-item-desc">${item.description || ''}</p>
                    <p class="food-item-price">${formatPrice(item.price)}</p>
                </div>
            </div>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', initProductPage);

window.selectThumb = selectThumb;
window.changeQty = changeQty;
window.addProductToCart = addProductToCart;
