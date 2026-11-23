import type { BookingStatus, PaymentStatus } from "@/lib/bookings";

const bookingStyles: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  active: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  completed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

const paymentStyles: Record<PaymentStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  refunded: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${bookingStyles[status]}`}
    >
      {status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${paymentStyles[status]}`}
    >
      {status}
    </span>
  );
}
