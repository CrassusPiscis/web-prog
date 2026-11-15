"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "./useAuth";
import { authApi } from "../api/authApi";
export function AuthProvider({ children, initialUser }) {
  const [updatedUser, setUpdatedUser] = useState(null);
  const user =
    updatedUser?.source === initialUser ? updatedUser.value : initialUser;
  const router = useRouter();
  useEffect(() => {
    const ended = () => {
      router.replace("/login");
      router.refresh();
    };
    const changed = () => router.refresh();
    window.addEventListener("session-ended", ended);
    window.addEventListener("permissions-changed", changed);
    return () => {
      window.removeEventListener("session-ended", ended);
      window.removeEventListener("permissions-changed", changed);
    };
  }, [router]);
  async function logout() {
    await authApi.logout();
    router.replace("/login");
    router.refresh();
  }
  async function refreshUser() {
    const current = await authApi.me();
    setUpdatedUser({ source: initialUser, value: current });
    router.refresh();
    return current;
  }
  return (
    <AuthContext.Provider value={{ user, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
