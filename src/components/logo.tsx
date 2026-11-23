import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <polygon
        points="32,6 54.5,19 54.5,45 32,58 9.5,45 9.5,19"
        fill="#f97316"
        stroke="#f97316"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <polygon
        points="32,12.5 49,22.3 49,41.7 32,51.5 15,41.7 15,22.3"
        fill="none"
        stroke="#fff"
        strokeOpacity=".22"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <g
        transform="translate(-1.9 0)"
        fill="none"
        stroke="#0b1220"
        strokeWidth="5.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M25.5 43.5V20.5H35.2a7 7 0 0 1 0 14H25.5" />
        <path d="M34.2 34.5 41.2 43.5" />
      </g>
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 ${className}`}
      aria-label={`${SITE_NAME} home`}
    >
      <LogoMark />
      <span className="text-xl font-extrabold tracking-tight">
        Rent<span className="text-primary">Neo</span>
      </span>
    </Link>
  );
}