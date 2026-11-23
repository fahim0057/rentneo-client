import { formatBDT } from "@/lib/format";

export interface MonthlyActivity {
  month: string;
  bookings: number;
  revenue: number;
  payments: number;
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function monthLabel(month: string): string {
  const date = new Date(`${month}-01T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return month;
  return date.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function MonthlyActivityTable({ rows }: { rows: MonthlyActivity[] }) {
  const maxRevenue = Math.max(1, ...rows.map((r) => r.revenue));

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className="border-b">
            <th className="h-10 px-2 text-left align-middle font-medium">Month</th>
            <th className="h-10 px-2 text-left align-middle font-medium">Bookings</th>
            <th className="h-10 px-2 text-left align-middle font-medium">Payments</th>
            <th className="h-10 px-2 text-left align-middle font-medium">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.month} className="border-b last:border-0">
              <td className="p-2 align-middle">{monthLabel(row.month)}</td>
              <td className="p-2 align-middle">{row.bookings}</td>
              <td className="p-2 align-middle">{row.payments}</td>
              <td className="p-2 align-middle">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 shrink-0 overflow-hidden rounded bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.round((row.revenue / maxRevenue) * 100)}%` }}
                    />
                  </div>
                  <span className="whitespace-nowrap">{formatBDT(row.revenue)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
