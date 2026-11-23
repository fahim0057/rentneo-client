"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { buttonVariants } from "@/components/ui/button";

type Role = "customer" | "owner" | "admin";

const ACTIONS: Record<Role, { href: string; label: string; text: string }[]> = {
  customer: [
    {
      href: "/equipment",
      label: "Browse equipment",
      text: "Search and filter approved equipment from verified owners.",
    },
    {
      href: "/dashboard/bookings",
      label: "My rentals",
      text: "Track payments and the status of every booking you have made.",
    },
    {
      href: "/dashboard/favorites",
      label: "Favorites",
      text: "Your saved equipment, ready to book when you need it.",
    },
  ],
  owner: [
    {
      href: "/dashboard/owner/bookings",
      label: "Rental requests",
      text: "Confirm, activate and complete bookings for your equipment.",
    },
    {
      href: "/dashboard/owner/my-equipment",
      label: "My equipment",
      text: "Manage your listings, update details and track approval status.",
    },
    {
      href: "/dashboard/owner/add-equipment",
      label: "Add equipment",
      text: "List a new item. It will be reviewed by an admin before going live.",
    },
    {
      href: "/dashboard/owner/analytics",
      label: "Analytics",
      text: "See your earnings, rental counts and monthly performance.",
    },
  ],
  admin: [
    {
      href: "/dashboard/admin/bookings",
      label: "All bookings",
      text: "Review every rental, payment state and fulfilment status.",
    },
    {
      href: "/dashboard/admin/equipment",
      label: "Review equipment",
      text: "Approve, reject, update or remove marketplace listings.",
    },
    {
      href: "/dashboard/admin/users",
      label: "Manage users",
      text: "Promote customers to owners or admins, and review accounts.",
    },
    {
      href: "/dashboard/admin/analytics",
      label: "Platform analytics",
      text: "Track users, listings, bookings and revenue across the marketplace.",
    },
  ],
};

export function DashboardOverview() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) router.replace("/login?next=/dashboard");
  }, [isPending, session, router]);

  if (isPending || !session) {
    return <p className="p-8 text-center text-muted-foreground">Loading...</p>;
  }

  const role: Role =
    session.user.role === "owner" || session.user.role === "admin"
      ? session.user.role
      : "customer";
  const actions = ACTIONS[role];

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome back, {session.user.name}. You are signed in as a{" "}
        <span className="font-medium text-foreground">{role}</span>.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-xl border bg-card p-5 transition hover:border-primary/60 hover:bg-accent"
          >
            <p className="font-semibold">{action.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{action.text}</p>
          </Link>
        ))}
      </div>

      <Link
        href="/equipment"
        className={`${buttonVariants({ variant: "outline" })} mt-6`}
      >
        Browse marketplace
      </Link>
    </main>
  );
}
