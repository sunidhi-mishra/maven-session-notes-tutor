import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

export function Locked() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <Lock className="h-8 w-8 text-muted-foreground" />
      <h2 className="mt-3 text-lg font-bold">Upload a session transcript first</h2>
      <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
        Go to Ask Maven and upload your .txt transcript to unlock this feature.
      </p>
      <Link
        to="/maven"
        className="mt-5 flex h-11 items-center rounded-lg border border-primary px-4 text-sm font-medium text-primary hover:bg-brand-soft"
      >
        → Go to Ask Maven
      </Link>
    </div>
  );
}
