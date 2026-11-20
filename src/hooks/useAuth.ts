"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { clearSession, saveSession } from "@/lib/auth";
import { USE_MOCKS } from "@/lib/config";
import { supabase } from "@/lib/supabase";
import type { User } from "@/lib/types";

type AuthResponse = { token: string; user: User };

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, pass: string) {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCKS || !supabase) {
        // Fallback demo authentication
        const isAdm = email.toLowerCase().includes("admin");
        const demoUser: User = {
          id: 1,
          name: isAdm ? "Admin Officer" : "Citizen Reporter",
          email,
          role: isAdm ? "admin" : "citizen",
        };
        saveSession("mock-jwt-token-12345", demoUser);
        router.push(isAdm ? "/admin" : "/report");
        return;
      }

      // Secure Supabase Authentication
      const { data, error: sbError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (sbError || !data.user) {
        throw new Error(sbError?.message || "Invalid email or password");
      }

      // Fetch user role from profiles table securely
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, name, email, role")
        .eq("auth_user_id", data.user.id)
        .maybeSingle();

      const userRole = (profile?.role || data.user.user_metadata?.role || "citizen") as User["role"];
      const appUser: User = {
        id: profile?.id ? Number(profile.id) : 1,
        name: profile?.name || data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
        email: data.user.email || email,
        role: userRole,
      };

      saveSession(data.session?.access_token || "supabase-session", appUser);
      router.push(userRole === "admin" ? "/admin" : "/report");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function register(name: string, email: string, pass: string) {
    setLoading(true);
    setError(null);

    try {
      if (pass.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      if (USE_MOCKS || !supabase) {
        const isAdm = email.toLowerCase().includes("admin");
        const demoUser: User = {
          id: 1,
          name,
          email,
          role: isAdm ? "admin" : "citizen",
        };
        saveSession("mock-jwt-token-12345", demoUser);
        router.push(isAdm ? "/admin" : "/report");
        return;
      }

      // Secure Supabase Sign Up
      const { data, error: sbError } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: {
          data: {
            name: name.trim(),
            role: "citizen",
          },
        },
      });

      if (sbError || !data.user) {
        throw new Error(sbError?.message || "Registration failed");
      }

      // Record profile in database
      await supabase.from("profiles").upsert({
        auth_user_id: data.user.id,
        name: name.trim(),
        email: email.trim(),
        role: "citizen",
      });

      const appUser: User = {
        id: 1,
        name: name.trim(),
        email: email.trim(),
        role: "citizen",
      };

      saveSession(data.session?.access_token || "supabase-session", appUser);
      router.push("/report");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn("Supabase signout notice:", e);
    } finally {
      clearSession();
      router.push("/login");
    }
  }

  return { login, register, logout, loading, error };
}
