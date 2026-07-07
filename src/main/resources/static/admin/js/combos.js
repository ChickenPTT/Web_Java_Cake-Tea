let allProducts = [];
let comboItemIndex = 0;

async function loadProducts() {
    const res = await fetch('/api/admin/products');
    allProducts = await res.json();
}

function addComboItemRow(foodId = '', quantity = 1) {
    const list = document.getElementById('combo-items-list');
    const idx = comboItemIndex++;
    const options = allProducts.map(p => `<option value="${p.id}" ${p.id == foodId ? 'selected' : ''}>${p.name}</option>`).join('');
    const row = document.createElement('div');
    row.className = 'combo-item-row';
    row.id = `combo-item-${idx}`;
    row.style.cssText = 'display:flex;gap:10px;margin-bottom:8px;align-items:center;';
    row.innerHTML = `
        <select class="combo-food-select" required>${options}</select>
        <input type="number" class="combo-qty" value="${quantity}" min="1" style="width:80px;" required>
        <button type="button" onclick="this.parentElement.remove()" style="color:red;cursor:pointer;border:none;background:none;">Xóa</button>
    `;
    list.appendChild(row);
}

function getComboItemsFromForm() {
    const rows = document.querySelectorAll('.combo-item-row');
    return Array.from(rows).map(row => ({
        food: { id: parseInt(row.querySelector('.combo-food-select').value) },
        quantity: parseInt(row.querySelector('.combo-qty').value)
    }));
}

async function loadCombos() {
    const res = await fetch('/api/admin/combos');
    const combos = await res.json();
    const container = document.getElementById('combo-list-container');
    if (combos.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:20px;">Chưa có combo.</p>';
        return;
    }
    container.innerHTML = combos.map(c => `
        <div class="list-table-format">
            <p>${c.name}</p>
            <p>${new Intl.NumberFormat('vi-VN').format(c.comboPrice)} đ</p>
            <p>${c.items ? c.items.length : 0}</p>
            <p>${c.active ? 'Hoạt động' : 'Tắt'}</p>
            <p>
                <span onclick="editCombo(${c.id})" style="cursor:pointer;color:blue;margin-right:10px;">Sửa</span>
                <span onclick="deleteCombo(${c.id})" style="cursor:pointer;color:red;">Xóa</span>
            </p>
        </div>
    `).join('');
}

async function editCombo(id) {
    const res = await fetch(`/api/admin/combos/${id}`);
    const c = await res.json();
    document.getElementById('combo-id').value = c.id;
    document.getElementById('combo-name').value = c.name;
    document.getElementById('combo-description').value = c.description || '';
    document.getElementById('combo-price').value = c.comboPrice;
    document.getElementById('combo-active').checked = c.active;
    document.getElementById('combo-items-list').innerHTML = '';
    comboItemIndex = 0;
    if (c.items) {
        c.items.forEach(item => addComboItemRow(item.food.id, item.quantity));
    }
}

async function deleteCombo(id) {
    if (!confirm('Xóa combo này?')) return;
    await fetch(`/api/admin/combos/${id}`, { method: 'DELETE' });
    showNotification('Đã xóa combo');
    loadCombos();
}

document.getElementById('add-combo-item-btn').addEventListener('click', () => addComboItemRow());

document.getElementById('combo-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('combo-id').value;
    const body = {
        name: document.getElementById('combo-name').value,
        description: document.getElementById('combo-description').value,
        comboPrice: parseFloat(document.getElementById('combo-price').value),
        active: document.getElementById('combo-active').checked,
        items: getComboItemsFromForm()
    };
    const start = document.getElementById('combo-start').value;
    const end = document.getElementById('combo-end').value;
    if (start) body.startDate = new Date(start).toISOString().slice(0, 19);
    if (end) body.endDate = new Date(end).toISOString().slice(0, 19);

    const url = id ? `/api/admin/combos/${id}` : '/api/admin/combos';
    const res = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (res.ok) {
        showNotification('Lưu combo thành công');
        this.reset();
        document.getElementById('combo-id').value = '';
        document.getElementById('combo-items-list').innerHTML = '';
        document.getElementById('combo-active').checked = true;
        loadCombos();
    } else {
        showNotification('Lưu thất bại', 'error');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    addComboItemRow();
    loadCombos();
});
window.editCombo = editCombo;
window.deleteCombo = deleteCombo;
