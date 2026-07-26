// Global variable to store all food items from backend
let allFoodItems = [];
let allMenuItems = [];

// --- Trạng thái phân trang ---
let currentPage = 1;            // trang hiện tại (bắt đầu từ 1)
let pageSize = 8;               // số sản phẩm hiển thị trong 1 trang (người dùng chọn)
let currentFoodList = [];       // toàn bộ danh sách đang được phân trang (sau khi lọc/tìm kiếm)

// Render menu categories
function renderMenuCategories() {
    const menuContainer = document.getElementById('menu-categories');
    if (!menuContainer) return;

    // Use backend data if available, otherwise use local data
    const menuData = allMenuItems.length > 0 ? allMenuItems : menulist;

    menuContainer.innerHTML = menuData.map((item) => {
        const menuName = item.menuName || item.menu_name;
        const menuImage = item.menuImage || item.menu_image;
        const isActive = currentCategory === menuName ? 'active' : '';
        return `
            <div onclick="setCategory('${menuName}')" class="explore-menu-list-item">
                <img class="${isActive}" src="${menuImage}" alt="${menuName}">
                <p>${menuName}</p>
            </div>
        `;
    }).join('');
}

// Set category
function setCategory(category) {
    currentCategory = category === currentCategory ? 'All' : category;
    renderMenuCategories();
    renderFoodItems();
}

// Render food items
// Tính danh sách sản phẩm cần hiển thị (theo tìm kiếm/lọc danh mục), lưu lại rồi hiển thị trang hiện tại.
function renderFoodItems(itemsToRender = null) {
    const foodContainer = document.getElementById('food-list');
    if (!foodContainer) return;

    // Use provided items or fallback to current data
    let items = itemsToRender;

    // If no items provided, use local data or backend data
    if (!items) {
        if (allFoodItems.length > 0) {
            items = allFoodItems;
        } else {
            items = foodlist;
        }
    }

    // Filter by category if needed
    if (currentCategory !== 'All' && !itemsToRender) {
        items = items.filter(item => item.category === currentCategory);
    }

    // Lưu danh sách đầy đủ và quay lại trang 1 mỗi khi nguồn dữ liệu thay đổi (tìm kiếm/lọc/tải lại)
    currentFoodList = Array.isArray(items) ? items : [];
    currentPage = 1;
    renderCurrentPage();
}
function formatPrice(price){
    return price.toLocaleString('vi-VN') + " VND";
}
// Hiển thị đúng phần sản phẩm thuộc trang hiện tại (dựa trên currentFoodList, currentPage, pageSize)
function renderCurrentPage() {
    const foodContainer = document.getElementById('food-list');
    if (!foodContainer) return;

    const fullList = currentFoodList;
    const totalItems = fullList.length;

    // pageSize === 'all' => hiển thị tất cả trong 1 trang
    const showAll = pageSize === 'all';
    const size = showAll ? (totalItems || 1) : pageSize;
    const totalPages = showAll ? 1 : Math.max(1, Math.ceil(totalItems / size));

    // Chặn currentPage trong khoảng hợp lệ
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = showAll ? 0 : (currentPage - 1) * size;
    const items = fullList.slice(startIndex, startIndex + size);

    // Prevent single item from stretching to full width
    // Reset any previous layout adjustments
    foodContainer.style.display = '';
    foodContainer.style.justifyContent = '';

    const isSingleItem = Array.isArray(items) && items.length === 1;
    if (isSingleItem) {
        // Center single item and avoid full-width stretch
        foodContainer.style.display = 'flex';
        foodContainer.style.justifyContent = 'center';
    }

    foodContainer.innerHTML = items.map((item) => {
        const itemId = item.id || item._id;
        const detailUrl = item.slug
            ? `/product/${encodeURIComponent(item.slug)}`
            : `/product.html?id=${itemId}`;
        // Click card -> mở trang chi tiết; nút thêm giỏ hàng chặn sự kiện lan ra ngoài
        const cartControl = `<img class="add" onclick="event.stopPropagation(); addToCart('${itemId}')" src="/user/assets/add_icon_green.png" alt="">`;

        return `
            <div class="food-item${isSingleItem ? ' single' : ''}" onclick="window.location.href='${detailUrl}'" style="cursor:pointer;">
                <div class="food-item-img-container">
                    <img class="food-item-img" src="${item.image}" alt="${item.name}">
                    ${cartControl}
                </div>
                <div class="food-item-info">
                    <div class="food-item-name-rating">
                        <p>${item.name}</p>
                        <img src="/user/assets/rating_starts.jpg" alt="">
                    </div>
                    <p class="food-item-desc food-item-short">${item.description}</p>
                    <p class="food-item-price">${formatPrice(item.price)}</p>
                </div>
            </div>
        `;
    }).join('');

    // If single item, constrain its width via inline style to avoid 100% width (fallback if CSS not present)
    if (isSingleItem) {
        const singleEl = foodContainer.querySelector('.food-item.single');
        if (singleEl) {
            singleEl.style.maxWidth = '420px';
            singleEl.style.width = '100%';
            singleEl.style.boxSizing = 'border-box';
            // Make sure it doesn't visually stretch by constraining its inner layout
            singleEl.style.display = 'block';
        }
    }

    // Vẽ nút chuyển trang + thông tin trang
    renderPaginationControls(totalItems, totalPages, showAll);
}

