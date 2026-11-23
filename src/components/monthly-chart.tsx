"use client";

import { motion } from "motion/react";
import { formatBDT } from "@/lib/format";
import type { MonthlyActivity } from "@/components/analytics";

type Metric = "bookings" | "revenue";

const WIDTH = 720;
const HEIGHT = 260;
const PAD = { top: 18, right: 18, bottom: 44, left: 64 };
const TICKS = 4;

function monthLabel(month: string): string {
  const date = new Date(`${month}-01T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return month;
  return date.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
}

function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 10_000) return `${Math.round(value / 1_000)}k`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(Math.round(value));
}

/**
 * Responsive SVG chart for the 12-month analytics buckets. Bookings use bars;
 * revenue uses a filled line so the two metrics are visually distinct.
 */
export function MonthlyChart({
  rows,
  metric,
  title,
  subtitle = "Last 12 months",
}: {
  rows: MonthlyActivity[];
  metric: Metric;
  title: string;
  subtitle?: string;
}) {
  if (rows.length === 0) {
    return (
      <figure className="rounded-xl border bg-card p-5">
        <figcaption className="text-sm font-semibold">{title}</figcaption>
        <p className="mt-6 text-center text-sm text-muted-foreground">No activity yet.</p>
      </figure>
    );
  }

  const values = rows.map((row) => row[metric]);
  const max = Math.max(1, ...values);
  const innerWidth = WIDTH - PAD.left - PAD.right;
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  const baseY = PAD.top + innerHeight;
  const slot = innerWidth / rows.length;
  const barWidth = Math.max(8, Math.min(28, slot * 0.55));

  const points = rows.map((row, index) => ({
    ...row,
    x: PAD.left + slot * index + slot / 2,
    y: baseY - (row[metric] / max) * innerHeight,
  }));

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${baseY} L ${points[0].x.toFixed(2)} ${baseY} Z`;
  const gradientId = `monthly-${metric}-area`;
  const ariaLabel = `${title} chart for the last ${rows.length} months`;

  return (
    <figure className="rounded-xl border bg-card p-4">
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </figcaption>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-64 w-full min-w-[540px]"
          role="img"
          aria-label={ariaLabel}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {Array.from({ length: TICKS + 1 }).map((_, index) => {
            const y = PAD.top + (innerHeight / TICKS) * index;
            const value = max - (max / TICKS) * index;
            return (
              <g key={index}>
                <line
                  x1={PAD.left}
                  x2={WIDTH - PAD.right}
                  y1={y}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray={index === TICKS ? undefined : "4 6"}
                />
                <text
                  x={PAD.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-muted-foreground text-[10px]"
                >
                  {metric === "revenue" ? `৳${compact(value)}` : compact(value)}
                </text>
              </g>
            );
          })}

          {metric === "bookings" ? (
            points.map((point, index) => {
              const height = Math.max(0, baseY - point.y);
              return (
                <motion.rect
                  key={point.month}
                  x={point.x - barWidth / 2}
                  y={point.y}
                  width={barWidth}
                  height={height}
                  rx={4}
                  fill="var(--primary)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.03, ease: "easeOut" }}
                >
                  <title>{`${monthLabel(point.month)}: ${point.bookings} booking${point.bookings === 1 ? "" : "s"}`}</title>
                </motion.rect>
              );
            })
          ) : (
            <>
              <motion.path
                d={areaPath}
                fill={`url(#${gradientId})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              <motion.path
                d={linePath}
                fill="none"
                stroke="var(--primary)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              {points.map((point) => (
                <circle
                  key={point.month}
                  cx={point.x}
                  cy={point.y}
                  r={3.5}
                  fill="var(--card)"
                  stroke="var(--primary)"
                  strokeWidth={2}
                >
                  <title>{`${monthLabel(point.month)}: ${formatBDT(point.revenue)}`}</title>
                </circle>
              ))}
            </>
          )}

          {points.map((point) => (
            <text
              key={point.month}
              x={point.x}
              y={HEIGHT - 16}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {monthLabel(point.month)}
            </text>
          ))}
        </svg>
      </div>
    </figure>
  );
}
