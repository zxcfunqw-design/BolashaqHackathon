import { ArrowRight, BriefcaseBusiness, ClipboardCheck, MapPinned, Route, Trophy } from "lucide-react";
import type { MainTab, UserPath } from "../types";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

type DashboardScreenProps = {
  path: UserPath;
  onNavigate: (tab: MainTab) => void;
};

const dashboardItems = [
  { title: "My Graph", subtitle: "7 connected steps", tab: "path" as MainTab, icon: Route, tone: "green" },
  { title: "Next Step", subtitle: "Finish Python lesson 3", tab: "plan" as MainTab, icon: ClipboardCheck, tone: "blue" },
  { title: "90-Day Plan", subtitle: "22% complete", tab: "plan" as MainTab, icon: MapPinned, tone: "green" },
  { title: "3 Matching Opportunities", subtitle: "Low internet options", tab: "opportunities" as MainTab, icon: Trophy, tone: "yellow" },
  { title: "Portfolio Draft", subtitle: "Ready to generate", tab: "portfolio" as MainTab, icon: BriefcaseBusiness, tone: "blue" }
] as const;

export function DashboardScreen({ path, onNavigate }: DashboardScreenProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-qadam-primary p-5 text-white shadow-soft">
        <Badge tone="yellow">Offline-ready: your path is saved</Badge>
        <h2 className="mt-4 text-3xl font-black">Сәлем!</h2>
        <p className="mt-2 text-base font-semibold text-white/90">Your path: {path.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {path.skills.map((skill) => (
            <span key={skill} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              {skill}
            </span>
          ))}
        </div>
      </section>

      <div className="grid gap-3">
        {dashboardItems.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title} onClick={() => onNavigate(item.tab)}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-qadam-primary">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="text-sm text-qadam-muted">{item.subtitle}</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-qadam-muted" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
