require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const WEB_ORIGIN = process.env.WEB_ORIGIN || `http://localhost:${PORT}`;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'inventory.db');
const sessions = new Map();

if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error('Missing ADMIN_USERNAME or ADMIN_PASSWORD in environment.');
    process.exit(1);
}

// Ensure data and uploads directories exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
const uploadDir = path.join(DATA_DIR, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine for device uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware
app.use(helmet());
const allowedOrigins = [WEB_ORIGIN, 'http://localhost:3000'].filter(Boolean);
app.use(cors({ origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
    } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
    }
}, credentials: true }));
app.use(express.json());

function parseCookies(req) {
    const cookieHeader = req.headers.cookie || '';
    const cookies = {};

    cookieHeader.split(';').forEach((cookie) => {
        const [key, ...valueParts] = cookie.trim().split('=');
        if (!key) return;
        cookies[key] = decodeURIComponent(valueParts.join('='));
    });

    return cookies;
}

function getAuthToken(req) {
    const cookies = parseCookies(req);
    return cookies.admin_session || null;
}

function getSession(req) {
    const token = getAuthToken(req);
    if (!token) return null;

    const session = sessions.get(token);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
        sessions.delete(token);
        return null;
    }

    return session;
}

function requireAdmin(req, res, next) {
    const session = getSession(req);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    req.adminUser = session.username;
    next();
}

// Serve static HTML/JS/CSS files & Uploaded Images
app.get('/admin', (req, res) => {
    res.redirect('/admin.html');
});

app.get('/admin.html', (req, res) => {
    if (!getSession(req)) {
        return res.redirect('/login.html');
    }
    return res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/login.html', (req, res) => {
    if (getSession(req)) {
        return res.redirect('/admin.html');
    }
    return res.sendFile(path.join(__dirname, 'login.html'));
});

app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadDir));

// Database Initialization
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('Error opening database:', err.message);
    else console.log('Connected to SQLite database.');
});

// Create Table Schema
db.run(`
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        brand TEXT,
        fabric_type TEXT,
        print_type TEXT,
        badge TEXT,
        images TEXT NOT NULL
    )
`);

// Auth endpoints
app.get('/api/auth/check', (req, res) => {
    const session = getSession(req);
    res.json({ authenticated: !!session, username: session ? session.username : null });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = crypto.randomBytes(24).toString('hex');
        sessions.set(token, {
            username,
            expiresAt: Date.now() + 1000 * 60 * 60 * 8
        });

        res.cookie('admin_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 8,
            path: '/',
        });

        return res.json({ success: true, message: 'Login successful' });
    }

    return res.status(401).json({ error: 'Invalid username or password' });
});

app.post('/api/auth/logout', (req, res) => {
    const token = getAuthToken(req);
    if (token) {
        sessions.delete(token);
    }

    res.cookie('admin_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0),
        path: '/',
    });

    res.json({ success: true, message: 'Logged out' });
});

// API: Handle Image Uploads directly from Device
app.post('/api/upload', requireAdmin, upload.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No image files uploaded' });
        }
        const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        res.json({ imageUrls });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Get Products (with optional category filter)
app.get('/api/products', (req, res) => {
    const categoryFilter = req.query.category;
    let sql = 'SELECT * FROM products ORDER BY id DESC';
    let params = [];

    if (categoryFilter && categoryFilter !== 'All') {
        sql = 'SELECT * FROM products WHERE category = ? ORDER BY id DESC';
        params = [categoryFilter];
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const products = rows.map(row => ({
            ...row,
            images: row.images ? row.images.split(',') : []
        }));
        res.json(products);
    });
});

// API: Add Product to Database
app.post('/api/products', requireAdmin, (req, res) => {
    const { title, price, category, brand, fabric_type, print_type, badge, images } = req.body;

    if (!title || !price || !category || !images || images.length === 0) {
        return res.status(400).json({ error: 'Title, Price, Category, and at least 1 image are required.' });
    }

    const imageString = Array.isArray(images) ? images.join(',') : images;

    const sql = `
        INSERT INTO products (title, price, category, brand, fabric_type, print_type, badge, images)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [title, price, category, brand || '', fabric_type || '', print_type || '', badge || '', imageString], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product added successfully!', id: this.lastID });
    });
});

// API: Delete Product
app.delete('/api/products/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM products WHERE id = ?', id, function (err) {
        if (err) return res.status(500).json({ error: error.message });
        res.json({ message: 'Product deleted successfully.' });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
