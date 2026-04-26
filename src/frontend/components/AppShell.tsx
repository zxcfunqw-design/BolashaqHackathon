import { MoonStar, SunMedium } from "lucide-react";
import type { PropsWithChildren } from "react";
import type { MainTab } from "../types";
import { BottomNav } from "./BottomNav";
import { OfflineBadge } from "./OfflineBadge";

type ThemeMode = "light" | "dark";

type AppShellProps = PropsWithChildren<{
  online: boolean;
  activeTab?: MainTab;
  onTabChange?: (tab: MainTab) => void;
  accountName?: string;
  onAccountSwitch?: () => void;
  onThemeToggle: () => void;
  themeMode: ThemeMode;
  title?: string;
  showNav?: boolean;
}>;

export function AppShell({
  children,
  online,
  activeTab,
  onTabChange,
  accountName,
  onAccountSwitch,
  onThemeToggle,
  themeMode,
  title = "QadamGraph",
  showNav = false
}: AppShellProps) {
  const themeLabel = themeMode === "dark" ? "Light" : "Dark";

  return (
    <div className="min-h-screen bg-qadam-bg text-qadam-graphite">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col border-x border-qadam-border/70 bg-qadam-bg">
        <header className="sticky top-0 z-20 border-b border-qadam-border/70 bg-qadam-bg/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-qadam-primary">
                Rural-tech PWA
              </p>
              <h1 className="text-lg font-bold">{title}</h1>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <OfflineBadge online={online} />
              <div className="flex items-center gap-2">
                <button
                  aria-label={themeMode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                  className="inline-flex min-h-8 items-center gap-2 rounded-full border border-qadam-border bg-qadam-card px-3 text-xs font-bold text-qadam-primary"
                  onClick={onThemeToggle}
                  type="button"
                >
                  {themeMode === "dark" ? <SunMedium size={14} /> : <MoonStar size={14} />}
                  {themeLabel}
                </button>
                {accountName && onAccountSwitch ? (
                  <button
                    className="min-h-8 rounded-full border border-qadam-border bg-qadam-card px-3 text-xs font-bold text-qadam-primary"
                    onClick={onAccountSwitch}
                    type="button"
                  >
                    Account
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          {!online ? (
            <p className="mt-2 text-xs font-medium text-qadam-muted">
              You are offline, but your path stays saved on this device.
            </p>
          ) : null}
        </header>

        <main className={`flex-1 px-4 py-4 ${showNav ? "pb-24" : "pb-6"}`}>{children}</main>

        {showNav && activeTab && onTabChange ? (
          <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
        ) : null}
      </div>
    </div>
  );
}
