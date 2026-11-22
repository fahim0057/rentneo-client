"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { Equipment } from "@/lib/equipment";
import { EquipmentForm } from "@/components/equipment-form";

export default function EditEquipmentPage() {
  return (
    <Suspense
      fallback={<p className="py-10 text-center text-muted-foreground">Loading...</p>}
    >
      <EditEquipment />
    </Suspense>
  );
}

function EditEquipment() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = authClient.useSession();
  const [item, setItem] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<{ data: Equipment }>(`/api/equipment/${id}`)
      .then((res) => active && setItem(res.data))
      .catch((err: Error) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <p className="py-10 text-center text-muted-foreground">Loading...</p>;

  if (error || !item) {
    return (
      <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
        {error ?? "Equipment not found."}
      </p>
    );
  }

  if (item.ownerId !== session?.user.id) {
    return (
      <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
        You can only edit your own equipment.
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Update Equipment</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        After you save, this item returns to <strong>pending</strong> until an admin reviews it again.
      </p>
      <EquipmentForm initial={item} />
    </div>
  );
}