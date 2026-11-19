import Link from "next/link";

const steps = [
  {
    title: "Take a photo",
    text: "Photograph the dirty or damaged spot. Keep the problem clearly in the frame.",
  },
  {
    title: "Pin the exact location",
    text: "Stand beside the problem and tap Use my location so the pin lands on the right spot.",
  },
  {
    title: "Community confirms",
    text: "When more than 10 different people report the same spot, it is flagged. Repeat posts from one person count once.",
  },
  {
    title: "Authorities are contacted",
    text: "Flagged spots are sent to local authorities so they can take action.",
  },
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-12 px-4 py-10 animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-brand-green">
          About Degradation Watch
        </h1>
        <p className="text-lg leading-relaxed text-slate-600">
          Degradation Watch lets residents report dirty, damaged, or neglected
          public spaces. Each report is pinned to its exact location, so local
          authorities can see where problems are and respond faster.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-brand-blue">How it works</h2>
        <ol className="grid gap-4 sm:grid-cols-2">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl border border-brand-green/20 bg-brand-white p-6 shadow-sm"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green font-bold text-brand-white">
                {index + 1}
              </span>
              <h3 className="mt-4 font-semibold text-slate-800">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-brand-green to-brand-blue p-8 text-center text-brand-white">
        <h2 className="text-2xl font-bold">Ready to help?</h2>
        <p className="mt-2 opacity-95">
          Spotted something that needs attention? Report it now.
        </p>
        <Link
          href="/report"
          className="mt-6 inline-block rounded-full bg-brand-white px-6 py-3 font-semibold text-brand-green transition-transform hover:scale-105"
        >
          Report a spot
        </Link>
      </div>
    </section>
  );
}
