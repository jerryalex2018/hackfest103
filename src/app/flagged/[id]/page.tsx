import { Suspense } from "react";
import FlaggedDetailView from "@/components/FlaggedDetailView";

type Params = Promise<{ id: string }>;

async function DetailContent({ params }: { params: Params }) {
  const { id } = await params;
  return <FlaggedDetailView id={id} />;
}

export default function FlaggedDetailPage({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-6xl px-4 py-10">
          <p className="animate-pulse text-slate-500">Loading location...</p>
        </section>
      }
    >
      <DetailContent params={params} />
    </Suspense>
  );
}
