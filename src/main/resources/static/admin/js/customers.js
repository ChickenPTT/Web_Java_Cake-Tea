async function loadBirthdayToday() {
    const container = document.getElementById('birthday-today-container');
    try {
        const res = await fetch('/api/admin/customers/birthdays-today');
        const users = await res.json();
        if (users.length === 0) {
            container.innerHTML = '<p style="color:#666;">Hôm nay không có khách hàng nào sinh nhật.</p>';
            return;
        }
        container.innerHTML = '<div style="background:#fff3f3;padding:15px;border-radius:8px;">' +
            users.map(u => `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <span>🎂 ${u.name || u.email} - ${u.email}</span>
                    <button onclick="sendBirthdayEmail(${u.id})" class="add-btn" style="width:auto;padding:8px 16px;">Gửi email</button>
                </div>
            `).join('') + '</div>';
    } catch (e) {
        container.innerHTML = '<p style="color:red;">Lỗi tải dữ liệu</p>';
    }
}

async function loadAllCustomers() {
    const res = await fetch('/api/admin/customers');
    const customers = await res.json();
    const container = document.getElementById('customer-list-container');
    if (customers.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:20px;">Chưa có khách hàng.</p>';
        return;
    }
    container.innerHTML = customers.map(u => `
        <div class="list-table-format">
            <p>${u.id}</p>
            <p>${u.name || '-'}</p>
            <p>${u.email}</p>
            <p>${u.birthday || '-'}</p>
            <p><button onclick="sendBirthdayEmail(${u.id})" class="add-btn" style="width:auto;padding:6px 12px;font-size:12px;">Gửi email SN</button></p>
        </div>
    `).join('');
}

async function sendBirthdayEmail(userId) {
    try {
        const res = await fetch(`/api/admin/customers/${userId}/send-birthday-email`, { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            showNotification(data.message || 'Đã gửi email');
        } else {
            showNotification(data.message || 'Gửi email thất bại', 'error');
        }
    } catch (e) {
        showNotification('Lỗi gửi email (kiểm tra cấu hình SMTP)', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadBirthdayToday();
    loadAllCustomers();
});
window.sendBirthdayEmail = sendBirthdayEmail;
