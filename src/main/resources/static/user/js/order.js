// Place order page — phụ thuộc cart.js (cartData, loadCartItems, updateCartTotals, clearCart)

function getCartItems() {
    if (!cartData || !cartData.cartItems) return [];
    // cartItems có thể là array hoặc object values từ API
    return Array.isArray(cartData.cartItems)
        ? cartData.cartItems
        : Object.values(cartData.cartItems);
}

function placeOrder(form) {
    const items = getCartItems();
    if (items.length === 0) {
        notify.warning('Giỏ hàng của bạn đang trống');
        setTimeout(() => { window.location.href = '/cart.html'; }, 1200);
        return;
    }

    const formData = new FormData(form);
    const totalAmount = Number(cartData.total) || 0;

    const deliveryInfo = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        street: formData.get('street'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipcode: formData.get('zipcode'),
        country: formData.get('country'),
        phone: formData.get('phone')
    };

    const orderData = {
        items: JSON.stringify({
            products: items,
            delivery: deliveryInfo,
            discountLabel: cartData.discountLabel || null,
            discount: cartData.discount || 0,
            promoCode: cartData.promoCode || null
        }),
        amount: totalAmount,
        paymentMethod: 'COD',
        paymentStatus: 'Pending',
        status: 'Pending'
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang xử lý...';
    }

    fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(orderData)
    })
        .then(async (response) => {
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                if (response.status === 401) {
                    notify.warning('Vui lòng đăng nhập để đặt hàng');
                    setTimeout(() => { window.location.href = '/'; }, 1200);
                    return;
                }
                throw new Error(data.message || 'Đặt hàng thất bại');
            }
            return data;
        })
        .then((data) => {
            if (!data) return;
            if (data.success) {
                clearCart();
                notify.success('Đặt hàng thành công! Mã đơn hàng: ' + data.orderId);
                setTimeout(() => { window.location.href = '/myorders.html'; }, 1500);
            } else {
                notify.error('Lỗi đặt hàng: ' + (data.message || 'Vui lòng thử lại'));
            }
        })
        .catch((error) => {
            console.error('Error placing order:', error);
            notify.error(error.message || 'Lỗi kết nối. Vui lòng thử lại');
        })
        .finally(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'ĐẶT HÀNG';
            }
        });
}

function checkAccess() {
    return fetch('/api/current-user', { credentials: 'same-origin' })
        .then((response) => response.json())
        .then((data) => {
            if (!data.authenticated) {
                notify.warning('Vui lòng đăng nhập để đặt hàng');
                setTimeout(() => { window.location.href = '/'; }, 1200);
                return false;
            }
            // Prefill email nếu có
            const emailInput = document.querySelector('input[name="email"]');
            if (emailInput && data.email && !emailInput.value) {
                emailInput.value = data.email;
            }
            const firstNameInput = document.querySelector('input[name="firstName"]');
            if (firstNameInput && data.name && !firstNameInput.value) {
                firstNameInput.value = data.name;
            }
            return true;
        })
        .catch((error) => {
            console.error('Error checking auth:', error);
            return false;
        });
}

document.addEventListener('DOMContentLoaded', async function () {
    const form = document.getElementById('order-form');
    if (!form) return;

    const ok = await checkAccess();
    if (!ok) return;

    // Đảm bảo cart đã load trước khi hiện tổng & cho đặt hàng
    if (typeof loadCartItems === 'function') {
        await loadCartItems();
    } else if (typeof updateCartTotals === 'function') {
        updateCartTotals();
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        placeOrder(this);
    });
});
