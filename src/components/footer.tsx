import Link from "next/link";
import { SITE_NAME, COPYRIGHT_YEAR } from "@/lib/constants";
import { Logo } from "@/components/logo";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-muted-foreground">
            Rent the equipment you need, or earn from the equipment you own.
          </p>
        </div>
        <div>
          <p className="font-semibold">Quick links</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li><Link href="/equipment" className="hover:underline">All Equipment</Link></li>
            <li><Link href="/login" className="hover:underline">Login</Link></li>
            <li><Link href="/register" className="hover:underline">Register</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Contact</p>
          <p className="mt-2 text-sm text-muted-foreground">support@rentneo.example</p>
          <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X"
             className="mt-3 inline-block">
            <XIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
        <p className="border-t py-4 text-center text-xs text-muted-foreground">
            © {COPYRIGHT_YEAR} {SITE_NAME}. All rights reserved.
        </p>
    </footer>
  );
}