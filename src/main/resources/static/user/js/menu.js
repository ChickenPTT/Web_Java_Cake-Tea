// ===== Trang Thực đơn: hiển thị danh mục + sản phẩm theo danh mục =====

let menuAllFoods = [];     // toàn bộ sản phẩm lấy từ API
let menuCategories = [];   // danh sách danh mục (menu) từ API
let activeCategory = 'All';

// Lấy giá trị tham số trên URL (vd: ?category=Bánh kem)
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function formatPriceVnd(price) {
    return Number(price).toLocaleString('vi-VN') + ' VND';
}

// Vẽ danh sách danh mục ở sidebar
function renderCategorySidebar() {
    const list = document.getElementById('menu-category-list');
    if (!list) return;

    let html = `
        <li class="${activeCategory === 'All' ? 'active' : ''}" onclick="selectCategory('All')">
            <span>Tất cả sản phẩm</span>
        </li>`;

    html += menuCategories.map((item) => {
        const name = item.menuName || item.menu_name;
        const img = item.menuImage || item.menu_image || '';
        const isActive = activeCategory === name ? 'active' : '';
        const imgTag = img ? `<img src="${img}" alt="${name}">` : '';
        return `
            <li class="${isActive}" onclick="selectCategory('${name.replace(/'/g, "\\'")}')">
                ${imgTag}<span>${name}</span>
            </li>`;
    }).join('');

    list.innerHTML = html;
}

// Vẽ lưới sản phẩm theo danh mục đang chọn
function renderMenuProducts() {
    const grid = document.getElementById('menu-product-grid');
    const title = document.getElementById('menu-products-title');
    const count = document.getElementById('menu-products-count');
    if (!grid) return;

    const items = activeCategory === 'All'
        ? menuAllFoods
        : menuAllFoods.filter(f => f.category === activeCategory);

    if (title) title.textContent = activeCategory === 'All' ? 'Tất cả sản phẩm' : activeCategory;
    if (count) count.textContent = `${items.length} sản phẩm`;

    if (items.length === 0) {
        grid.innerHTML = `<div class="menu-empty">Chưa có sản phẩm nào trong danh mục này.</div>`;
        return;
    }

    grid.innerHTML = items.map((item) => {
        const itemId = item.id || item._id;
        return `
            <div class="food-item" onclick="window.location.href='product.html?id=${itemId}'" style="cursor:pointer;">
                <div class="food-item-img-container">
                    <img class="food-item-img" src="${item.image}" alt="${item.name}">
                    <img class="add" onclick="event.stopPropagation(); addToCart('${itemId}')" src="/user/assets/add_icon_green.png" alt="">
                </div>
                <div class="food-item-info">
                    <div class="food-item-name-rating">
                        <p>${item.name}</p>
                        <img src="/user/assets/rating_starts.jpg" alt="">
                    </div>
                    <p class="food-item-desc">${item.description || ''}</p>
                    <p class="food-item-price">${formatPriceVnd(item.price)}</p>
                </div>
            </div>`;
    }).join('');
}

// Chọn danh mục: cập nhật trạng thái, URL và vẽ lại
function selectCategory(category) {
    activeCategory = category;
    const url = category === 'All'
        ? 'menu.html'
        : 'menu.html?category=' + encodeURIComponent(category);
    window.history.replaceState({}, '', url);
    renderCategorySidebar();
    renderMenuProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadMenuData() {
    // Tải song song danh mục và sản phẩm
    Promise.all([
        fetch('/api/menu').then(r => r.ok ? r.json() : []),
        fetch('/api/food').then(r => r.ok ? r.json() : [])
    ])
    .then(([menus, foods]) => {
        menuCategories = Array.isArray(menus) ? menus : [];
        menuAllFoods = Array.isArray(foods) ? foods : [];
        renderCategorySidebar();
        renderMenuProducts();
    })
    .catch((err) => {
        console.error('Error loading menu data:', err);
        renderCategorySidebar();
        renderMenuProducts();
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const paramCategory = getQueryParam('category');
    if (paramCategory) activeCategory = paramCategory;
    loadMenuData();
});

// Cho phép gọi từ HTML inline
window.selectCategory = selectCategory;
