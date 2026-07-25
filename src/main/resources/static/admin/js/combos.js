let allProducts = [];
let comboItemIndex = 0;

const SUGGEST_PERCENTS = [5, 10, 15, 20];

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(Number(price) || 0)) + ' đ';
}

function roundToThousand(value) {
    return Math.max(0, Math.round(Number(value) / 1000) * 1000);
}

function findProduct(id) {
    return allProducts.find(p => String(p.id) === String(id));
}

async function loadProducts() {
    const res = await fetch('/api/admin/products');
    allProducts = await res.json();
}

function productOptionsHtml(selectedId = '') {
    const placeholder = `<option value="">-- Chọn sản phẩm --</option>`;
    const options = allProducts.map(p => {
        const selected = String(p.id) === String(selectedId) ? 'selected' : '';
        return `<option value="${p.id}" ${selected}>${p.name} (${formatPrice(p.price)})</option>`;
    }).join('');
    return placeholder + options;
}

function addComboItemRow(foodId = '', quantity = 1) {
    const list = document.getElementById('combo-items-list');
    const idx = comboItemIndex++;
    const row = document.createElement('div');
    row.className = 'combo-item-row';
    row.id = `combo-item-${idx}`;
    row.innerHTML = `
        <select class="form-control form-control-sm combo-food-select" required>
            ${productOptionsHtml(foodId)}
        </select>
        <input type="number" class="form-control form-control-sm combo-qty" value="${quantity}" min="1" required>
        <div class="combo-item-unit combo-line-total">0 đ</div>
        <button type="button" class="btn btn-sm btn-outline-danger" title="Xóa dòng" onclick="removeComboItemRow(this)">
            <i class="far fa-trash-can"></i>
        </button>
    `;
    list.appendChild(row);
    row.querySelector('.combo-food-select').addEventListener('change', updateComboPricingUi);
    row.querySelector('.combo-qty').addEventListener('input', updateComboPricingUi);
    updateComboPricingUi();
}

function removeComboItemRow(btn) {
    const list = document.getElementById('combo-items-list');
    btn.closest('.combo-item-row').remove();
    if (!list.querySelector('.combo-item-row')) {
        addComboItemRow();
    } else {
        updateComboPricingUi();
    }
}

function getComboItemsFromForm() {
    const rows = document.querySelectorAll('.combo-item-row');
    return Array.from(rows)
        .map(row => {
            const foodId = parseInt(row.querySelector('.combo-food-select').value, 10);
            const quantity = parseInt(row.querySelector('.combo-qty').value, 10);
            if (!foodId || !quantity) return null;
            return { food: { id: foodId }, quantity };
        })
        .filter(Boolean);
}

function calcRetailTotal() {
    let total = 0;
    document.querySelectorAll('.combo-item-row').forEach(row => {
        const foodId = row.querySelector('.combo-food-select').value;
        const qty = Math.max(1, parseInt(row.querySelector('.combo-qty').value, 10) || 1);
        const product = findProduct(foodId);
        const line = product ? (Number(product.price) || 0) * qty : 0;
        const lineEl = row.querySelector('.combo-line-total');
        if (lineEl) lineEl.textContent = formatPrice(line);
        total += line;
    });
    return total;
}

function updateComboPricingUi() {
    const retail = calcRetailTotal();
    const entered = Number(document.getElementById('combo-price').value) || 0;
    const save = Math.max(0, retail - entered);
    const savePct = retail > 0 ? Math.round((save / retail) * 100) : 0;

    const retailEl = document.getElementById('combo-retail-total');
    const enteredEl = document.getElementById('combo-entered-price');
    const saveEl = document.getElementById('combo-save-amount');
    const saveRow = document.getElementById('combo-save-row');
    const hint = document.getElementById('combo-price-hint');
    const btns = document.getElementById('combo-suggest-btns');

    if (retailEl) retailEl.textContent = formatPrice(retail);
    if (enteredEl) enteredEl.textContent = formatPrice(entered);

    if (saveRow && saveEl) {
        saveRow.classList.remove('save', 'warn');
        if (retail <= 0) {
            saveRow.classList.add('warn');
            saveEl.textContent = 'Chưa chọn SP';
        } else if (entered <= 0) {
            saveRow.classList.add('warn');
            saveEl.textContent = 'Nhập giá combo';
        } else if (entered >= retail) {
            saveRow.classList.add('warn');
            saveEl.textContent = '0 đ (giá combo ≥ giá lẻ)';
        } else {
            saveRow.classList.add('save');
            saveEl.textContent = `${formatPrice(save)} (−${savePct}%)`;
        }
    }

    if (hint) {
        if (retail <= 0) {
            hint.textContent = 'Chọn sản phẩm bên dưới để xem gợi ý giá.';
            hint.className = 'text-muted';
        } else if (entered > 0 && entered >= retail) {
            hint.textContent = 'Giá combo đang không thấp hơn tổng giá lẻ — khách sẽ không được giảm.';
            hint.className = 'text-danger';
        } else if (entered > 0) {
            hint.textContent = `Khách sẽ tiết kiệm ${formatPrice(save)} so với mua lẻ.`;
            hint.className = 'text-success';
        } else {
            hint.textContent = `Tổng giá lẻ ${formatPrice(retail)}. Chọn gợi ý hoặc nhập giá thấp hơn.`;
            hint.className = 'text-muted';
        }
    }

    if (btns) {
        if (retail <= 0) {
            btns.innerHTML = '<button type="button" class="btn btn-outline-secondary btn-sm" disabled>Chọn sản phẩm trước</button>';
        } else {
            btns.innerHTML = SUGGEST_PERCENTS.map(pct => {
                const price = roundToThousand(retail * (1 - pct / 100));
                return `<button type="button" class="btn btn-outline-danger btn-sm"
                    onclick="applySuggestedComboPrice(${price})"
                    title="Giảm ${pct}% so với giá lẻ">
                    −${pct}% → ${formatPrice(price)}
                </button>`;
            }).join('') + `
                <button type="button" class="btn btn-outline-dark btn-sm"
                    onclick="applySuggestedComboPrice(${roundToThousand(retail - 1000)})"
                    title="Rẻ hơn giá lẻ 1.000đ">
                    Gần giá lẻ
                </button>`;
        }
    }
}

