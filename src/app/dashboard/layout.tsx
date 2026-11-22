"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type Role = "customer" | "owner" | "admin";
const ROLES: Role[] = ["customer", "owner", "admin"];

// Add entries here as we build each page
const NAV: Record<Role, { href: string; label: string }[]> = {
  customer: [],
  owner: [
    { href: "/dashboard/owner/add-equipment", label: "Add Equipment" },
    { href: "/dashboard/owner/my-equipment", label: "My Equipment" },
  ],
  admin: [
    { href: "/dashboard/admin/users", label: "All Users" },
    { href: "/dashboard/admin/equipment", label: "All Equipment" },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const role: Role =
    session?.user.role === "owner" || session?.user.role === "admin"
      ? session.user.role
      : "customer";

  const section =
    typeof window === "undefined" ? "" : window.location.pathname.split("/")[2];
  const forbidden = ROLES.includes(section as Role) && section !== role;

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      const next = encodeURIComponent(window.location.pathname);
      router.replace(`/login?next=${next}`);
      return;
    }

    // Checked on load only: section links are role-filtered in the nav below.
    if (forbidden) {
      toast.error("You don't have access to that page.");
      router.replace("/dashboard");
    }
  }, [isPending, session, forbidden, router]);

  if (isPending || !session || forbidden) {
    return <p className="p-8 text-center">Loading...</p>;
  }

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-6 md:flex-row">
      <aside className="md:w-56 md:shrink-0">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {role} dashboard
        </p>
        <Suspense fallback={<div className="h-9" />}>
          <DashboardNav role={role} />
        </Suspense>
      </aside>
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}

// usePathname() must sit inside <Suspense> under cacheComponents; keeping it in
// its own component means the page content itself still renders on the server.
function DashboardNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const links = [{ href: "/dashboard", label: "Overview" }, ...NAV[role]];

  return (
    <nav className="flex gap-2 overflow-x-auto md:flex-col">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
            pathname === l.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
