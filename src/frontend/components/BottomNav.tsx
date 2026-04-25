import { BriefcaseBusiness, Home, Map, Route, Trophy } from "lucide-react";
import type { MainTab, NavItem } from "../types";

const items: NavItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "path", label: "My Path", icon: Route },
  { id: "plan", label: "Plan", icon: Map },
  { id: "opportunities", label: "Opportunities", icon: Trophy },
  { id: "portfolio", label: "Portfolio", icon: BriefcaseBusiness }
];

type BottomNavProps = {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
};

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t border-qadam-border bg-white/95 px-2 py-2 shadow-[0_-10px_24px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              data-testid={`nav-${item.id}`}
              className={`flex min-h-14 flex-col items-center justify-center rounded-2xl px-1 text-[11px] font-semibold transition ${
                active ? "bg-qadam-primary text-white" : "text-qadam-muted hover:bg-emerald-50"
              }`}
              onClick={() => onTabChange(item.id)}
              type="button"
            >
              <Icon size={19} strokeWidth={2.2} />
              <span className="mt-1 leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
