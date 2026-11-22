import { Section } from "@/components/section";
import { FadeIn } from "@/components/motion";

const STEPS = [
  { title: "Search", text: "Filter by category, location, price and availability." },
  { title: "Book", text: "Pick your dates and quantity. We calculate the total for you." },
  { title: "Pay securely", text: "Complete checkout with Stripe and get instant confirmation." },
  { title: "Use and return", text: "Collect or receive the equipment and return it when your rental ends." },
];

export function HowItWorks() {
  return (
    <Section
      title="How it works"
      subtitle="Four simple steps from search to delivery."
      className="border-y bg-muted/30 max-w-none"
    >
      <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <FadeIn key={s.title} delay={i * 0.08} className="h-full">
            <div className="h-full rounded-xl border bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}