// Vẽ thanh điều hướng phân trang (Trước / các số trang / Sau) và thông tin trang
function renderPaginationControls(totalItems, totalPages, showAll) {
    const controls = document.getElementById('pagination-controls');
    const pageInfo = document.getElementById('page-info');

    if (pageInfo) {
        if (totalItems === 0) {
            pageInfo.textContent = 'Không có sản phẩm';
        } else if (showAll) {
            pageInfo.textContent = `Hiển thị tất cả ${totalItems} sản phẩm`;
        } else {
            const start = (currentPage - 1) * pageSize + 1;
            const end = Math.min(currentPage * pageSize, totalItems);
            pageInfo.textContent = `Hiển thị ${start}-${end} / ${totalItems} sản phẩm`;
        }
    }

    if (!controls) return;

    // Không cần nút chuyển trang khi chỉ có 1 trang hoặc đang hiển thị tất cả
    if (showAll || totalPages <= 1) {
        controls.innerHTML = '';
        return;
    }

    let html = '';
    // Nút "Trước"
    html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>&laquo; Trước</button>`;

    // Các nút số trang
    for (let p = 1; p <= totalPages; p++) {
        const activeClass = p === currentPage ? ' active' : '';
        html += `<button class="page-btn${activeClass}" onclick="goToPage(${p})">${p}</button>`;
    }

    // Nút "Sau"
    html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Sau &raquo;</button>`;

    controls.innerHTML = html;
}

// Người dùng đổi số sản phẩm hiển thị trong 1 trang
function changePageSize(value) {
    pageSize = value === 'all' ? 'all' : parseInt(value, 10);
    currentPage = 1;
    renderCurrentPage();
}

// Chuyển tới trang được chọn
function goToPage(page) {
    currentPage = page;
    renderCurrentPage();
    // Cuộn lên đầu khu vực sản phẩm để dễ xem
    const foodDisplay = document.getElementById('food-display');
    if (foodDisplay) {
        foodDisplay.scrollIntoView({ behavior: 'smooth' });
    }
}

// Login popup functionality - removed, now in navbar.js
// showLoginPopup, closeLoginPopup, toggleLoginMode are in navbar.js

// Update authentication UI
function updateAuthUI() {
    const signinBtn = document.getElementById('signin-btn');
    const navbarProfile = document.getElementById('navbar-profile');

    // This will be called after login/register
    // The navbar.js checkUserSession() function handles the UI update
}

// Refresh food items when data changes
function refreshFoodItems() {
    renderFoodItems();
}

// Load hot/new products (Feature 6)
function loadHotProducts() {
    fetch('/api/food/hot')
        .then(response => {
            if (!response.ok) throw new Error('hot products failed');
            return response.json();
        })
        .then(data => {
            allFoodItems = data;
            renderFoodItems(data);
            currentCategory = 'All';
            renderMenuCategories();
            scrollToExplore();
        })
        .catch(error => {
            console.error('Error loading hot products:', error);
            loadAllFood();
        });
}

// Load best-selling products
function loadBestSellersProducts() {
    fetch('/api/food/bestsellers')
        .then(response => {
            if (!response.ok) throw new Error('bestsellers failed');
            return response.json();
        })
        .then(data => {
            allFoodItems = data;
            renderFoodItems(data);
            currentCategory = 'All';
            renderMenuCategories();
            scrollToExplore();
        })
        .catch(error => {
            console.error('Error loading best sellers:', error);
            loadAllFood();
        });
}

// Search functionality (Feature 7)
function handleSearch(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}

