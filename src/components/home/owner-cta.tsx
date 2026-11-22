import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { FadeIn } from "@/components/motion";

export function OwnerCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16">
      <FadeIn>
        <div className="rounded-2xl border border-primary/40 bg-card p-10 text-center md:p-14">
          <h2 className="text-3xl font-bold tracking-tight">Own equipment sitting idle?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            List it on RentNeo, set your own price and rental terms, and start earning from renters in
            your area.
          </p>
          <Link href="/register" className={`${buttonVariants({ size: "lg" })} mt-6`}>
            Start listing
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}