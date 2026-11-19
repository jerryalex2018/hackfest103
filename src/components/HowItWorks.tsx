const steps = [
  {
    icon: "📷",
    title: "Snap",
    text: "Take a clear photo of the dirty or damaged spot.",
  },
  {
    icon: "📍",
    title: "Pin",
    text: "Stand beside the problem and let your phone mark the exact location.",
  },
  {
    icon: "🏛️",
    title: "Flag",
    text: "When more than 10 different people report the same spot, local authorities are notified.",
  },
];

export default function HowItWorks() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-green">How it works</h2>
        <p className="text-sm text-slate-500">
          Three steps from a problem to a response
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="animate-fade-in relative overflow-hidden rounded-2xl border border-brand-blue/20 bg-brand-white p-6 shadow-sm"
          >
            <span className="absolute right-4 top-2 text-6xl font-black text-brand-green/10">
              {i + 1}
            </span>
            <span className="text-3xl">{step.icon}</span>
            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
