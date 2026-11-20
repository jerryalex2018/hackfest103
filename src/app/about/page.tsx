import Link from "next/link";

const steps = [
  {
    title: "1. Take a clear photo",
    text: "Photograph the dirty or damaged spot. Make sure the problem is well-lit and clearly in the frame, along with some surrounding context, so authorities know exactly what needs fixing.",
  },
  {
    title: "2. Pin the exact location",
    text: "Stand beside the problem and tap 'Use my location' so the pin lands on the right spot. An accurate GPS pin prevents delays by ensuring repair crews are sent to the correct street or park.",
  },
  {
    title: "3. Community confirms",
    text: "When more than 10 different people report the same spot, it is officially flagged. Repeat posts from one person only count once, which prevents spam and ensures we only escalate genuine community concerns.",
  },
  {
    title: "4. Authorities are contacted",
    text: "Flagged spots are automatically routed to the correct local authorities. They receive the photo and exact map coordinates so they can take action and clean up the area.",
  },
];

const faqs = [
  {
    question: "Does a single report make a difference?",
    answer: "Yes, but a single report is only the beginning. It stays on the map, but it only gets escalated to local authorities once it reaches the threshold of 10 unique reports from different community members."
  },
  {
    question: "What kind of issues can I report?",
    answer: "You can report any dirty, damaged, or neglected public spaces. This includes illegal dumping, broken streetlights, potholes, overflowing bins, or damaged public property."
  },
  {
    question: "Why is a photo required?",
    answer: "Photos are required as visual proof. They help the community verify the issue and give local authorities a clear understanding of the damage before they dispatch a team."
  }
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-16 px-4 py-10 animate-fade-in">
      
      {/* Intro Section */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-brand-green">
          About Silent Signals
        </h1>
        <p className="text-lg leading-relaxed text-slate-600">
          Silent Signals lets residents report dirty, damaged, or neglected
          public spaces. Our goal is to bridge the gap between the community and 
          the people responsible for maintaining our neighborhoods.
        </p>
        <p className="text-lg leading-relaxed text-slate-600">
          Each report is pinned to its exact location. Because it takes multiple 
          people to verify an issue, local authorities know they are looking at a 
          real community concern, allowing them to see exactly where problems are 
          and respond faster.
        </p>
      </div>

      {/* How it Works Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-brand-blue">How it works</h2>
        <ol className="grid gap-4 sm:grid-cols-2">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl border border-brand-green/20 bg-brand-white p-6 shadow-sm"
            >
              <h3 className="font-semibold text-slate-800">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* Why it Matters Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-brand-blue">Why it matters</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100">
            <h3 className="font-semibold text-slate-800">Faster Cleanups</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              By providing authorities with exact locations and verified photos, we eliminate the guesswork and help them route their teams more efficiently.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100">
            <h3 className="font-semibold text-slate-800">Community Power</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              The 10-person threshold ensures that authorities are only notified of issues the whole neighborhood cares about, preventing spam and prioritizing real problems.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-brand-blue">Common Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-brand-white p-5">
              <h3 className="font-semibold text-slate-800">{faq.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
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