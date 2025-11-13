import React from "react";

export function Logo() {
  return (
    <div className="w-10 h-10 flex items-center" aria-hidden>
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect width="24" height="24" rx="6" fill="var(--color-cerrado-gold)" />
        <path d="M6 12h12" stroke="var(--color-cerrado-dark-brown)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 8h12" stroke="var(--color-cerrado-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function TR3VOSLogo({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden>
      <span className="text-[var(--color-cerrado-gold)]">Re</span>
      <span className="text-[var(--color-cerrado-green)]">Co</span>
      <span className="ml-2 text-sm text-[var(--color-cerrado-brown)]">TR3VOS</span>
    </span>
  );
}
