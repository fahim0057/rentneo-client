import { CalendarClock, CreditCard, ShieldCheck, Wallet } from "lucide-react";
import { Section } from "@/components/section";
import { FadeIn } from "@/components/motion";

const BENEFITS = [
  { icon: Wallet, title: "Affordable prices", text: "Rent only for the time you need instead of buying expensive equipment outright." },
  { icon: ShieldCheck, title: "Verified owners", text: "Every listing is reviewed by an admin before it appears on the marketplace." },
  { icon: CalendarClock, title: "Flexible periods", text: "Choose daily, weekly or monthly rentals that fit your project schedule." },
  { icon: CreditCard, title: "Secure payments", text: "Pay safely online through Stripe. Your card details never touch our servers." },
];

export function WhyChoose() {
  return (
    <Section title="Why choose RentNeo" subtitle="A rental marketplace built on trust and transparency.">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map(({ icon: Icon, title, text }, i) => (
          <FadeIn key={title} delay={i * 0.07} className="h-full">
            <div className="h-full rounded-xl border bg-card p-6">
              <Icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}