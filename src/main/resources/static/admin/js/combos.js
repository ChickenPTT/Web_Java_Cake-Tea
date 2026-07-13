let allProducts = [];
let comboItemIndex = 0;

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
}

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
        <select class="form-control form-control-sm combo-food-select d-inline-block" style="width:55%;" required>${options}</select>
        <input type="number" class="form-control form-control-sm combo-qty d-inline-block" style="width:20%;" value="${quantity}" min="1" required>
        <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.parentElement.remove()"><i class="far fa-trash-can"></i></button>
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
        <tr>
            <td class="font-weight-medium">${c.name}</td>
            <td>${formatPrice(c.comboPrice)}</td>
            <td>${c.items ? c.items.length : 0}</td>
            <td><span class="badge badge-${c.active ? 'success' : 'secondary'}">${c.active ? 'Hoạt động' : 'Tắt'}</span></td>
            <td>
                <button class="btn btn-sm btn-info mr-1" onclick="editCombo(${c.id})"><i class="fas fa-pen-to-square"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteCombo(${c.id})"><i class="far fa-trash-can"></i></button>
            </td>
        </tr>
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
