let registering = false;
const authForm = document.getElementById('authForm');
document.getElementById('toggleAuth').onclick = () => {
    registering = !registering;
    document.getElementById('emailField').hidden = !registering;
    authForm.elements.email.required = registering;
    authForm.elements.password.minLength = registering ? 8 : 1;
    document.getElementById('submitAuth').textContent = registering ? 'Зарегистрироваться' : 'Войти';
    document.getElementById('toggleAuth').textContent = registering ? 'Уже есть аккаунт' : 'Регистрация';
};
authForm.onsubmit = async event => {
    event.preventDefault();
    const error = document.getElementById('authError');
    error.textContent = '';
    const credentials = { username: authForm.elements.username.value.trim(), password: authForm.elements.password.value };
    try {
        if (registering) {
            const response = await fetch('/api/auth/register', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...credentials, email: authForm.elements.email.value.trim() })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Ошибка регистрации');
        }
        const response = await fetch('/api/auth/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Ошибка входа');
        saveTokens(data);
        location.href = 'index.html';
    } catch (exception) { error.textContent = exception.message; }
};
