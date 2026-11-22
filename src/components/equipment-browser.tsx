"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CATEGORIES, RENTAL_TYPES, type Equipment } from "@/lib/equipment";
import { EquipmentCard } from "@/components/equipment-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PAGE_SIZE = 9; // 3 x 3 grid
const FILTER_KEYS = ["search", "category", "rentalType", "minPrice", "maxPrice", "availability", "sort"];

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
interface Result {
  key: string;
  items: Equipment[];
  pagination: PaginationInfo | null;
  error: string | null;
}

export function EquipmentBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const topRef = useRef<HTMLDivElement>(null);

  const [result, setResult] = useState<Result | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [attempt, setAttempt] = useState(0);

  const get = (key: string) => searchParams.get(key) ?? "";
  const hasFilters = FILTER_KEYS.some((k) => searchParams.get(k));

  // The URL is the single source of truth, so filters survive reloads and the back button.
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(queryString);
    params.set("limit", String(PAGE_SIZE));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/equipment?${params}`)
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.message ?? `Request failed (${res.status})`);
        return body;
      })
      .then((body) => {
        if (active)
          setResult({ key: queryString, items: body.data, pagination: body.pagination, error: null });
      })
      .catch((err: Error) => {
        if (active) setResult({ key: queryString, items: [], pagination: null, error: err.message });
      });

    return () => {
      active = false;
    };
  }, [queryString, attempt]);

  // Loading is derived: results belong to a different query than the one in the URL.
  const loading = result?.key !== queryString;

  function update(changes: Record<string, string | undefined>, resetPage = true) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    if (resetPage) params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `/equipment?${qs}` : "/equipment", { scroll: false });
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const search = String(f.get("search") ?? "").trim();
    const minPrice = String(f.get("minPrice") ?? "").trim();
    const maxPrice = String(f.get("maxPrice") ?? "").trim();

    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      toast.error("Minimum price cannot be higher than maximum price.");
      return;
    }
    update({
      search: search || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    });
  }

  function resetFilters() {
    router.replace("/equipment", { scroll: false });
    setFormKey((k) => k + 1); // remount the form so its inputs clear
  }

  function goToPage(page: number) {
    update({ page: page > 1 ? String(page) : undefined }, false);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function retry() {
    setResult(null);
    setAttempt((a) => a + 1);
  }

  const pagination = result?.pagination;
  const from = pagination && pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return (
    <div ref={topRef} className="scroll-mt-24">
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <form
          key={formKey}
          onSubmit={handleSearch}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end"
        >
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              name="search"
              placeholder="Name, location or category"
              defaultValue={get("search")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minPrice">Min price ($)</Label>
            <Input id="minPrice" name="minPrice" type="number" min="0" defaultValue={get("minPrice")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPrice">Max price ($)</Label>
            <Input id="maxPrice" name="maxPrice" type="number" min="0" defaultValue={get("maxPrice")} />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className={selectClass}
              value={get("category")}
              onChange={(e) => update({ category: e.target.value || undefined })}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rentalType">Rental type</Label>
            <select
              id="rentalType"
              className={selectClass}
              value={get("rentalType")}
              onChange={(e) => update({ rentalType: e.target.value || undefined })}
            >
              <option value="">Any</option>
              {RENTAL_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <select
              id="availability"
              className={selectClass}
              value={get("availability")}
              onChange={(e) => update({ availability: e.target.value || undefined })}
            >
              <option value="">Any</option>
              <option value="available">Available now</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort">Sort by</Label>
            <select
              id="sort"
              className={selectClass}
              value={get("sort") || "newest"}
              onChange={(e) => update({ sort: e.target.value === "newest" ? undefined : e.target.value })}
            >
              <option value="newest">Recently added</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 flex min-h-8 flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {!loading && pagination && pagination.total > 0
            ? `Showing ${from}-${to} of ${pagination.total} items`
            : "\u00A0"}
        </p>
        {hasFilters && (
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {loading && (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {!loading && result?.error && (
        <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <p>Could not load equipment: {result.error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={retry}>
            Try again
          </Button>
        </div>
      )}

      {!loading && !result?.error && result?.items.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed p-12 text-center">
          <p className="font-medium">No equipment matches your search.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try different keywords or remove some filters.</p>
          {hasFilters && (
            <Button className="mt-4" onClick={resetFilters}>
              Clear filters
            </Button>
          )}
        </div>
      )}

      {!loading && !result?.error && result && result.items.length > 0 && (
        <>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((item) => (
              <EquipmentCard key={item._id} item={item} />
            ))}
          </div>
          {pagination && (
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={goToPage} />
          )}
        </>
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          size="sm"
          aria-current={p === page ? "page" : undefined}
          onClick={() => onChange(p)}
        >
          {p}
        </Button>
      ))}
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </nav>
  );
}