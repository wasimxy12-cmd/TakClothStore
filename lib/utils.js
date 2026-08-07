const parseJsonBody = async (req) => {
    if (req.body && typeof req.body === 'object') {
        return req.body;
    }

    const contentType = req.headers['content-type'] || req.headers['Content-Type'] || '';
    if (!contentType.includes('application/json')) {
        return {};
    }

    const chunks = [];
    for await (const chunk of req) {
        chunks.push(chunk);
    }

    const raw = Buffer.concat(chunks).toString('utf8').trim();
    if (!raw) {
        return {};
    }

    try {
        return JSON.parse(raw);
    } catch (error) {
        return {};
    }
};

const getBearerToken = (req) => {
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    return match ? match[1] : null;
};

const sendJson = (res, payload, status = 200) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
};

module.exports = {
    parseJsonBody,
    getBearerToken,
    sendJson
};
