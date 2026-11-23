"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import {
  BOOKING_STATUSES,
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

const FILTERS = ["all", ...BOOKING_STATUSES] as const;
type Filter = (typeof FILTERS)[number];

const TERMINAL: BookingStatus[] = ["completed", "cancelled"];

export default function AdminBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const query =
      filter === "all" ? "" : `&bookingStatus=${encodeURIComponent(filter)}`;
    apiFetch<{ data: Booking[]; pagination: Pagination }>(
      `/api/bookings/admin?page=${page}&limit=10${query}`
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
  }, [filter, page]);

  function changeFilter(next: Filter) {
    if (next === filter) return;
    setError(null);
    setLoading(true);
    setPage(1);
    setFilter(next);
  }

  function goToPage(next: number) {
    if (next === page) return;
    setError(null);
    setLoading(true);
    setPage(next);
  }

  async function setStatus(booking: Booking, bookingStatus: BookingStatus) {
    if (bookingStatus === booking.bookingStatus) return;
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
          <h1 className="text-2xl font-bold">All Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every rental across the marketplace, with payment and fulfilment state.
          </p>
        </div>
        <Link
          href="/dashboard/admin/analytics"
          className={buttonVariants({ variant: "outline" })}
        >
          View analytics
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 rounded-md border p-1">
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

      {loading && <p className="py-10 text-center text-muted-foreground">Loading bookings...</p>}

      {error && !loading && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Could not load bookings: {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="rounded-md border border-dashed p-10 text-center">
          No {filter === "all" ? "" : filter} bookings found.
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
                  <TableHead>Owner</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Set status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell className="font-medium">{booking.equipmentName}</TableCell>
                    <TableCell>
                      <p>{booking.customerName}</p>
                      <p className="text-xs text-muted-foreground">{booking.customerEmail}</p>
                    </TableCell>
                    <TableCell>{booking.ownerName}</TableCell>
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
                    <TableCell className="text-right">
                      <select
                        value={booking.bookingStatus}
                        disabled={busyId === booking._id || TERMINAL.includes(booking.bookingStatus)}
                        onChange={(e) => setStatus(booking, e.target.value as BookingStatus)}
                        className="rounded-md border bg-transparent px-2 py-1 text-sm capitalize disabled:opacity-50"
                      >
                        {BOOKING_STATUSES.map((status) => (
                          <option key={status} value={status} disabled={status === "pending"}>
                            {status}
                          </option>
                        ))}
                      </select>
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
