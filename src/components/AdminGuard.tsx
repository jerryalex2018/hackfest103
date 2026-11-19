"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/auth";
import type { User } from "@/lib/types";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = getUser();
    if (!stored) {
      router.replace("/login");
      return;
    }
    if (stored.role !== "admin") {
      router.replace("/report");
      return;
    }
    setUser(stored);
  }, [router]);

  if (!user) {
    return (
      <p className="animate-pulse py-12 text-center text-slate-500">
        Checking access...
      </p>
    );
  }

  return <>{children}</>;
}
