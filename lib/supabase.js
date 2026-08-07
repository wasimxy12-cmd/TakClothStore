const SUPABASE_API_URL = process.env.SUPABASE_API_URL || '';
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const INVENTORY_PATH = process.env.SUPABASE_INVENTORY_PATH || '/inventory';
const UPLOAD_PATH = process.env.SUPABASE_UPLOAD_PATH || '/upload';

function createHeaders(extra = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...extra
    };

    if (SUPABASE_API_KEY) {
        headers.Authorization = `Bearer ${SUPABASE_API_KEY}`;
    }

    return headers;
}

async function callSupabase(path, options = {}) {
    if (!SUPABASE_API_URL) {
        throw new Error('SUPABASE_API_URL is not configured.');
    }

    const url = new URL(path, SUPABASE_API_URL);
    const response = await fetch(url.toString(), options);
    const text = await response.text();
    if (!response.ok) {
        const error = new Error(`Supabase request failed: ${response.status} ${response.statusText}`);
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
    return callSupabase(INVENTORY_PATH, {
        method: 'GET',
        headers: createHeaders()
    });
}

async function saveInventory(inventory) {
    return callSupabase(INVENTORY_PATH, {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify({ inventory })
    });
}

async function uploadAsset(payload) {
    return callSupabase(UPLOAD_PATH, {
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
