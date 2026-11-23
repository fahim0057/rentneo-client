"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { Booking } from "@/lib/bookings";
import { formatBDT, formatDate } from "@/lib/format";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/booking-status-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function MyBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<{ data: Booking[]; pagination: Pagination }>(
      `/api/bookings/mine?page=${page}&limit=10`
    )
      .then((res) => {
        if (!active) return;
        setItems(res.data);
        setPagination(res.pagination);
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
  }, [page]);

  function goToPage(next: number) {
    if (next === page) return;
    setError(null);
    setLoading(true);
    setPage(next);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">My Rentals</h1>
        <Link href="/equipment" className={buttonVariants({ variant: "outline" })}>
          Book more equipment
        </Link>
      </div>

      {loading && <p className="py-10 text-center text-muted-foreground">Loading your rentals...</p>}

      {error && !loading && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Could not load your rentals: {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="font-medium">No rentals yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick an item, choose your dates and pay securely with Stripe.
          </p>
          <Link href="/equipment" className={`${buttonVariants()} mt-4`}>
            Browse equipment
          </Link>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>
                      <p className="font-medium">{booking.equipmentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.durationUnits} {booking.rentalType} unit
                        {booking.durationUnits === 1 ? "" : "s"}
                      </p>
                    </TableCell>
                    <TableCell>
                      {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                    </TableCell>
                    <TableCell>{booking.quantity}</TableCell>
                    <TableCell>{formatBDT(booking.totalAmount)}</TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={booking.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      <BookingStatusBadge status={booking.bookingStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/equipment/${booking.equipmentId}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Page {pagination.page} of {Math.max(1, pagination.totalPages)} ·{" "}
              {pagination.total} booking{pagination.total === 1 ? "" : "s"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Previous
              </button>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
