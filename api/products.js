const { loadInventory, persistInventory } = require('../lib/inventory');
const { parseJsonBody, sendJson, getBearerToken } = require('../lib/utils');
const { verifyToken } = require('../lib/auth');

const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.WEB_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
};

const requireAuth = (req, res) => {
    const token = getBearerToken(req);
    const payload = verifyToken(token);
    if (!payload) {
        sendJson(res, { error: 'Unauthorized' }, 401);
        return null;
    }
    return payload;
};

module.exports = async (req, res) => {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    }

    if (req.method === 'GET') {
        const inventory = await loadInventory();
        return sendJson(res, { inventory });
    }

    if (req.method === 'PUT') {
        const user = requireAuth(req, res);
        if (!user) return;

        const body = await parseJsonBody(req);
        if (!body || !Array.isArray(body.inventory)) {
            return sendJson(res, { error: 'Invalid payload' }, 400);
        }

        try {
            const saved = await persistInventory(body.inventory);
            return sendJson(res, { success: true, saved });
        } catch (error) {
            return sendJson(res, { error: error.message || 'Unable to save inventory' }, 500);
        }
    }

    return sendJson(res, { error: 'Method not allowed' }, 405);
};
