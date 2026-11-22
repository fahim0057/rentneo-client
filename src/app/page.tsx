import { Hero } from "@/components/home/hero";
import { Categories } from "@/components/home/categories";
import { FeaturedEquipment } from "@/components/home/featured";
import { WhyChoose } from "@/components/home/why-choose";
import { HowItWorks } from "@/components/home/how-it-works";
import { Reviews } from "@/components/home/reviews";
import { OwnerCta } from "@/components/home/owner-cta";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FeaturedEquipment />
      <Categories />
      <WhyChoose />
      <HowItWorks />
      <Reviews />
      <OwnerCta />
    </main>
  );
}