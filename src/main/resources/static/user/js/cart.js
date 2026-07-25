let cartData = {
    cartItems: [],
    subtotal: 0,
    discount: 0,
    discountLabel: '',
    deliveryFee: 0,
    total: 0,
    count: 0,
    promoCode: '',
    appliedComboId: null,
    comboName: '',
    comboSavings: 0
};

function normalizeCartPayload(data) {
    const items = data.cartItems;
    return {
        cartItems: Array.isArray(items) ? items : (items ? Object.values(items) : []),
        subtotal: Number(data.subtotal != null ? data.subtotal : data.total) || 0,
        discount: Number(data.discount) || 0,
        discountLabel: data.discountLabel || '',
        deliveryFee: Number(data.deliveryFee != null ? data.deliveryFee : ((Number(data.subtotal || data.total) || 0) > 0 ? 2 : 0)) || 0,
        total: Number(data.total) || 0,
        count: Number(data.count) || 0,
        promoCode: data.promoCode || '',
        appliedComboId: data.appliedComboId || null,
        comboName: data.comboName || '',
        comboSavings: Number(data.comboSavings) || 0
    };
}

function loadCartItems() {
    return fetch('/api/cart', { credentials: 'same-origin' })
        .then(response => response.json())
        .then(data => {
            cartData = normalizeCartPayload(data);
            renderCartItems();
            updateCartTotals();
            updateCartDot();
            return cartData;
        })
        .catch(error => {
            console.error('Error loading cart:', error);
            cartData = { cartItems: [], subtotal: 0, discount: 0, discountLabel: '', deliveryFee: 0, total: 0, count: 0, promoCode: '', appliedComboId: null, comboName: '', comboSavings: 0 };
            renderCartItems();
            updateCartTotals();
            updateCartDot();
            return cartData;
        });
}

