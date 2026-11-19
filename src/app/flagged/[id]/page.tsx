export default async function FlaggedDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-brand-green">Location #{id}</h1>
      <p className="mt-2 text-slate-600">Coming soon.</p>
    </section>
  );
}
