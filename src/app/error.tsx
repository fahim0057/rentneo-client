"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the digest in the browser console so support can trace it.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-primary">
        Something went wrong
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        We couldn&apos;t load this page
      </h1>
      <p className="mt-3 text-muted-foreground">
        An unexpected error interrupted the request. Try again, or head back to
        the marketplace.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-muted-foreground">Reference: {error.digest}</p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className={buttonVariants()}>
          Try again
        </button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Go home
        </Link>
        <Link href="/equipment" className={buttonVariants({ variant: "outline" })}>
          Browse equipment
        </Link>
      </div>
    </main>
  );
}
