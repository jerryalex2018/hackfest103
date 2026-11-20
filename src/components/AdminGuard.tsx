"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { USE_MOCKS } from "@/lib/config";
import { supabase } from "@/lib/supabase";

type GuardStatus = "loading" | "unauthorized" | "authorized";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<GuardStatus>("loading");

  useEffect(() => {
    async function verifyAdminAccess() {
      try {
        // --- Mock / no-Supabase mode: trust localStorage ---
        if (USE_MOCKS || !supabase) {
          const stored = getUser();
          if (!stored) {
            router.replace("/login");
            return;
          }
          if (stored.role !== "admin") {
            setStatus("unauthorized");
            setTimeout(() => router.replace("/report"), 2000);
            return;
          }
          setStatus("authorized");
          return;
        }

        // --- Real mode: cryptographically verify session with Supabase ---
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          router.replace("/login");
          return;
        }

        // Verify role against profiles database table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        const role = profile?.role || user.user_metadata?.role;

        if (role !== "admin") {
          setStatus("unauthorized");
          setTimeout(() => router.replace("/report"), 2000);
          return;
        }

        setStatus("authorized");
      } catch (err) {
        console.error("Admin verification failed:", err);
        router.replace("/login");
      }
    }

    verifyAdminAccess();
  }, [router]);

  // 1. Loading state — checking access
  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="relative flex h-20 w-20 items-center justify-center">
          {/* Spinning ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-100 border-t-brand-green"></div>
          {/* Lock icon in the middle */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brand-green animate-pulse"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          Verifying Access
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {USE_MOCKS || !supabase
            ? "Please wait while we secure your session..."
            : "Verifying security clearance with Supabase..."}
        </p>
      </div>
    );
  }

  // 2. Unauthorized state — non-admin, showing message before redirect
  if (status === "unauthorized") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 animate-fade-in">
        <div className="w-full rounded-3xl border border-red-100 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32" height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              <line x1="12" y1="11" x2="12" y2="17"></line>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
          <p className="mt-2 text-sm text-slate-500">
            You do not have administrator permissions to view this dashboard.
            Redirecting you back to safety...
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/report"
              className="rounded-full bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
            >
              Go back now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized state
  return <div className="animate-fade-in">{children}</div>;
}