function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm.length > 0) {
        // Call backend API to search
        fetch(`/api/food/search?name=${encodeURIComponent(searchTerm)}`)
            .then(response => response.json())
            .then(data => {
                allFoodItems = data;
                renderFoodItems(data);
                currentCategory = 'All'; // Reset category filter
                renderMenuCategories();
                scrollToExplore();
            })
            .catch(error => {
                console.error('Error searching food:', error);
                // Fallback to local search if backend fails
                const localResults = foodlist.filter(item => 
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                renderFoodItems(localResults);
                scrollToExplore();
            });
    } else {
        // If search is empty, load all food from backend
        loadAllFood();
        scrollToExplore();
    }
}

// Search by category (Feature 7 - advanced search)
function searchByCategory(categoryName) {
    setCategory(categoryName);
}

// Combined search - search by name and category
function advancedSearch(searchTerm, categoryFilter = null) {
    const allItems = allFoodItems.length > 0 ? allFoodItems : foodlist;
    
    let results = allItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (categoryFilter && categoryFilter !== 'All') {
        results = results.filter(item => item.category === categoryFilter);
    }
    
    renderFoodItems(results);
    if (results.length > 0) {
        scrollToExplore();
    } else {
        notify.warning('Không tìm thấy sản phẩm phù hợp');
    }
}
// Scroll xuong menu food
function scrollToExplore() {
    const exploreSection = document.getElementById("explore-menu");
    if (exploreSection) {
        exploreSection.scrollIntoView({behavior: "smooth"});
    }
}
function loadAllFood() {
    fetch('/api/food')
        .then(response => response.json())
        .then(data => {
            allFoodItems = data;
            renderFoodItems(data);
        })
        .catch(error => {
            console.error('Error loading food:', error);
            // Fallback to local data
            allFoodItems = [];
            renderFoodItems();
        });
}

function loadAllMenus() {
    fetch('/api/menu')
        .then(response => response.json())
        .then(data => {
            allMenuItems = data;
            renderMenuCategories();
        })
        .catch(error => {
            console.error('Error loading menus:', error);
            // Fallback to local data
            allMenuItems = [];
            renderMenuCategories();
        });
}

// Initialize — luôn lấy dữ liệu từ API (cùng DB với admin)
document.addEventListener('DOMContentLoaded', function() {
    loadAllMenus();
    loadAllFood();
    loadActivePromotions();
});

function formatPromoPrice(value) {
    return `${Number(value || 0).toLocaleString('vi-VN')} đ`;
}

function escapePromoHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

let comboCountdownTimer = null;

function loadActivePromotions() {
    fetch('/api/combos/active', { credentials: 'same-origin' })
        .then(r => r.ok ? r.json() : [])
        .then(combos => renderCombos(Array.isArray(combos) ? combos : []))
        .catch(err => console.error('Error loading promotions:', err));
}

function parsePromoEndDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

