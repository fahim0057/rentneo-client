"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { Equipment } from "@/lib/equipment";
import { EquipmentForm } from "@/components/equipment-form";

export default function AdminEditEquipmentPage() {
  const { id } = useParams<{ id: string }>();
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

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Update Equipment (Admin)</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Saving keeps the current status ({item.status}). Use Approve or Reject on the list to change it.
      </p>
      <EquipmentForm initial={item} redirectTo="/dashboard/admin/equipment" />
    </div>
  );
}