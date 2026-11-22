"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { Equipment } from "@/lib/equipment";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";

export default function EquipmentDetailPage() {
  return (
    <Suspense
      fallback={<p className="p-10 text-center text-muted-foreground">Loading...</p>}
    >
      <EquipmentDetail />
    </Suspense>
  );
}

function EquipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user.id;
  const [state, setState] = useState<{
    id: string | null;
    item: Equipment | null;
    error: string | null;
  }>({ id: null, item: null, error: null });

  // No result for this id yet means the request is still in flight.
  const loading = state.id !== id;
  const item = state.item;

  useEffect(() => {
    if (isPending) return;
    if (!userId) {
      router.replace(`/login?next=${encodeURIComponent(`/equipment/${id}`)}`);
      return;
    }

    let active = true;
    apiFetch<{ data: Equipment }>(`/api/equipment/${id}`)
      .then((res) => {
        if (active) setState({ id, item: res.data, error: null });
      })
      .catch((err: Error) => {
        if (active) setState({ id, item: null, error: err.message });
      });
    return () => {
      active = false;
    };
  }, [id, isPending, userId, router]);

  if (isPending || !session || loading) {
    return <p className="p-10 text-center text-muted-foreground">Loading...</p>;
  }

  if (state.error || !item) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          {state.error ?? "Equipment not found."}
        </p>
        <Link
          href="/equipment"
          className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-4`}
        >
          Back to equipment
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/equipment"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        Back to equipment
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.name}
          className="w-full rounded-xl border object-cover"
        />

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            {item.category}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{item.name}</h1>
          <p className="mt-2 flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {item.location}
          </p>

          <p className="mt-4 text-2xl font-bold">
            ${item.rentalPrice}{" "}
            <span className="text-base font-normal text-muted-foreground">
              / {item.rentalType}
            </span>
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <StatusBadge status={item.status} />
            <span>
              {item.availableQuantity > 0
                ? `${item.availableQuantity} available`
                : "Unavailable"}
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Brand</dt>
            <dd>{item.brand}</dd>
            <dt className="text-muted-foreground">Model</dt>
            <dd>{item.model}</dd>
            <dt className="text-muted-foreground">Condition</dt>
            <dd className="capitalize">{item.condition}</dd>
            <dt className="text-muted-foreground">Owner</dt>
            <dd>{item.ownerName}</dd>
          </dl>

          <h2 className="mt-6 font-semibold">Description</h2>
          <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
            {item.description}
          </p>

          <h2 className="mt-6 font-semibold">Rental terms</h2>
          <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
            {item.terms}
          </p>
        </div>
      </div>
    </main>
  );
}
