"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type { Booking } from "@/lib/bookings";
import type { Review } from "@/lib/reviews";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  booking: Booking;
  onClose: () => void;
  onSubmitted: (review: Review) => void;
}

export function ReviewModal({ booking, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !submitting && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (rating < 1) {
      setError("Choose a star rating first.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch<{ data: Review }>("/api/reviews", {
        method: "POST",
        body: JSON.stringify({ bookingId: booking._id, rating, comment }),
      });
      toast.success("Thanks for your review.");
      onSubmitted(res.data);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not submit review";
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
        aria-labelledby="review-title"
        className="w-full max-w-md rounded-xl bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="review-title" className="text-lg font-semibold">
              Review your rental
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{booking.equipmentName}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Close
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRating value={rating} size="lg" onChange={setRating} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-comment">Comment (optional)</Label>
            <Textarea
              id="review-comment"
              maxLength={500}
              placeholder="How was the equipment and the owner?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
