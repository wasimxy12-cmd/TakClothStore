const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

function setAuthToken(token) {
    localStorage.setItem('takcloth_admin_token', token);
}

function getAuthToken() {
    return localStorage.getItem('takcloth_admin_token');
}

function redirectToAdmin() {
    window.location.href = '/admin.html';
}

async function checkExistingSession() {
    const token = getAuthToken();
    if (!token) return;

    try {
        const response = await fetch('/api/auth', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            redirectToAdmin();
        }
    } catch (error) {
        console.warn('Session check failed:', error);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    loginMessage.textContent = 'Signing in...';

    const formData = new FormData(loginForm);
    const username = formData.get('username')?.trim();
    const password = formData.get('password')?.trim();

    if (!username || !password) {
        loginMessage.textContent = 'Enter username and password.';
        return;
    }

    try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (!response.ok) {
            loginMessage.textContent = data?.error || 'Login failed.';
            return;
        }

        setAuthToken(data.token);
        redirectToAdmin();
    } catch (error) {
        loginMessage.textContent = 'Unable to reach server. Try again later.';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    checkExistingSession();
});