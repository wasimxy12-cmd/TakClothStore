const { createToken, checkCredentials, verifyToken } = require('../lib/auth');
const { parseJsonBody, sendJson, getBearerToken } = require('../lib/utils');

const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.WEB_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
};

module.exports = async (req, res) => {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    }

    if (req.method === 'POST') {
        const body = await parseJsonBody(req);
        const { username, password } = body;

        if (!checkCredentials(username, password)) {
            return sendJson(res, { error: 'Invalid credentials' }, 401);
        }

        const token = createToken(username);
        return sendJson(res, {
            token,
            expiresIn: Number(process.env.AUTH_TOKEN_EXPIRY_MS) || 3600 * 1000
        });
    }

    if (req.method === 'GET') {
        const token = getBearerToken(req);
        const payload = verifyToken(token);
        if (!payload) {
            return sendJson(res, { valid: false }, 401);
        }
        return sendJson(res, { valid: true, user: payload.username });
    }

    return sendJson(res, { error: 'Method not allowed' }, 405);
};
