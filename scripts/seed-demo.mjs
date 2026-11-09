import { readFileSync } from 'node:fs';
const config = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8')
  .split(/\r?\n/).filter(line => line && !line.startsWith('#')).map(line => {
    const at = line.indexOf('='); return [line.slice(0, at), line.slice(at + 1)];
  }));
const base = `http://127.0.0.1:${config.BACKEND_PORT || 8000}`;
const response = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: config.BOOTSTRAP_ADMIN_USERNAME, password: config.BOOTSTRAP_ADMIN_PASSWORD }) });
if (!response.ok) throw new Error('Не удалось войти. Проверьте BOOTSTRAP_ADMIN_* и готовность backend.');
const { accessToken } = await response.json();
const students = [
  ['Jotaro Kujo', 'P3221', 910001, 'Белорусская 6', 907, true],
  ['Joseph Joestar', 'P3221', 910002, 'Белорусская 6', 908, true],
  ['Jonathan Joestar', 'P3421', 910003, 'Вяземский 5-7', 666, true],
  ['Анна Петрова', 'P3321', 910004, 'Альпийская 16', 777, false],
  ['Иван Иванов', 'P3320', 910005, 'Белорусская 6', 205, false],
  ['Мария Смирнова', 'P3320', 910006, 'Вяземский 5-7', 311, false],
];
for (const [fullName, group, isuId, dormitory, room, foreigner] of students) {
  const result = await fetch(`${base}/api/requests`, { method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ fullName, group, isuId, dormitory, room, foreigner, moveInDate: '2026-09-01', notes: 'Учебная запись' }) });
  if (result.status === 201) console.log(`Добавлен: ${fullName}`);
  else if (result.status === 409) console.log(`Пропущен существующий ИСУ: ${isuId}`);
  else throw new Error(`Ошибка ${result.status}: ${await result.text()}`);
}
