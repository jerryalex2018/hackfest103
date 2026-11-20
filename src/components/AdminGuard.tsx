"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/auth";
import { USE_MOCKS } from "@/lib/config";
import { supabase } from "@/lib/supabase";
import type { User } from "@/lib/types";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verifyAdminAccess() {
      try {
        if (USE_MOCKS || !supabase) {
          const stored = getUser();
          if (!stored) {
            router.replace("/login");
            return;
          }
          if (stored.role !== "admin") {
            router.replace("/report");
            return;
          }
          setAuthorized(true);
          return;
        }

        // Cryptographically verify session with Supabase server
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
          router.replace("/report");
          return;
        }

        setAuthorized(true);
      } catch (err) {
        console.error("Admin verification failed:", err);
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    }

    verifyAdminAccess();
  }, [router]);

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent"></div>
        <p className="text-sm font-semibold text-slate-600">
          Verifying security clearance with Supabase...
        </p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
