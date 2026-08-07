const adminMessage = document.getElementById('adminMessage');
const inventoryTable = document.getElementById('inventoryTable');
const saveButton = document.getElementById('saveInventory');
const addButton = document.getElementById('addProduct');
const logoutButton = document.getElementById('logoutButton');

function getAuthToken() {
    return localStorage.getItem('takcloth_admin_token');
}

function clearSession() {
    localStorage.removeItem('takcloth_admin_token');
}

function redirectToLogin() {
    window.location.href = '/login.html';
}

function createField(name, value = '') {
    return `<input type="text" name="${name}" value="${value || ''}" placeholder="${name.replace(/_/g, ' ')}">`;
}

function renderInventory(inventory) {
    const rows = inventory.map((item, index) => {
        const images = Array.isArray(item.images) ? item.images.join(', ') : item.images || '';
        return `
            <tr data-index="${index}">
                <td>${createField('title', item.title)}</td>
                <td>${createField('price', item.price)}</td>
                <td>${createField('category', item.category)}</td>
                <td>${createField('brand', item.brand)}</td>
                <td>${createField('fabric_type', item.fabric_type)}</td>
                <td>${createField('print_type', item.print_type)}</td>
                <td>${createField('badge', item.badge)}</td>
                <td>${createField('images', images)}</td>
                <td><button type="button" class="removeBtn">Remove</button></td>
            </tr>`;
    }).join('');

    inventoryTable.querySelector('tbody').innerHTML = rows;
    inventoryTable.querySelectorAll('.removeBtn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const row = event.target.closest('tr');
            row.remove();
        });
    });
}

function collectInventory() {
    const rows = Array.from(inventoryTable.querySelectorAll('tbody tr'));
    return rows.map(row => {
        const title = row.querySelector('input[name="title"]').value.trim();
        const price = Number(row.querySelector('input[name="price"]').value.trim() || 0);
        const category = row.querySelector('input[name="category"]').value.trim();
        const brand = row.querySelector('input[name="brand"]').value.trim();
        const fabric_type = row.querySelector('input[name="fabric_type"]').value.trim();
        const print_type = row.querySelector('input[name="print_type"]').value.trim();
        const badge = row.querySelector('input[name="badge"]').value.trim();
        const images = row.querySelector('input[name="images"]').value
            .split(',')
            .map(img => img.trim())
            .filter(Boolean);

        return {
            title,
            price,
            category,
            brand,
            fabric_type,
            print_type,
            badge,
            images
        };
    }).filter(item => item.title);
}

async function apiFetch(path, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(path, {
        ...options,
        headers
    });

    if (response.status === 401) {
        clearSession();
        redirectToLogin();
        return null;
    }

    return response;
}

async function loadInventory() {
    adminMessage.textContent = 'Loading inventory...';
    const response = await apiFetch('/api/products');
    if (!response) return;

    if (!response.ok) {
        adminMessage.textContent = 'Unable to load inventory.';
        return;
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.inventory)) {
        adminMessage.textContent = 'Unexpected inventory response.';
        return;
    }

    renderInventory(data.inventory);
    adminMessage.textContent = 'Inventory loaded. Edit fields and save.';
}

async function saveInventory() {
    const inventory = collectInventory();
    adminMessage.textContent = 'Saving inventory...';

    const response = await apiFetch('/api/products', {
        method: 'PUT',
        body: JSON.stringify({ inventory })
    });
    if (!response) return;

    const data = await response.json();
    if (!response.ok) {
        adminMessage.textContent = data?.error || 'Unable to save inventory.';
        return;
    }

    adminMessage.textContent = 'Inventory saved successfully.';
}

async function verifySession() {
    const response = await apiFetch('/api/auth');
    if (!response) return false;

    if (!response.ok) {
        clearSession();
        redirectToLogin();
        return false;
    }

    return true;
}

function addProductRow() {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" name="title" placeholder="title"></td>
        <td><input type="text" name="price" placeholder="price"></td>
        <td><input type="text" name="category" placeholder="category"></td>
        <td><input type="text" name="brand" placeholder="brand"></td>
        <td><input type="text" name="fabric_type" placeholder="fabric_type"></td>
        <td><input type="text" name="print_type" placeholder="print_type"></td>
        <td><input type="text" name="badge" placeholder="badge"></td>
        <td><input type="text" name="images" placeholder="images, comma separated"></td>
        <td><button type="button" class="removeBtn">Remove</button></td>
    `;
    inventoryTable.querySelector('tbody').appendChild(newRow);
    newRow.querySelector('.removeBtn').addEventListener('click', () => newRow.remove());
}

function setupButtons() {
    if (saveButton) {
        saveButton.addEventListener('click', saveInventory);
    }
    if (addButton) {
        addButton.addEventListener('click', addProductRow);
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            clearSession();
            redirectToLogin();
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    setupButtons();
    const authorized = await verifySession();
    if (authorized) {
        await loadInventory();
    }
});