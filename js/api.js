// Same-origin API through nginx; tokens stay in this tab's session storage.
function saveTokens(tokens) {
    sessionStorage.setItem('tokens', JSON.stringify(tokens));
}
function getTokens() {
    try { return JSON.parse(sessionStorage.getItem('tokens')) || {}; }
    catch { return {}; }
}
function logout() {
    sessionStorage.removeItem('tokens');
    location.href = 'login.html';
}
function currentRole() {
    try {
        const payload = getTokens().accessToken.split('.')[1];
        return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).role;
    } catch { return null; }
}
let refreshInFlight;
async function apiFetch(url, options = {}) {
    const send = () => {
        const headers = new Headers(options.headers);
        if (getTokens().accessToken) headers.set('Authorization', `Bearer ${getTokens().accessToken}`);
        return fetch(url, { ...options, headers });
    };
    let response = await send();
    if (response.status === 401 && getTokens().refreshToken) {
        if (!refreshInFlight) {
            refreshInFlight = (async () => {
                const result = await fetch('/api/auth/refresh', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken: getTokens().refreshToken })
                });
                if (!result.ok) throw new Error('Session expired');
                saveTokens(await result.json());
            })().finally(() => { refreshInFlight = null; });
        }
        try { await refreshInFlight; response = await send(); }
        catch (error) { logout(); throw error; }
    }
    if (response.status === 401) logout();
    return response;
}
if (!location.pathname.endsWith('/login.html')) {
    if (!getTokens().accessToken) location.replace('login.html');
    document.addEventListener('DOMContentLoaded', () => {
        const button = document.createElement('button');
        button.textContent = 'Выйти';
        button.onclick = logout;
        document.body.prepend(button);
        if (currentRole() !== 'ADMIN') {
            document.querySelectorAll('a[href="form.html"]').forEach(link => link.hidden = true);
            if (location.pathname.endsWith('/form.html')) location.replace('index.html');
        }
    });
}
