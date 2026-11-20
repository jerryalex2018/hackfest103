import { Suspense } from "react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Added a subtle background color to make the white cards pop
    <div className="min-h-screen bg-slate-50/50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[240px_1fr] lg:py-12">
        
        {/* Sidebar Container */}
        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
          <Suspense 
            fallback={
              // Skeleton loader that mimics the shape of a sidebar
              <div className="flex w-full animate-pulse flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 lg:w-[240px]">
                <div className="h-8 w-3/4 rounded-md bg-slate-200"></div>
                <div className="mt-4 space-y-3">
                  <div className="h-10 w-full rounded-lg bg-slate-100"></div>
                  <div className="h-10 w-full rounded-lg bg-slate-100"></div>
                  <div className="h-10 w-full rounded-lg bg-slate-100"></div>
                  <div className="h-10 w-full rounded-lg bg-slate-100"></div>
                </div>
              </div>
            }
          >
            <AdminSidebar />
          </Suspense>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 animate-fade-in pb-12">
          {children}
        </main>
        
      </div>
    </div>
  );
}