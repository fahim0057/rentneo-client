export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "active",
  "completed",
  "cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type RentalType = "daily" | "weekly" | "monthly";

export interface Booking {
  _id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  ownerId: string;
  ownerName: string;
  equipmentId: string;
  equipmentName: string;
  rentalType: RentalType;
  unitPrice: number;
  quantity: number;
  startDate: string;
  endDate: string;
  durationUnits: number;
  totalAmount: number;
  currency: string;
  contactNumber: string;
  deliveryAddress: string;
  notes: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  stripeSessionId?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

/** Mirrors the server's calendar-based rental maths so the modal can preview a total. */
export function rentalUnits(startDate: string, endDate: string, rentalType: RentalType): number | null {
  const start = Date.parse(`${startDate}T00:00:00.000Z`);
  const end = Date.parse(`${endDate}T00:00:00.000Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;

  const days = Math.round((end - start) / 86_400_000);
  if (days < 1) return null;

  return rentalType === "daily" ? days : rentalType === "weekly" ? Math.ceil(days / 7) : Math.ceil(days / 30);
}

export function estimateTotal({
  startDate,
  endDate,
  rentalType,
  unitPrice,
  quantity,
}: {
  startDate: string;
  endDate: string;
  rentalType: RentalType;
  unitPrice: number;
  quantity: number;
}): number | null {
  const units = rentalUnits(startDate, endDate, rentalType);
  if (units === null || quantity < 1) return null;
  return Math.round(unitPrice * units * quantity * 100) / 100;
}

/** The forward-only transitions an owner is allowed to make. */
export const OWNER_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: [],
  confirmed: ["active", "cancelled"],
  active: ["completed"],
  completed: [],
  cancelled: [],
};
