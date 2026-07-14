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
        alert('Giỏ hàng của bạn đang trống');
        window.location.href = '/cart.html';
        return;
    }

    const formData = new FormData(form);
    const deliveryFee = cartData.total > 0 ? 2 : 0;
    const totalAmount = (cartData.total || 0) + deliveryFee;

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
            delivery: deliveryInfo
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
                    alert('Vui lòng đăng nhập để đặt hàng');
                    window.location.href = '/';
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
                alert('Đặt hàng thành công! Mã đơn hàng: ' + data.orderId);
                window.location.href = '/myorders.html';
            } else {
                alert('Lỗi đặt hàng: ' + (data.message || 'Vui lòng thử lại'));
            }
        })
        .catch((error) => {
            console.error('Error placing order:', error);
            alert(error.message || 'Lỗi kết nối. Vui lòng thử lại');
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
                alert('Vui lòng đăng nhập để đặt hàng');
                window.location.href = '/';
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
