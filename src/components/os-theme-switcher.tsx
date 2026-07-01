import { useOS, useMode } from "@/lib/os-theme";
import { Moon, Lightbulb } from "lucide-react";

function AppleLogo({ className = "" }: { className?: string }) {
  
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.42 2.23-1.18 3.04-.76.84-1.99 1.47-3.01 1.39-.13-1.12.42-2.27 1.14-3.05.79-.84 2.13-1.46 3.05-1.38zM20.5 17.45c-.55 1.27-.81 1.84-1.51 2.96-.98 1.55-2.36 3.48-4.07 3.49-1.52.01-1.92-.99-3.99-.98-2.07.01-2.51 1-4.03.98-1.71-.02-3.02-1.76-4-3.31C.18 16.42-.1 11.27 1.49 8.55c1.13-1.94 2.92-3.07 4.6-3.07 1.71 0 2.79.94 4.21.94 1.38 0 2.22-.94 4.2-.94 1.5 0 3.09.82 4.22 2.23-3.71 2.04-3.11 7.34 1.78 9.74z" />
    </svg>
  );
}

function ClassicWinFlag({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g transform="skewY(-8)">
        <rect x="2" y="6"  width="9" height="6" fill="#e81123" />
        <rect x="12" y="6"  width="9" height="6" fill="#7eb900" />
        <rect x="2" y="13" width="9" height="6" fill="#00a4ef" />
        <rect x="12" y="13" width="9" height="6" fill="#ffb900" />
      </g>
    </svg>
  );
}

export function OsThemeSwitcher({ floating = true }: { floating?: boolean }) {
  const [os, setOs] = useOS();
  const [mode, setMode] = useMode();

  const nextOs = os === "windows" ? "mac" : "windows";
  const nextMode = mode === "dark" ? "light" : "dark";

  return (
    <div
      className={
        (floating
          ? "fixed top-3 right-3 z-[60] hidden lg:flex "
          : "inline-flex ") +
        "items-center gap-0.5 rounded-md border border-border bg-background/85 backdrop-blur p-0.5 shadow-lg"
      }
      aria-label="Theme selector"
    >
      <button
        type="button"
        title={nextOs === "mac" ? "Cambiar a Mac" : "Cambiar a Windows"}
        onClick={() => setOs(nextOs)}
        className="inline-flex items-center justify-center size-7 rounded transition hover:bg-foreground/10 text-foreground"
      >
        {nextOs === "mac"
          ? <AppleLogo className="size-4" />
          : <ClassicWinFlag className="size-4" />}
      </button>
      <button
        type="button"
        title={nextMode === "light" ? "Modo claro" : "Modo noche"}
        onClick={() => setMode(nextMode)}
        className="inline-flex items-center justify-center size-7 rounded transition hover:bg-foreground/10 text-foreground"
      >
        {nextMode === "light"
          ? <Lightbulb className="size-4" />
          : <Moon className="size-4" />}
      </button>
    </div>
  );
}