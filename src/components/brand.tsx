import { Sparkles } from "lucide-react";

export function AyudaLogo({ light = false, small = false }: { light?: boolean; small?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <svg viewBox="0 0 32 24" className={small ? "h-4 w-5" : "h-6 w-8"} aria-hidden>
        <path
          d="M4 18c3-8 8-12 12-12-2 4-6 9-12 12zm8 2c4-7 9-11 16-12-3 5-9 10-16 12zM2 10c4-1 7 0 9 3-4 1-7 0-9-3z"
          className="fill-primary"
        />
      </svg>
      <span
        className={`font-bold tracking-tight ${small ? "text-base" : "text-2xl"} ${light ? "text-navy-foreground" : "text-primary"}`}
      >
        ayuda
      </span>
    </div>
  );
}

export function UnlimitedPill() {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
      <Sparkles className="h-3.5 w-3.5" /> Unlimited Access
    </div>
  );
}

export function UserBlock({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-avatar text-sm font-semibold text-primary-foreground">
        S
      </div>
      <div className="min-w-0">
        <div className={`truncate text-[13px] font-semibold ${dark ? "text-navy-foreground" : "text-foreground"}`}>
          Sunidhi Mishra
        </div>
        <div className={`truncate text-xs ${dark ? "text-navy-muted" : "text-muted-foreground"}`}>
          msunidhi03@gmail.com
        </div>
      </div>
    </div>
  );
}
