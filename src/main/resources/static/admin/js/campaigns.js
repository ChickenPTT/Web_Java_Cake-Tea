function toLocalDateTimeInput(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toISOString().slice(0, 16);
}

function toIsoDateTime(localStr) {
    return localStr ? new Date(localStr).toISOString().slice(0, 19) : null;
}

async function loadCampaigns() {
    const res = await fetch('/api/admin/campaigns');
    const campaigns = await res.json();
    const container = document.getElementById('campaign-list-container');
    if (campaigns.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:20px;">Chưa có chiến dịch.</p>';
        return;
    }
    container.innerHTML = campaigns.map(c => {
        const discount = c.discountPercent ? `${c.discountPercent}%` : (c.discountAmount ? `${c.discountAmount}đ` : '-');
        const period = `${c.startDate ? new Date(c.startDate).toLocaleDateString('vi-VN') : ''} - ${c.endDate ? new Date(c.endDate).toLocaleDateString('vi-VN') : ''}`;
        return `
            <div class="list-table-format">
                <p>${c.name}</p>
                <p>${discount}</p>
                <p>${period}</p>
                <p>${c.active ? 'Hoạt động' : 'Tắt'}</p>
                <p>
                    <span onclick="editCampaign(${c.id})" style="cursor:pointer;color:blue;margin-right:10px;">Sửa</span>
                    <span onclick="deleteCampaign(${c.id})" style="cursor:pointer;color:red;">Xóa</span>
                </p>
            </div>
        `;
    }).join('');
}

async function editCampaign(id) {
    const res = await fetch(`/api/admin/campaigns/${id}`);
    const c = await res.json();
    document.getElementById('campaign-id').value = c.id;
    document.getElementById('campaign-name').value = c.name;
    document.getElementById('campaign-description').value = c.description || '';
    document.getElementById('campaign-discount-percent').value = c.discountPercent || '';
    document.getElementById('campaign-discount-amount').value = c.discountAmount || '';
    document.getElementById('campaign-target-category').value = c.targetCategory || '';
    document.getElementById('campaign-start').value = toLocalDateTimeInput(c.startDate);
    document.getElementById('campaign-end').value = toLocalDateTimeInput(c.endDate);
    document.getElementById('campaign-active').checked = c.active;
}

async function deleteCampaign(id) {
    if (!confirm('Xóa chiến dịch này?')) return;
    await fetch(`/api/admin/campaigns/${id}`, { method: 'DELETE' });
    showNotification('Đã xóa chiến dịch');
    loadCampaigns();
}

document.getElementById('campaign-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('campaign-id').value;
    const body = {
        name: document.getElementById('campaign-name').value,
        description: document.getElementById('campaign-description').value,
        discountPercent: parseFloat(document.getElementById('campaign-discount-percent').value) || null,
        discountAmount: parseFloat(document.getElementById('campaign-discount-amount').value) || null,
        targetCategory: document.getElementById('campaign-target-category').value || null,
        startDate: toIsoDateTime(document.getElementById('campaign-start').value),
        endDate: toIsoDateTime(document.getElementById('campaign-end').value),
        active: document.getElementById('campaign-active').checked
    };
    const url = id ? `/api/admin/campaigns/${id}` : '/api/admin/campaigns';
    const res = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (res.ok) {
        showNotification('Lưu chiến dịch thành công');
        this.reset();
        document.getElementById('campaign-id').value = '';
        document.getElementById('campaign-active').checked = true;
        loadCampaigns();
    } else {
        showNotification('Lưu thất bại', 'error');
    }
});

document.addEventListener('DOMContentLoaded', loadCampaigns);
window.editCampaign = editCampaign;
window.deleteCampaign = deleteCampaign;
