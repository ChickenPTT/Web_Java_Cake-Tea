async function loadBirthdayToday() {
    const container = document.getElementById('birthday-today-container');
    try {
        const res = await fetch('/api/admin/customers/birthdays-today');
        const users = await res.json();
        if (users.length === 0) {
            container.innerHTML = '<div class="alert alert-info mb-0"><i class="mdi mdi-information-outline mr-2"></i>Hôm nay không có khách hàng nào sinh nhật.</div>';
            return;
        }
        container.innerHTML = users.map(u => `
            <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                <span><i class="mdi mdi-cake-variant text-danger mr-2"></i><strong>${u.name || u.email}</strong> — ${u.email}</span>
                <button onclick="sendBirthdayEmail(${u.id})" class="btn btn-sm btn-success">Gửi email</button>
            </div>
        `).join('');
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
        <tr>
            <td>${u.id}</td>
            <td>${u.name || '-'}</td>
            <td>${u.email}</td>
            <td>${u.birthday || '-'}</td>
            <td><button onclick="sendBirthdayEmail(${u.id})" class="btn btn-sm btn-outline-success"><i class="mdi mdi-email-outline"></i> Gửi SN</button></td>
        </tr>
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
