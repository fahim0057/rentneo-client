"use client";
import { Logo } from "@/components/logo";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { href: "/", label: "Home" },
  { href: "/equipment", label: "All Equipment" },
];

export function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const user = session?.user;

  async function handleLogout() {
    await authClient.signOut();
    toast.success("Logged out.");
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium hover:underline">
              {l.label}
            </Link>
          ))}
          {user && (
            <Link href="/dashboard" className="text-sm font-medium hover:underline">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {isPending ? (
            <div className="h-9 w-24" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full outline-none">
                <Avatar>
                  <AvatarImage src={user.image ?? undefined} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/bookings")}>
                  My Rentals
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/favorites")}>
                  Favorites
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
                Login
              </Link>
              <Link href="/register" className={buttonVariants()}>
                Register
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-2 border-t px-4 py-4 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-1">
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="block py-1">
                Dashboard
              </Link>
              <Link href="/dashboard/bookings" onClick={() => setOpen(false)} className="block py-1">
                My Rentals
              </Link>
              <Link href="/dashboard/favorites" onClick={() => setOpen(false)} className="block py-1">
                Favorites
              </Link>
              <Link href="/dashboard/profile" onClick={() => setOpen(false)} className="block py-1">
                Profile
              </Link>
              <button onClick={handleLogout} className="block py-1">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="block py-1">Login</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="block py-1">Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}