function applySuggestedComboPrice(price) {
    const input = document.getElementById('combo-price');
    if (!input) return;
    input.value = Math.max(0, Number(price) || 0);
    updateComboPricingUi();
}

function estimateRetailFromCombo(c) {
    if (!c.items || !c.items.length) return 0;
    return c.items.reduce((sum, item) => {
        const price = item.food && item.food.price != null
            ? Number(item.food.price)
            : (findProduct(item.food && item.food.id)?.price || 0);
        const qty = Math.max(1, Number(item.quantity) || 1);
        return sum + price * qty;
    }, 0);
}

async function loadCombos() {
    const res = await fetch('/api/admin/combos');
    const combos = await res.json();
    const container = document.getElementById('combo-list-container');
    if (!Array.isArray(combos) || combos.length === 0) {
        container.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Chưa có combo.</td></tr>';
        return;
    }
    container.innerHTML = combos.map(c => {
        const retail = estimateRetailFromCombo(c);
        const save = Math.max(0, retail - Number(c.comboPrice || 0));
        const savePct = retail > 0 ? Math.round((save / retail) * 100) : 0;
        const saveHtml = retail <= 0
            ? '<span class="text-muted">—</span>'
            : (save > 0
                ? `<span class="text-success font-weight-medium">${formatPrice(save)} (−${savePct}%)</span>`
                : '<span class="text-danger">Không giảm</span>');
        return `
        <tr>
            <td class="font-weight-medium">${c.name}</td>
            <td>${formatPrice(c.comboPrice)}</td>
            <td>${retail > 0 ? formatPrice(retail) : '—'}</td>
            <td>${saveHtml}</td>
            <td>${c.items ? c.items.length : 0}</td>
            <td><span class="badge badge-${c.active ? 'success' : 'secondary'}">${c.active ? 'Hoạt động' : 'Tắt'}</span></td>
            <td>
                <button class="btn btn-sm btn-info mr-1" onclick="editCombo(${c.id})"><i class="fas fa-pen-to-square"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteCombo(${c.id})"><i class="far fa-trash-can"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function toDatetimeLocalValue(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function editCombo(id) {
    const res = await fetch(`/api/admin/combos/${id}`);
    const c = await res.json();
    document.getElementById('combo-id').value = c.id;
    document.getElementById('combo-name').value = c.name;
    document.getElementById('combo-description').value = c.description || '';
    document.getElementById('combo-price').value = c.comboPrice;
    document.getElementById('combo-active').checked = c.active;
    document.getElementById('combo-start').value = toDatetimeLocalValue(c.startDate);
    document.getElementById('combo-end').value = toDatetimeLocalValue(c.endDate);
    document.getElementById('combo-items-list').innerHTML = '';
    comboItemIndex = 0;
    if (c.items && c.items.length) {
        c.items.forEach(item => addComboItemRow(item.food && item.food.id, item.quantity || 1));
    } else {
        addComboItemRow();
    }
    updateComboPricingUi();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteCombo(id) {
    if (!confirm('Xóa combo này?')) return;
    await fetch(`/api/admin/combos/${id}`, { method: 'DELETE' });
    showNotification('Đã xóa combo');
    loadCombos();
}

function resetComboForm() {
    document.getElementById('combo-form').reset();
    document.getElementById('combo-id').value = '';
    document.getElementById('combo-items-list').innerHTML = '';
    document.getElementById('combo-active').checked = true;
    comboItemIndex = 0;
    addComboItemRow();
    updateComboPricingUi();
}

document.getElementById('add-combo-item-btn').addEventListener('click', () => addComboItemRow());
document.getElementById('combo-price').addEventListener('input', updateComboPricingUi);
document.getElementById('combo-reset-btn').addEventListener('click', resetComboForm);

document.getElementById('combo-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const items = getComboItemsFromForm();
    if (!items.length) {
        showNotification('Hãy chọn ít nhất 1 sản phẩm trong combo', 'error');
        return;
    }

    const retail = calcRetailTotal();
    const comboPrice = parseFloat(document.getElementById('combo-price').value);
    if (!(comboPrice >= 0)) {
        showNotification('Giá combo không hợp lệ', 'error');
        return;
    }
    if (retail > 0 && comboPrice >= retail) {
        const ok = confirm(
            `Giá combo (${formatPrice(comboPrice)}) không thấp hơn tổng giá lẻ (${formatPrice(retail)}).\n` +
            `Khách sẽ không được giảm khi thêm combo. Bạn vẫn muốn lưu?`
        );
        if (!ok) return;
    }

    const id = document.getElementById('combo-id').value;
    const body = {
        name: document.getElementById('combo-name').value,
        description: document.getElementById('combo-description').value,
        comboPrice,
        active: document.getElementById('combo-active').checked,
        items
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
        resetComboForm();
        loadCombos();
    } else {
        showNotification('Lưu thất bại', 'error');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    addComboItemRow();
    updateComboPricingUi();
    loadCombos();
});

window.editCombo = editCombo;
window.deleteCombo = deleteCombo;
window.removeComboItemRow = removeComboItemRow;
window.applySuggestedComboPrice = applySuggestedComboPrice;
