"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type { Equipment, EquipmentStatus } from "@/lib/equipment";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const FILTERS = ["all", "pending", "approved", "rejected"] as const;
type Filter = (typeof FILTERS)[number];

export default function AdminEquipmentPage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Equipment | null>(null);
  const [deleting, setDeleting] = useState(false);

  // The effect only fetches. State is set inside the promise callbacks.
  useEffect(() => {
    let active = true;
    const query = filter === "all" ? "" : `?status=${filter}`;
    apiFetch<{ data: Equipment[] }>(`/api/equipment/admin/all${query}`)
      .then((res) => {
        if (active) setItems(res.data);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filter, reloadKey]);

  function changeFilter(next: Filter) {
    if (next === filter) return;
    setError(null);
    setLoading(true);
    setFilter(next);
  }

  function reload() {
    setError(null);
    setLoading(true);
    setReloadKey((k) => k + 1);
  }

  async function setStatus(item: Equipment, status: EquipmentStatus) {
    setBusyId(item._id);
    try {
      await apiFetch(`/api/equipment/${item._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(`"${item.name}" is now ${status}.`);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/equipment/${toDelete._id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i._id !== toDelete._id));
      toast.success("Equipment deleted.");
      setToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete equipment");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">All Equipment</h1>
        <div className="flex gap-1 rounded-md border p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => changeFilter(f)}
              className={`rounded px-3 py-1 text-sm capitalize ${
                filter === f ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="py-10 text-center text-muted-foreground">Loading equipment...</p>}

      {error && !loading && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Could not load equipment: {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="rounded-md border border-dashed p-10 text-center">
          No {filter === "all" ? "" : filter} equipment found.
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <p>{item.ownerName}</p>
                    <p className="text-xs text-muted-foreground">{item.ownerEmail}</p>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    ${item.rentalPrice} / {item.rentalType}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        disabled={busyId === item._id || item.status === "approved"}
                        onClick={() => setStatus(item, "approved")}
                        className={buttonVariants({ size: "sm" })}
                      >
                        Approve
                      </button>
                      <button
                        disabled={busyId === item._id || item.status === "rejected"}
                        onClick={() => setStatus(item, "rejected")}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Reject
                      </button>
                      <Link
                        href={`/dashboard/admin/equipment/${item._id}/edit`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Update
                      </Link>
                      <button
                        onClick={() => setToDelete(item)}
                        className={buttonVariants({ variant: "destructive", size: "sm" })}
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete equipment?"
        message={`"${toDelete?.name}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}