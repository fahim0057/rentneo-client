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
import { MonthlyChart } from "@/components/monthly-chart";
import { buttonVariants } from "@/components/ui/button";

interface AdminAnalytics {
  users: number;
  equipment: number;
  pendingApprovals: number;
  totalBookings: number;
  activeRentals: number;
  completedRentals: number;
  totalRevenue: number;
  currency: string;
  monthly: MonthlyActivity[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<{ data: AdminAnalytics }>("/api/analytics/admin")
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
          <h1 className="text-2xl font-bold">Platform Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Marketplace totals and the last 12 months of activity.
          </p>
        </div>
        <Link
          href="/dashboard/admin/bookings"
          className={buttonVariants({ variant: "outline" })}
        >
          Manage bookings
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total users" value={data.users} />
            <StatCard label="Equipment listings" value={data.equipment} />
            <StatCard label="Pending approvals" value={data.pendingApprovals} />
            <StatCard label="Total bookings" value={data.totalBookings} />
            <StatCard label="Active rentals" value={data.activeRentals} />
            <StatCard label="Completed rentals" value={data.completedRentals} />
            <StatCard
              label="Total revenue"
              value={formatBDT(data.totalRevenue)}
              hint="Succeeded payments, all time"
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <MonthlyChart
              rows={data.monthly}
              metric="bookings"
              title="Bookings per month"
            />
            <MonthlyChart
              rows={data.monthly}
              metric="revenue"
              title="Revenue per month"
            />
          </div>

          <h2 className="mt-8 mb-3 text-lg font-semibold">Monthly detail</h2>
          <MonthlyActivityTable rows={data.monthly} />
        </>
      )}
    </div>
  );
}
