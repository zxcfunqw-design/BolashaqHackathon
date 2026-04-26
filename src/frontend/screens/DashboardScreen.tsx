import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  ClipboardCheck,
  MapPinned,
  Route,
  Trophy
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { formatKztCompact } from "../lib/financialCalculator";
import type { DesiredPath, HollandResult, MainTab, PersonalizedGraph, UserPath } from "../types";

type DashboardScreenProps = {
  desiredPath?: DesiredPath | null;
  path: UserPath;
  hollandResult?: HollandResult | null;
  personalizedGraph?: PersonalizedGraph;
  readyMessage?: string;
  onNavigate: (tab: MainTab) => void;
};

const dashboardItems = [
  { title: "My Graph", subtitle: "Personal path graph", tab: "path" as MainTab, icon: Route },
  { title: "Next Step", subtitle: "Open an action node", tab: "plan" as MainTab, icon: ClipboardCheck },
  { title: "90-Day Plan", subtitle: "Portfolio proof roadmap", tab: "plan" as MainTab, icon: MapPinned },
  { title: "Matching Opportunities", subtitle: "Saved low-internet options", tab: "opportunities" as MainTab, icon: Trophy },
  { title: "Portfolio Draft", subtitle: "Ready to improve", tab: "portfolio" as MainTab, icon: BriefcaseBusiness }
] as const;

export function DashboardScreen({
  desiredPath,
  path,
  hollandResult,
  personalizedGraph,
  readyMessage,
  onNavigate
}: DashboardScreenProps) {
  const topHollandTypes = hollandResult?.topTypes.join(" + ");
  const basedOn = personalizedGraph?.basedOn;

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-qadam-primary p-5 text-qadam-primaryContrast shadow-soft">
        <Badge tone="yellow">Offline-ready: your path is saved</Badge>
        <h2 className="mt-4 text-3xl font-black">Hello!</h2>
        {readyMessage ? (
          <p className="mt-3 rounded-2xl bg-qadam-primaryContrast/15 px-3 py-2 text-sm font-bold text-qadam-primaryContrast">
            {readyMessage}
          </p>
        ) : null}
        <p className="mt-2 text-base font-semibold text-qadam-primaryContrast/90">Your path: {path.summary}</p>
        {desiredPath ? (
          <p className="mt-2 text-sm font-semibold text-qadam-primaryContrast/80">
            Desired: {desiredPath.targetTitle} - {formatKztCompact(desiredPath.totalCostKzt)}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {path.skills.map((skill) => (
            <span key={skill} className="rounded-full bg-qadam-primaryContrast/15 px-3 py-1 text-xs font-semibold">
              {skill}
            </span>
          ))}
        </div>
      </section>

      {basedOn ? (
        <Card>
          <Badge tone="blue">Personalized graph</Badge>
          <h3 className="mt-3 text-lg font-black">Your graph was created based on:</h3>
          <dl className="mt-3 grid gap-2 text-sm">
            <DashboardFact label="Grade" value={basedOn.grade || "Not provided"} />
            <DashboardFact label="Region" value={basedOn.region || "Not provided"} />
            <DashboardFact
              label="Selected goals"
              value={basedOn.selectedGoals.length ? basedOn.selectedGoals.join(", ") : "Not provided"}
            />
            <DashboardFact
              label="Quiz answers"
              value={
                Object.entries(basedOn.quizAnswers)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join("; ") || "Not provided"
              }
            />
          </dl>
        </Card>
      ) : null}

      <div className="grid gap-3">
        {hollandResult ? (
          <Card>
            <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-400/15 dark:text-blue-100">
                <BrainCircuit size={22} />
              </div>
              <div>
                <h3 className="font-bold">AI Agent Profile</h3>
                <p className="text-sm text-qadam-muted">
                  Holland {hollandResult.code}: {topHollandTypes}
                </p>
              </div>
            </div>
          </Card>
        ) : null}

        {dashboardItems.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title} onClick={() => onNavigate(item.tab)}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-qadam-primary dark:bg-emerald-400/15 dark:text-emerald-100">
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

function DashboardFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-qadam-bg px-3 py-2">
      <dt className="text-xs font-black uppercase text-qadam-primary">{label}</dt>
      <dd className="mt-1 font-semibold leading-6 text-qadam-graphite">{value}</dd>
    </div>
  );
}
