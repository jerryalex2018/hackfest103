import { Suspense } from "react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[220px_1fr]">
      <Suspense fallback={<div />}>
        <AdminSidebar />
      </Suspense>
      <div className="min-w-0 space-y-8 animate-fade-in">{children}</div>
    </div>
  );
}
