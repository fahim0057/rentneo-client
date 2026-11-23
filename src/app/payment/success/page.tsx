"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { Booking } from "@/lib/bookings";
import { formatBDT, formatDate } from "@/lib/format";
import { PaymentStatusBadge } from "@/components/booking-status-badge";
import { buttonVariants } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={<p className="p-10 text-center text-muted-foreground">Loading...</p>}
    >
      <PaymentSuccess />
    </Suspense>
  );
}

function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { data: session, isPending } = authClient.useSession();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      const next = `/payment/success${sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : ""}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    if (!sessionId) return;

    let active = true;
    apiFetch<{ data: Booking }>(
      `/api/payments/success?session_id=${encodeURIComponent(sessionId)}`
    )
      .then((res) => {
        if (active) setBooking(res.data);
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
  }, [isPending, session, sessionId, router]);

  if (isPending || !session || (loading && sessionId)) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Confirming your payment...</p>
        <p className="mt-2 text-xs text-muted-foreground">
          This can take a few seconds while we talk to Stripe.
        </p>
      </main>
    );
  }

  if (!sessionId) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          This page is missing its payment session id.
        </p>
        <div className="mt-6 flex gap-2">
          <Link href="/dashboard/bookings" className={buttonVariants()}>
            My Rentals
          </Link>
          <Link href="/equipment" className={buttonVariants({ variant: "outline" })}>
            Browse equipment
          </Link>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          {error ?? "We could not confirm this payment."}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          If money left your account, the booking will still be confirmed by the
          Stripe webhook. Check My Rentals in a moment.
        </p>
        <div className="mt-6 flex gap-2">
          <Link href="/dashboard/bookings" className={buttonVariants()}>
            My Rentals
          </Link>
          <Link
            href="/equipment"
            className={buttonVariants({ variant: "outline" })}
          >
            Browse equipment
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-xl border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
        <h1 className="mt-4 text-2xl font-bold">Payment successful</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your rental is confirmed. The owner can now prepare your equipment.
        </p>

        <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-left text-sm">
          <dt className="text-muted-foreground">Equipment</dt>
          <dd className="font-medium">{booking.equipmentName}</dd>
          <dt className="text-muted-foreground">Dates</dt>
          <dd>
            {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
          </dd>
          <dt className="text-muted-foreground">Quantity</dt>
          <dd>{booking.quantity}</dd>
          <dt className="text-muted-foreground">Total paid</dt>
          <dd className="font-semibold">{formatBDT(booking.totalAmount)}</dd>
          <dt className="text-muted-foreground">Payment</dt>
          <dd>
            <PaymentStatusBadge status={booking.paymentStatus} />
          </dd>
        </dl>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link href="/dashboard/bookings" className={buttonVariants()}>
            View my rentals
          </Link>
          <Link
            href={`/equipment/${booking.equipmentId}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Back to equipment
          </Link>
        </div>
      </div>
    </main>
  );
}
