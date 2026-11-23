"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import {
  OWNER_TRANSITIONS,
  type Booking,
  type BookingStatus,
} from "@/lib/bookings";
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

const ACTION_LABELS: Partial<Record<BookingStatus, string>> = {
  active: "Mark active",
  completed: "Complete",
  cancelled: "Cancel",
};

export default function OwnerBookingsPage() {
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
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<{ data: Booking[]; pagination: Pagination }>(
      `/api/bookings/owner?page=${page}&limit=10`
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

  async function setStatus(booking: Booking, bookingStatus: BookingStatus) {
    setBusyId(booking._id);
    try {
      const res = await apiFetch<{ data: Booking }>(
        `/api/bookings/${booking._id}/status`,
        { method: "PATCH", body: JSON.stringify({ bookingStatus }) }
      );
      setItems((prev) => prev.map((b) => (b._id === booking._id ? res.data : b)));
      toast.success(`Booking marked ${bookingStatus}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update booking");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Rental Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paid bookings for your equipment. Move them from confirmed to active
            when the renter picks up, then complete them on return.
          </p>
        </div>
        <Link
          href="/dashboard/owner/analytics"
          className={buttonVariants({ variant: "outline" })}
        >
          View analytics
        </Link>
      </div>

      {loading && <p className="py-10 text-center text-muted-foreground">Loading rental requests...</p>}

      {error && !loading && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Could not load rental requests: {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="rounded-md border border-dashed p-10 text-center">
          No bookings yet. Once a renter pays, their request appears here.
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Renter</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((booking) => {
                  const transitions = OWNER_TRANSITIONS[booking.bookingStatus];
                  return (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">{booking.equipmentName}</TableCell>
                      <TableCell>
                        <p>{booking.customerName}</p>
                        <p className="text-xs text-muted-foreground">{booking.customerEmail}</p>
                        <p className="text-xs text-muted-foreground">{booking.contactNumber}</p>
                        <p className="max-w-48 whitespace-normal text-xs text-muted-foreground">
                          {booking.deliveryAddress}
                        </p>
                      </TableCell>
                      <TableCell>
                        {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                        <p className="text-xs text-muted-foreground">
                          Qty {booking.quantity}
                        </p>
                      </TableCell>
                      <TableCell>{formatBDT(booking.totalAmount)}</TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={booking.paymentStatus} />
                      </TableCell>
                      <TableCell>
                        <BookingStatusBadge status={booking.bookingStatus} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-2">
                          {transitions.length === 0 && (
                            <span className="text-xs text-muted-foreground">No action</span>
                          )}
                          {transitions.map((next) => (
                            <button
                              key={next}
                              onClick={() => setStatus(booking, next)}
                              disabled={busyId === booking._id}
                              className={buttonVariants({
                                variant: next === "cancelled" ? "destructive" : "outline",
                                size: "sm",
                              })}
                            >
                              {ACTION_LABELS[next] ?? next}
                            </button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Page {pagination.page} of {Math.max(1, pagination.totalPages)} ·{" "}
              {pagination.total} request{pagination.total === 1 ? "" : "s"}
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
