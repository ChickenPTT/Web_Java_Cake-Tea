function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
}

function setDefaultDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('stats-from').value = firstDay.toISOString().slice(0, 10);
    document.getElementById('stats-to').value = today.toISOString().slice(0, 10);
}

async function loadStatistics(from, to) {
    const res = await fetch(`/api/admin/statistics/revenue?from=${from}&to=${to}`);
    const data = await res.json();

    document.getElementById('stat-revenue').textContent = formatPrice(data.totalRevenue);
    document.getElementById('stat-orders').textContent = data.totalOrders;
    document.getElementById('stat-delivered').textContent = data.deliveredOrders;
    document.getElementById('stat-cancelled').textContent = data.cancelledOrders;

    const dailyContainer = document.getElementById('daily-stats-container');
    const daily = data.dailyRevenue || [];
    if (daily.length === 0) {
        dailyContainer.innerHTML = '<p style="text-align:center;padding:20px;">Không có dữ liệu trong khoảng thời gian này.</p>';
        return;
    }
    dailyContainer.innerHTML = daily.map(d => `
        <tr>
            <td>${d.date}</td>
            <td class="font-weight-bold">${formatPrice(d.revenue)}</td>
            <td>${d.orders}</td>
        </tr>
    `).join('');
}

document.getElementById('stats-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const from = document.getElementById('stats-from').value;
    const to = document.getElementById('stats-to').value;
    loadStatistics(from, to);
});

document.addEventListener('DOMContentLoaded', () => {
    setDefaultDates();
    const from = document.getElementById('stats-from').value;
    const to = document.getElementById('stats-to').value;
    loadStatistics(from, to);
});
