import type { PropsWithChildren } from "react";
import type { MainTab } from "../types";
import { BottomNav } from "./BottomNav";
import { OfflineBadge } from "./OfflineBadge";

type AppShellProps = PropsWithChildren<{
  online: boolean;
  activeTab?: MainTab;
  onTabChange?: (tab: MainTab) => void;
  title?: string;
  showNav?: boolean;
}>;

export function AppShell({
  children,
  online,
  activeTab,
  onTabChange,
  title = "QadamGraph",
  showNav = false
}: AppShellProps) {
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
            <OfflineBadge online={online} />
          </div>
          {!online ? (
            <p className="mt-2 text-xs font-medium text-qadam-muted">
              Интернет жоқ, бірақ жолың сақталған
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
