const SUBSPACE_API_URL = process.env.SUBSPACE_API_URL || '';
const SUBSPACE_API_KEY = process.env.SUBSPACE_API_KEY;
const INVENTORY_PATH = process.env.SUBSPACE_INVENTORY_PATH || '/inventory';
const UPLOAD_PATH = process.env.SUBSPACE_UPLOAD_PATH || '/upload';

function createHeaders(extra = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...extra
    };

    if (SUBSPACE_API_KEY) {
        headers.Authorization = `Bearer ${SUBSPACE_API_KEY}`;
    }

    return headers;
}

async function callSubspace(path, options = {}) {
    if (!SUBSPACE_API_URL) {
        throw new Error('SUBSPACE_API_URL is not configured.');
    }

    const url = new URL(path, SUBSPACE_API_URL);
    const response = await fetch(url.toString(), options);
    const text = await response.text();
    if (!response.ok) {
        const error = new Error(`Subspace request failed: ${response.status} ${response.statusText}`);
        error.status = response.status;
        error.body = text;
        throw error;
    }

    try {
        return JSON.parse(text || '{}');
    } catch (error) {
        return text;
    }
}

async function fetchInventory() {
    return callSubspace(INVENTORY_PATH, {
        method: 'GET',
        headers: createHeaders()
    });
}

async function saveInventory(inventory) {
    return callSubspace(INVENTORY_PATH, {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify({ inventory })
    });
}

async function uploadAsset(payload) {
    return callSubspace(UPLOAD_PATH, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(payload)
    });
}

module.exports = {
    fetchInventory,
    saveInventory,
    uploadAsset
};
