"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary used when the root layout itself fails. It replaces the
 * layout, so it must render its own <html> and <body> and cannot rely on the
 * app's Tailwind stylesheet having loaded.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111827",
          color: "#f9fafb",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          padding: "24px",
        }}
      >
        <main style={{ maxWidth: 560, textAlign: "center" }}>
          <p style={{ color: "#fb923c", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 12 }}>
            RentNeo
          </p>
          <h1 style={{ fontSize: 30, margin: "12px 0 8px" }}>Something went wrong</h1>
          <p style={{ color: "#9ca3af", lineHeight: 1.6 }}>
            The application could not start. Please reload the page. If the problem
            continues, try again in a few minutes.
          </p>
          {error.digest && (
            <p style={{ color: "#6b7280", fontSize: 12 }}>Reference: {error.digest}</p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 20,
              padding: "10px 18px",
              borderRadius: 8,
              border: 0,
              cursor: "pointer",
              background: "#f97316",
              color: "#111827",
              fontWeight: 600,
            }}
          >
            Reload application
          </button>
        </main>
      </body>
    </html>
  );
}
