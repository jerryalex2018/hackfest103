"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { clearSession, saveSession } from "@/lib/auth";
import { USE_MOCKS } from "@/lib/config";
import type { User } from "@/lib/types";

type AuthResponse = { token: string; user: User };

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(path: string, body: object, name = "Jerry") {
    setLoading(true);
    setError(null);
    try {
      const data: AuthResponse = USE_MOCKS
        ? {
            token: "mock-token",
            user: { id: 1, name, email: (body as { email: string }).email },
          }
        : await apiPost<AuthResponse>(path, body);

      saveSession(data.token, data.user);
      router.push("/report");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const login = (email: string, password: string) =>
    run("/auth/login", { email, password });

  const register = (name: string, email: string, password: string) =>
    run("/auth/register", { name, email, password }, name);

  const logout = () => {
    clearSession();
    router.push("/login");
  };

  return { login, register, logout, loading, error };
}
