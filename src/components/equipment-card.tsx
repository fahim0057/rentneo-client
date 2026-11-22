"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { buttonVariants } from "@/components/ui/button";
import type { Equipment } from "@/lib/equipment";

export function EquipmentCard({ item }: { item: Equipment }) {
  const { data: session } = authClient.useSession();
  const inStock = item.availableQuantity > 0;
  // Logged-out visitors are sent to Login, as the brief requires
  const href = session ? `/equipment/${item._id}` : "/login";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt={item.name} className="h-48 w-full object-cover" />
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            inStock ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {inStock ? `${item.availableQuantity} available` : "Unavailable"}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">{item.category}</p>
        <h3 className="mt-1 line-clamp-1 text-lg font-semibold">{item.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {item.location}
        </p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <p>
            <span className="text-xl font-bold">${item.rentalPrice}</span>
            <span className="text-sm text-muted-foreground"> / {item.rentalType}</span>
          </p>
          <Link href={href} className={buttonVariants({ size: "sm" })}>
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}