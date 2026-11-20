import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Do I need an account to report?",
    a: "Yes. An account lets us credit your reports and stop one person from flagging a spot by posting many times.",
  },
  {
    q: "Can I report a place that isn't on my street?",
    a: "Yes, as long as you are standing close to it when you pin the location. The pin uses your phone's GPS position.",
  },
  {
    q: "Who receives the flagged reports?",
    a: "The offices listed as authorities in the system, such as the county environment office. Each is emailed once per flag.",
  },
  {
    q: "Will my name be shown publicly?",
    a: "Reports show the reporter's first name. Email addresses are never shown on the site.",
  },
];

export default function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-brand-green">
          Common questions
        </h2>
        <p className="text-sm text-slate-500">
          Quick answers before you report
        </p>
      </div>
      <div className="space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.q}
            className="group rounded-2xl border border-slate-200 bg-brand-white p-5 open:border-brand-green/40"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-800">
              {faq.q}
              <ChevronDown
                className="h-5 w-5 shrink-0 text-brand-blue transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
