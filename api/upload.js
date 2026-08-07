const { uploadAsset } = require('../lib/subspace');
const { parseJsonBody, sendJson, getBearerToken } = require('../lib/utils');
const { verifyToken } = require('../lib/auth');

const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.WEB_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

    if (req.method !== 'POST') {
        return sendJson(res, { error: 'Method not allowed' }, 405);
    }

    const user = requireAuth(req, res);
    if (!user) return;

    const body = await parseJsonBody(req);
    if (!body || typeof body !== 'object') {
        return sendJson(res, { error: 'Invalid payload' }, 400);
    }

    try {
        const result = await uploadAsset(body);
        return sendJson(res, { success: true, result });
    } catch (error) {
        return sendJson(res, { error: error.message || 'Upload failed' }, 500);
    }
};
