// Токены сохраняются только на время вкладки. Счётчик защищает от позднего refresh после logout.
const KEY = "dormitory.session";
let generation = 0;
export const sessionVersion = () => generation;
export function getTokens() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}
export function saveTokens(tokens) {
  sessionStorage.setItem(KEY, JSON.stringify(tokens));
}
export function startSession(tokens) {
  generation += 1;
  saveTokens(tokens);
}
export function clearSession() {
  generation += 1;
  sessionStorage.removeItem(KEY);
  window.dispatchEvent(new Event("session-ended"));
}
