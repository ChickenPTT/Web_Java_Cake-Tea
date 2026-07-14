function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price || 0) + ' đ';
}

function formatShortDate(isoDate) {
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

const STATUS_COLORS = {
    Pending: '#f0ad4e',
    Processing: '#5bc0de',
    Preparing: '#17a2b8',
    Delivered: '#5cb85c',
    Cancelled: '#d9534f',
    Completed: '#28a745'
};

function colorForStatus(label, index) {
    if (STATUS_COLORS[label]) return STATUS_COLORS[label];
    const fallback = ['#a50b18', '#e85d6f', '#c70e1c', '#8b0000', '#ffa07a', '#cd5c5c'];
    return fallback[index % fallback.length];
}

let revenueChart;
let statusChart;
let ordersChart;

function renderDashboardCharts(data) {
    const badge = document.getElementById('week-revenue-badge');
    if (badge) badge.textContent = formatPrice(data.weekRevenue);

    const revenueLabels = (data.revenueLabels || []).map(formatShortDate);
    const orderLabels = (data.orderLabels || []).map(formatShortDate);
    const statusLabels = data.statusLabels || [];
    const statusValues = data.statusValues || [];

    const revenueCtx = document.getElementById('revenue-chart');
    if (revenueCtx) {
        if (revenueChart) revenueChart.destroy();
        revenueChart = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: revenueLabels,
                datasets: [{
                    label: 'Doanh thu (đ)',
                    data: data.revenueValues || [],
                    borderColor: '#a50b18',
                    backgroundColor: 'rgba(165, 11, 24, 0.15)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 4,
                    pointBackgroundColor: '#a50b18'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => formatPrice(ctx.parsed.y)
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (v) => new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(v)
                        }
                    }
                }
            }
        });
    }

    const statusCtx = document.getElementById('status-chart');
    const emptyEl = document.getElementById('status-chart-empty');
    if (statusCtx) {
        if (statusChart) statusChart.destroy();
        const hasData = statusLabels.length > 0 && statusValues.some(v => v > 0);
        if (!hasData) {
            statusCtx.classList.add('d-none');
            if (emptyEl) emptyEl.classList.remove('d-none');
        } else {
            statusCtx.classList.remove('d-none');
            if (emptyEl) emptyEl.classList.add('d-none');
            statusChart = new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: statusLabels,
                    datasets: [{
                        data: statusValues,
                        backgroundColor: statusLabels.map((l, i) => colorForStatus(l, i)),
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }
    }

    const ordersCtx = document.getElementById('orders-chart');
    if (ordersCtx) {
        if (ordersChart) ordersChart.destroy();
        ordersChart = new Chart(ordersCtx, {
            type: 'bar',
            data: {
                labels: orderLabels,
                datasets: [{
                    label: 'Số đơn',
                    data: data.orderValues || [],
                    backgroundColor: 'rgba(199, 14, 28, 0.75)',
                    borderRadius: 6,
                    maxBarThickness: 42
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    const path = window.location.pathname;
    if (path !== '/admin' && path !== '/admin/' && path !== '/admin/index') return;

    try {
        const res = await fetch('/api/admin/dashboard/stats', { credentials: 'same-origin' });
        if (!res.ok) return;
        const data = await res.json();
        renderDashboardCharts(data);
    } catch (e) {
        console.error('Dashboard charts error:', e);
    }
});