function formatCountdownParts(ms) {
    if (ms <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const totalSec = Math.floor(ms / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return { expired: false, days, hours, minutes, seconds };
}

function pad2(n) {
    return String(n).padStart(2, '0');
}

function buildCountdownHtml(endDateIso, comboId) {
    const end = parsePromoEndDate(endDateIso);
    if (!end) {
        return `
            <div class="combo-countdown combo-countdown--open">
                <span class="combo-countdown-label">Đang diễn ra</span>
                <span class="combo-sale-pulse">HOT</span>
            </div>`;
    }
    const parts = formatCountdownParts(end.getTime() - Date.now());
    if (parts.expired) {
        return `
            <div class="combo-countdown combo-countdown--ended">
                <span class="combo-countdown-label">Đã hết hạn</span>
            </div>`;
    }
    return `
        <div class="combo-countdown" data-end="${escapePromoHtml(endDateIso)}" data-combo-id="${comboId}">
            <span class="combo-countdown-label">Kết thúc sau</span>
            <div class="combo-countdown-units">
                ${parts.days > 0 ? `<div class="combo-cd-unit"><b data-cd="days">${pad2(parts.days)}</b><small>Ngày</small></div>` : ''}
                <div class="combo-cd-unit"><b data-cd="hours">${pad2(parts.hours)}</b><small>Giờ</small></div>
                <div class="combo-cd-unit"><b data-cd="minutes">${pad2(parts.minutes)}</b><small>Phút</small></div>
                <div class="combo-cd-unit"><b data-cd="seconds">${pad2(parts.seconds)}</b><small>Giây</small></div>
            </div>
        </div>`;
}

function renderSectionFlashCountdown(combos) {
    const host = document.getElementById('combo-section-countdown');
    if (!host) return;

    const ends = combos
        .map(c => parsePromoEndDate(c.endDate))
        .filter(Boolean)
        .sort((a, b) => a.getTime() - b.getTime());

    if (!ends.length) {
        host.hidden = true;
        host.innerHTML = '';
        return;
    }

    const nearest = ends[0];
    host.hidden = false;
    host.innerHTML = `
        <div class="combo-countdown combo-countdown--header" data-end="${nearest.toISOString()}" data-combo-id="section">
            <span class="combo-countdown-label">Kết thúc sớm nhất</span>
            <div class="combo-countdown-units">
                <div class="combo-cd-unit"><b data-cd="days">00</b><small>Ngày</small></div>
                <div class="combo-cd-unit"><b data-cd="hours">00</b><small>Giờ</small></div>
                <div class="combo-cd-unit"><b data-cd="minutes">00</b><small>Phút</small></div>
                <div class="combo-cd-unit"><b data-cd="seconds">00</b><small>Giây</small></div>
            </div>
        </div>`;
}

function startComboCountdowns() {
    if (comboCountdownTimer) {
        clearInterval(comboCountdownTimer);
        comboCountdownTimer = null;
    }
    const nodes = document.querySelectorAll('.combo-countdown[data-end]');
    if (!nodes.length) return;

    const tick = () => {
        nodes.forEach(node => {
            const end = parsePromoEndDate(node.getAttribute('data-end'));
            if (!end) return;
            const parts = formatCountdownParts(end.getTime() - Date.now());
            if (parts.expired) {
                node.classList.add('combo-countdown--ended');
                node.innerHTML = '<span class="combo-countdown-label">Đã hết hạn</span>';
                return;
            }
            const set = (key, val) => {
                const el = node.querySelector(`[data-cd="${key}"]`);
                if (el) el.textContent = pad2(val);
            };
            set('days', parts.days);
            set('hours', parts.hours);
            set('minutes', parts.minutes);
            set('seconds', parts.seconds);
        });
    };

    tick();
    comboCountdownTimer = setInterval(tick, 1000);
}

function renderCombos(combos) {
    const section = document.getElementById('combo-section');
    const list = document.getElementById('combo-list');
    if (!section || !list) return;
    if (!combos.length) {
        section.style.display = 'none';
        return;
    }
    section.style.display = 'block';
    renderSectionFlashCountdown(combos);
    list.innerHTML = combos.map(c => {
        const items = (c.items || []).map(i => `${escapePromoHtml(i.foodName || 'SP')} x${i.quantity || 1}`).join(', ');
        const name = escapePromoHtml(c.name);
        const desc = escapePromoHtml(c.description || 'Combo ưu đãi đặc biệt');
        return `
            <div class="promo-card combo-flash-card">
                <span class="combo-flash-ribbon">FLASH SALE</span>
                <div class="combo-flash-price-row">
                    <span class="promo-tag">${formatPromoPrice(c.comboPrice)}</span>
                </div>
                ${buildCountdownHtml(c.endDate, c.id)}
                <h3>${name}</h3>
                <p>${desc}</p>
                <div class="promo-combo-items">${items || 'Combo sản phẩm'}</div>
                <button type="button" onclick="addComboToCart(${c.id})">Thêm combo vào giỏ</button>
            </div>
        `;
    }).join('');
    startComboCountdowns();
}

function copyPromoCode(code) {
    if (!code) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
            if (typeof notify !== 'undefined') notify.success('Đã sao chép mã ' + code);
        }).catch(() => {
            if (typeof notify !== 'undefined') notify.info('Mã khuyến mãi: ' + code);
        });
    } else if (typeof notify !== 'undefined') {
        notify.info('Mã khuyến mãi: ' + code);
    }
}

// Make functions globally available
window.setCategory = setCategory;
window.showLoginPopup = showLoginPopup;
window.closeLoginPopup = closeLoginPopup;
window.toggleLoginMode = toggleLoginMode;
window.logout = logout;
window.refreshFoodItems = refreshFoodItems;
window.handleSearch = handleSearch;
window.performSearch = performSearch;
window.loadHotProducts = loadHotProducts;
window.loadBestSellersProducts = loadBestSellersProducts;
window.searchByCategory = searchByCategory;
window.advancedSearch = advancedSearch;
window.changePageSize = changePageSize;
window.goToPage = goToPage;
window.copyPromoCode = copyPromoCode;

// Cart functions - loaded from cart.js
// These functions are implemented in cart.js
