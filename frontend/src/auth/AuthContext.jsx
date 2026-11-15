import { useEffect, useRef, useState } from "react";
import { AuthContext } from "./useAuth";
import { authApi } from "../api/authApi";
import {
  clearSession,
  getTokens,
  sessionVersion,
  startSession,
} from "../api/session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const loginSequence = useRef(0);

  useEffect(() => {
    const lifecycle = new AbortController();
    const version = sessionVersion();
    const ended = () => {
      loginSequence.current += 1;
      setUser(null);
      setError(null);
      setReady(true);
    };
    const permissionsChanged = () => {
      setReady(false);
      setAttempt((value) => value + 1);
    };
    window.addEventListener("session-ended", ended);
    window.addEventListener("permissions-changed", permissionsChanged);
    Promise.resolve()
      .then(async () => {
        if (getTokens().accessToken || getTokens().refreshToken) {
          const value = await authApi.me();
          if (!lifecycle.signal.aborted && sessionVersion() === version) {
            setUser(value);
            setError(null);
          }
        }
      })
      .catch((reason) => {
        if (!lifecycle.signal.aborted && reason.status !== 401)
          setError(reason);
      })
      .finally(() => {
        if (!lifecycle.signal.aborted) setReady(true);
      });
    return () => {
      lifecycle.abort();
      window.removeEventListener("session-ended", ended);
      window.removeEventListener("permissions-changed", permissionsChanged);
    };
  }, [attempt]);

  async function login(credentials) {
    const sequence = ++loginSequence.current;
    const tokens = await authApi.login(credentials);
    if (sequence !== loginSequence.current) return;
    startSession(tokens);
    const version = sessionVersion();
    const current = await authApi.me();
    if (version === sessionVersion()) {
      setUser(current);
      setError(null);
      setReady(true);
    }
  }
  function logout() {
    clearSession();
  }
  async function refreshUser() {
    const version = sessionVersion();
    const value = await authApi.me();
    if (sessionVersion() === version) setUser(value);
    return value;
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        error,
        login,
        logout,
        refreshUser,
        retry: () => {
          setError(null);
          setReady(false);
          setAttempt((value) => value + 1);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
