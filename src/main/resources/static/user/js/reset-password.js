document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('reset-form');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const token = document.getElementById('reset-token').value;
        const password = document.getElementById('new-password').value;
        const confirm = document.getElementById('confirm-password').value;

        if (password.length < 6) {
            notify.warning('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        if (password !== confirm) {
            notify.warning('Mật khẩu nhập lại không khớp');
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Đang cập nhật...';
        }

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ token, password })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) {
                notify.error(data.message || 'Đặt lại mật khẩu thất bại');
                return;
            }
            notify.success(data.message || 'Đặt lại mật khẩu thành công');
            setTimeout(() => { window.location.href = '/'; }, 1500);
        } catch (err) {
            console.error(err);
            notify.error('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Cập nhật mật khẩu';
            }
        }
    });
});
