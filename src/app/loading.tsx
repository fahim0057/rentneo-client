/**
 * Route-level loading UI. Next renders this inside the root layout while a
 * server segment is resolving, so the navbar and footer stay in place.
 */
export default function Loading() {
  return (
    <main
      className="mx-auto w-full max-w-7xl px-4 py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading page…</span>

      <div className="space-y-3">
        <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-muted/70" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border bg-muted/40" />
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border bg-card">
            <div className="h-48 animate-pulse bg-muted" />
            <div className="space-y-3 p-4">
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="flex items-center justify-between pt-3">
                <div className="h-6 w-20 animate-pulse rounded bg-muted" />
                <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
