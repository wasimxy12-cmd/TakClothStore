const crypto = require('crypto');

const SECRET = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || 'takcloth-secret';
const TOKEN_EXPIRY_MS = Number(process.env.AUTH_TOKEN_EXPIRY_MS) || 3600 * 1000;

function createToken(username) {
    const payload = JSON.stringify({
        username,
        exp: Date.now() + TOKEN_EXPIRY_MS
    });
    const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    return Buffer.from(`${payload}.${signature}`).toString('base64url');
}

function verifyToken(token) {
    if (!token) {
        return null;
    }

    try {
        const decoded = Buffer.from(token, 'base64url').toString('utf8');
        const separatorIndex = decoded.lastIndexOf('.');
        if (separatorIndex < 0) {
            return null;
        }

        const payloadText = decoded.slice(0, separatorIndex);
        const signature = decoded.slice(separatorIndex + 1);
        const expectedSignature = crypto.createHmac('sha256', SECRET).update(payloadText).digest('hex');

        const signatureBuffer = Buffer.from(signature, 'utf8');
        const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
        if (
            signatureBuffer.length !== expectedBuffer.length ||
            !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
        ) {
            return null;
        }

        const payload = JSON.parse(payloadText);
        if (typeof payload.exp !== 'number' || Date.now() > payload.exp) {
            return null;
        }

        return payload;
    } catch (error) {
        return null;
    }
}

function checkCredentials(username, password) {
    return (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
    );
}

module.exports = {
    createToken,
    verifyToken,
    checkCredentials
};
