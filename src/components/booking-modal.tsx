"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { Equipment } from "@/lib/equipment";
import { estimateTotal, rentalUnits } from "@/lib/bookings";
import { addDaysInput, formatBDT, todayInput } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  equipment: Equipment;
  onClose: () => void;
}

export function BookingModal({ equipment, onClose }: Props) {
  const { data: session } = authClient.useSession();
  const today = todayInput();

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addDaysInput(today, 1));
  const [quantity, setQuantity] = useState(1);
  const [contactNumber, setContactNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !submitting && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  // Keep the return date after the pickup date.
  function changeStart(value: string) {
    setStartDate(value);
    if (!value || endDate <= value) setEndDate(addDaysInput(value, 1));
  }

  const units = rentalUnits(startDate, endDate, equipment.rentalType);
  const total = estimateTotal({
    startDate,
    endDate,
    rentalType: equipment.rentalType,
    unitPrice: equipment.rentalPrice,
    quantity,
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!session) {
      setError("Please sign in again to continue.");
      return;
    }
    if (!units) {
      setError("The return date must be after the pickup date.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch<{ data: { bookingId: string; checkoutUrl: string } }>(
        "/api/bookings",
        {
          method: "POST",
          body: JSON.stringify({
            equipmentId: equipment._id,
            startDate,
            endDate,
            quantity,
            contactNumber,
            deliveryAddress,
            notes,
          }),
        }
      );

      // Stripe Checkout is hosted, so leave the app entirely.
      window.location.assign(res.data.checkoutUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not start checkout";
      setError(message);
      toast.error(message);
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-10"
      onClick={() => !submitting && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="w-full max-w-lg rounded-xl bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="booking-title" className="text-lg font-semibold">
              Book {equipment.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatBDT(equipment.rentalPrice)} / {equipment.rentalType} ·{" "}
              {equipment.availableQuantity} available
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Close
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="booking-start">Pickup date</Label>
              <Input
                id="booking-start"
                type="date"
                required
                min={today}
                value={startDate}
                onChange={(e) => changeStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking-end">Return date</Label>
              <Input
                id="booking-end"
                type="date"
                required
                min={addDaysInput(startDate, 1)}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="booking-quantity">Quantity</Label>
              <Input
                id="booking-quantity"
                type="number"
                min={1}
                max={Math.max(1, equipment.availableQuantity)}
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking-contact">Contact number</Label>
              <Input
                id="booking-contact"
                required
                minLength={6}
                maxLength={20}
                placeholder="01XXXXXXXXX"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-address">Delivery address</Label>
            <Input
              id="booking-address"
              required
              minLength={5}
              maxLength={200}
              placeholder="Street, area, city"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-notes">Notes (optional)</Label>
            <Textarea
              id="booking-notes"
              maxLength={500}
              placeholder="Anything the owner should know"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3 text-sm">
            <div>
              <p className="font-medium">
                {units ?? 0} {equipment.rentalType} unit{units === 1 ? "" : "s"}
              </p>
              <p className="text-xs text-muted-foreground">
                Price is recalculated securely on the server.
              </p>
            </div>
            <p className="text-lg font-bold">{total === null ? "—" : formatBDT(total)}</p>
          </div>

          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !units}>
              {submitting ? "Starting checkout..." : "Continue to payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