function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString('vi-VN')} đ`;
}

function updateCartPageState() {
    const hasItems = Array.isArray(cartData.cartItems) && cartData.cartItems.length > 0;
    const layout = document.getElementById('cart-layout');
    const empty = document.getElementById('cart-empty');
    const countEl = document.getElementById('cart-item-count');
    const clearBtn = document.getElementById('cart-clear-btn');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    if (layout) layout.hidden = !hasItems;
    if (empty) empty.hidden = hasItems;
    if (countEl) {
        const n = Number(cartData.count) || 0;
        countEl.textContent = n === 1 ? '1 sản phẩm' : `${n} sản phẩm`;
    }
    if (clearBtn) clearBtn.hidden = !hasItems;
    if (checkoutBtn) checkoutBtn.disabled = !hasItems;
}

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;

    updateCartPageState();

    if (!cartData.cartItems || cartData.cartItems.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = cartData.cartItems.map(item => {
        const title = escapeHtml(item.title || 'Sản phẩm');
        const category = escapeHtml(item.category || '');
        const image = escapeHtml(item.image || '/user/assets/food_1.jpg');
        const id = Number(item.productId);
        return `
        <article class="cart-item" data-product-id="${id}">
            <div class="cart-item-product">
                <img class="cart-item-thumb" src="${image}" alt="${title}">
                <div class="cart-item-meta">
                    <h3 class="cart-item-title">${title}</h3>
                    ${category ? `<p class="cart-item-category">${category}</p>` : ''}
                </div>
            </div>
            <p class="cart-item-price">${formatMoney(item.price)}</p>
            <div class="cart-qty" role="group" aria-label="Số lượng ${title}">
                <button type="button" aria-label="Giảm số lượng" onclick="updateQuantity(${id}, ${item.quantity - 1})">−</button>
                <span>${item.quantity}</span>
                <button type="button" aria-label="Tăng số lượng" onclick="updateQuantity(${id}, ${item.quantity + 1})">+</button>
            </div>
            <p class="cart-item-line-total">${formatMoney(item.total)}</p>
            <button type="button" class="cart-item-remove" aria-label="Xóa ${title}" onclick="removeFromCart(${id})">×</button>
        </article>`;
    }).join('');
}

function updateCartTotals() {
    const subtotalEl = document.getElementById('subtotal');
    const discountRow = document.getElementById('discount-row');
    const discountEl = document.getElementById('discount');
    const discountLabelEl = document.getElementById('discount-label');
    const deliveryFeeEl = document.getElementById('delivery-fee');
    const totalEl = document.getElementById('total');
    const promoInput = document.getElementById('promo-code-input');
    const comboBanner = document.getElementById('cart-combo-banner');
    const comboBannerText = document.getElementById('cart-combo-banner-text');
    const comboBannerTitle = document.getElementById('cart-combo-banner-title');

    if (subtotalEl) subtotalEl.textContent = formatMoney(cartData.subtotal);
    if (deliveryFeeEl) deliveryFeeEl.textContent = formatMoney(cartData.deliveryFee);
    if (totalEl) totalEl.textContent = formatMoney(cartData.total);

    if (discountRow) {
        const hasDiscount = Number(cartData.discount) > 0;
        discountRow.hidden = !hasDiscount;
        if (discountEl) discountEl.textContent = `-${formatMoney(cartData.discount)}`;
        if (discountLabelEl) discountLabelEl.textContent = cartData.discountLabel || 'Giảm giá';
    }
    if (promoInput && cartData.promoCode) {
        promoInput.value = cartData.promoCode;
    }

    if (comboBanner) {
        const showCombo = cartData.appliedComboId && Number(cartData.comboSavings) > 0;
        comboBanner.hidden = !showCombo;
        if (showCombo) {
            if (comboBannerTitle) {
                comboBannerTitle.textContent = cartData.comboName
                    ? `Combo: ${cartData.comboName}`
                    : 'Combo đang áp dụng';
            }
            if (comboBannerText) {
                comboBannerText.textContent =
                    `Giá từng món vẫn hiện giá gốc; bạn được giảm ${formatMoney(cartData.comboSavings)} ở tổng đơn (đã trừ giá combo).`;
            }
        }
    }

    updateCartPageState();
}

function updateCartDot() {
    const cartDot = document.getElementById('cart-dot');
    if (cartDot) {
        cartDot.style.display = cartData.count > 0 ? 'block' : 'none';
    }
}

function addToCart(id) {
    fetch(`/api/cart/add/${id}`, {
        method: 'POST',
        credentials: 'same-origin'
    })
        .then(response => response.json())
        .then(data => {
            cartData = normalizeCartPayload(data);
            updateCartDot();
            if (typeof notify !== 'undefined') notify.success('Đã thêm sản phẩm vào giỏ hàng!');
        })
        .catch(error => console.error('Error adding to cart:', error));
}

function addComboToCart(id) {
    fetch(`/api/cart/add-combo/${id}`, {
        method: 'POST',
        credentials: 'same-origin'
    })
        .then(async response => {
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || 'Không thêm được combo');
            }
            cartData = normalizeCartPayload(data);
            updateCartDot();
            if (typeof notify !== 'undefined') notify.success(data.message || 'Đã thêm combo vào giỏ hàng!');
        })
        .catch(error => {
            console.error(error);
            if (typeof notify !== 'undefined') notify.error(error.message || 'Lỗi thêm combo');
        });
}

function applyPromoCode() {
    const input = document.getElementById('promo-code-input');
    const code = input ? input.value.trim() : '';
    fetch('/api/cart/apply-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ code })
    })
        .then(async response => {
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || 'Mã không hợp lệ');
            }
            cartData = normalizeCartPayload(data);
            renderCartItems();
            updateCartTotals();
            updateCartDot();
            if (typeof notify !== 'undefined') notify.success(data.message || 'Áp dụng mã thành công');
        })
        .catch(error => {
            if (typeof notify !== 'undefined') notify.error(error.message || 'Mã không hợp lệ');
        });
}

function removeFromCart(id) {
    fetch(`/api/cart/remove/${id}`, {
        method: 'POST',
        credentials: 'same-origin'
    })
        .then(response => response.json())
        .then(data => {
            cartData = normalizeCartPayload(data);
            renderCartItems();
            updateCartTotals();
            updateCartDot();
        })
        .catch(error => console.error('Error removing from cart:', error));
}

function updateQuantity(id, quantity) {
    if (quantity < 0) return;
    fetch(`/api/cart/update/${id}?quantity=${quantity}`, {
        method: 'POST',
        credentials: 'same-origin'
    })
        .then(response => response.json())
        .then(data => {
            cartData = normalizeCartPayload(data);
            renderCartItems();
            updateCartTotals();
            updateCartDot();
        })
        .catch(error => console.error('Error updating quantity:', error));
}

function clearCart() {
    return fetch('/api/cart/clear', {
        method: 'POST',
        credentials: 'same-origin'
    })
        .then(response => response.json())
        .then(data => {
            cartData = normalizeCartPayload(data);
            renderCartItems();
            updateCartTotals();
            updateCartDot();
            return cartData;
        })
        .catch(error => console.error('Error clearing cart:', error));
}

document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('order-form')) {
        loadCartItems();
        loadCartPromoSuggestions();
    }
    const promoBtn = document.getElementById('promo-apply-btn');
    if (promoBtn) promoBtn.addEventListener('click', applyPromoCode);

    const promoInput = document.getElementById('promo-code-input');
    if (promoInput) {
        promoInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyPromoCode();
            }
        });
    }

    const clearBtn = document.getElementById('cart-clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (!cartData.count) return;
            if (window.confirm('Bạn muốn xóa toàn bộ sản phẩm trong giỏ hàng?')) {
                clearCart();
            }
        });
    }
});

function escapeCartHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function loadCartPromoSuggestions() {
    const box = document.getElementById('cart-promo-suggestions');
    if (!box) return;

    fetch('/api/campaigns/active', { credentials: 'same-origin' })
        .then(r => r.ok ? r.json() : [])
        .then(campaigns => {
            const list = Array.isArray(campaigns) ? campaigns : [];
            const suggestions = [
                {
                    code: 'BIRTHDAY10',
                    label: 'Sinh nhật -10%',
                    hint: 'Dùng trong ngày sinh nhật'
                },
                ...list.map(c => {
                    const code = c.promoCode || ('CAMP' + c.id);
                    const tag = c.discountPercent
                        ? `-${c.discountPercent}%`
                        : (c.discountAmount ? `-${Number(c.discountAmount).toLocaleString('vi-VN')}đ` : 'Ưu đãi');
                    return {
                        code,
                        label: `${tag} · ${c.name || code}`,
                        hint: c.description || (c.targetCategory ? `Danh mục ${c.targetCategory}` : 'Chiến dịch đang diễn ra')
                    };
                })
            ];

            // unique by code
            const seen = new Set();
            const unique = suggestions.filter(s => {
                const key = String(s.code || '').toUpperCase();
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            if (!unique.length) {
                box.hidden = true;
                box.innerHTML = '';
                return;
            }

            box.hidden = false;
            box.innerHTML = `
                <p class="cart-promo-suggest-title">Gợi ý mã đang áp dụng</p>
                <div class="cart-promo-chips">
                    ${unique.map(s => `
                        <button type="button"
                            class="cart-promo-chip"
                            title="${escapeCartHtml(s.hint || '')}"
                            data-code="${escapeCartHtml(s.code)}"
                            onclick="applySuggestedPromo(this.dataset.code)">
                            <span class="cart-promo-chip-code">${escapeCartHtml(s.code)}</span>
                            <span class="cart-promo-chip-label">${escapeCartHtml(s.label)}</span>
                        </button>
                    `).join('')}
                </div>
            `;
        })
        .catch(() => {
            box.hidden = true;
        });
}

function applySuggestedPromo(code) {
    const input = document.getElementById('promo-code-input');
    if (input) input.value = code || '';
    applyPromoCode();
}

window.addToCart = addToCart;
window.addComboToCart = addComboToCart;
window.applyPromoCode = applyPromoCode;
window.applySuggestedPromo = applySuggestedPromo;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.clearCart = clearCart;
window.loadCartItems = loadCartItems;
window.updateCartTotals = updateCartTotals;
