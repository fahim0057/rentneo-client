"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { formatBDT } from "@/lib/format";
import {
  MonthlyActivityTable,
  StatCard,
  type MonthlyActivity,
} from "@/components/analytics";
import { buttonVariants } from "@/components/ui/button";

interface OwnerAnalytics {
  equipment: number;
  totalBookings: number;
  pendingBookings: number;
  activeRentals: number;
  completedRentals: number;
  totalEarnings: number;
  currency: string;
  monthly: MonthlyActivity[];
}

export default function OwnerAnalyticsPage() {
  const [data, setData] = useState<OwnerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<{ data: OwnerAnalytics }>("/api/analytics/owner")
      .then((res) => {
        if (active) setData(res.data);
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
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Owner Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your listings, rental requests and the last 12 months of earnings.
          </p>
        </div>
        <Link
          href="/dashboard/owner/bookings"
          className={buttonVariants({ variant: "outline" })}
        >
          Manage requests
        </Link>
      </div>

      {loading && <p className="py-10 text-center text-muted-foreground">Loading analytics...</p>}

      {error && !loading && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Could not load analytics: {error}
        </p>
      )}

      {!loading && !error && data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Your listings" value={data.equipment} />
            <StatCard label="Total bookings" value={data.totalBookings} />
            <StatCard label="Awaiting payment" value={data.pendingBookings} />
            <StatCard label="Active rentals" value={data.activeRentals} />
            <StatCard label="Completed rentals" value={data.completedRentals} />
            <StatCard
              label="Total earnings"
              value={formatBDT(data.totalEarnings)}
              hint="Succeeded payments, all time"
            />
          </div>

          <h2 className="mt-8 mb-3 text-lg font-semibold">Last 12 months</h2>
          <MonthlyActivityTable rows={data.monthly} />
        </>
      )}
    </div>
  );
}
