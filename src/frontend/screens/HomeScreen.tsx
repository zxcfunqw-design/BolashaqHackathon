import {
  BrainCircuit,
  BriefcaseBusiness,
  Calculator,
  ChevronRight,
  ClipboardCheck,
  Route,
  Sparkles
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { formatKztCompact } from "../lib/financialCalculator";
import type {
  DesiredPath,
  MainTab,
  PersonalizedGraph,
  PortfolioGenerationContext,
  UserAccount,
  UserPath
} from "../types";

type HomeScreenProps = {
  desiredPath?: DesiredPath | null;
  path: UserPath;
  personalizedGraph?: PersonalizedGraph;
  portfolioContext?: PortfolioGenerationContext;
  readyMessage?: string;
  user: UserAccount;
  onNavigate: (tab: MainTab) => void;
  onRetakeDiagnostic: () => void;
};

export function HomeScreen({
  desiredPath,
  path,
  personalizedGraph,
  portfolioContext,
  readyMessage,
  user,
  onNavigate,
  onRetakeDiagnostic
}: HomeScreenProps) {
  const quizCount = Object.keys(user.data.quizAnswers).length;
  const selectedGoals = user.data.selectedGoals.length;
  const portfolioState = user.data.portfolio.generated ? "Generated" : "Draft";
  const target = desiredPath?.targetTitle ?? path.opportunity;
  const basedOn = personalizedGraph?.basedOn;

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-qadam-primary p-5 text-white shadow-soft">
        <Badge tone="yellow">Главная</Badge>
        <h2 className="mt-4 text-3xl font-black leading-tight">Твой маршрут к вузу</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-white/85">
          {user.name}, {user.grade}, {user.region}
        </p>
        {readyMessage ? (
          <p className="mt-3 rounded-2xl bg-white/15 px-3 py-2 text-sm font-bold text-white">
            {readyMessage}
          </p>
        ) : null}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatusValue label="Goals" value={String(selectedGoals)} />
          <StatusValue label="Test" value={quizCount ? `${quizCount}/5` : "0/5"} />
          <StatusValue label="Portfolio" value={portfolioState} />
        </div>
      </section>

      {basedOn ? (
        <Card>
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-qadam-primary">
              <Route size={21} />
            </div>
            <div className="min-w-0">
              <h3 className="font-black">Your graph was created based on:</h3>
              <p className="mt-1 text-sm leading-6 text-qadam-muted">
                Grade {basedOn.grade || "not provided"}, {basedOn.region || "region not provided"}; goals:{" "}
                {basedOn.selectedGoals.length ? basedOn.selectedGoals.join(", ") : "not provided"}; quiz:{" "}
                {Object.values(basedOn.quizAnswers).join(", ") || "not provided"}.
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-qadam-primary">
              <Route size={18} />
              Current path
            </div>
            <h3 className="mt-3 text-xl font-black">{path.summary}</h3>
            <p className="mt-2 text-sm leading-6 text-qadam-muted">{target}</p>
          </div>
          <ChevronRight className="mt-1 shrink-0 text-qadam-muted" size={20} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {path.skills.slice(0, 4).map((skill) => (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-qadam-primary" key={skill}>
              {skill}
            </span>
          ))}
        </div>
        <Button className="mt-4" fullWidth onClick={() => onNavigate("path")}>
          Open graph
        </Button>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <Calculator className="text-yellow-700" size={20} />
          <p className="mt-3 text-xs font-black uppercase text-qadam-muted">Budget</p>
          <p className="mt-1 text-lg font-black text-qadam-graphite">
            {desiredPath ? formatKztCompact(desiredPath.totalCostKzt) : "Choose path"}
          </p>
        </Card>
        <Card>
          <BriefcaseBusiness className="text-qadam-primary" size={20} />
          <p className="mt-3 text-xs font-black uppercase text-qadam-muted">Portfolio</p>
          <p className="mt-1 text-lg font-black text-qadam-graphite">{portfolioState}</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700">
            <BrainCircuit size={21} />
          </div>
          <div className="min-w-0">
            <h3 className="font-black">AI-ready context</h3>
            <p className="mt-1 text-sm leading-6 text-qadam-muted">
              {describePortfolioContext(portfolioContext)}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onRetakeDiagnostic}>
            <span className="inline-flex items-center justify-center gap-2">
              <ClipboardCheck size={16} />
              Test
            </span>
          </Button>
          <Button onClick={() => onNavigate("portfolio")}>
            <span className="inline-flex items-center justify-center gap-2">
              <Sparkles size={16} />
              Portfolio
            </span>
          </Button>
        </div>
      </Card>
    </div>
  );
}

function StatusValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/12 px-3 py-2">
      <p className="text-[11px] font-bold uppercase text-white/65">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function describePortfolioContext(context?: PortfolioGenerationContext) {
  if (!context) return "Registration data will be added after login.";

  const parts = [
    context.account ? `${context.account.name}, ${context.account.grade}, ${context.account.region}` : "",
    context.selectedGoals?.length ? `goals: ${context.selectedGoals.join(", ")}` : "goals: pending",
    context.quizAnswers && Object.keys(context.quizAnswers).length
      ? `diagnostic: ${Object.values(context.quizAnswers).join(", ")}`
      : "diagnostic: pending",
    context.careerTest?.resultTitle
      ? `career test: ${context.careerTest.resultTitle}`
      : context.hollandResult
        ? `Holland ${context.hollandResult.code}: ${context.hollandResult.topTypes.join(", ")}`
        : "career test: ready",
    context.desiredPath?.targetTitle ? `target: ${context.desiredPath.targetTitle}` : ""
  ].filter(Boolean);

  return parts.join(" · ");
}
