import { BookOpen, BriefcaseBusiness, Cpu, GraduationCap, Lightbulb, Sparkles, Target } from "lucide-react";
import type { PathNodeData } from "../types";
import { Card } from "./ui/Card";

const toneStyles: Record<PathNodeData["tone"], string> = {
  start: "bg-slate-50 text-slate-700 dark:bg-slate-400/15 dark:text-slate-100",
  interest: "bg-emerald-50 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-100",
  direction: "bg-blue-50 text-blue-800 dark:bg-blue-400/15 dark:text-blue-100",
  skill: "bg-indigo-50 text-indigo-800 dark:bg-indigo-400/15 dark:text-indigo-100",
  project: "bg-amber-50 text-amber-800 dark:bg-amber-300/15 dark:text-amber-100",
  opportunity: "bg-yellow-50 text-yellow-800 dark:bg-yellow-300/15 dark:text-yellow-100",
  portfolio: "bg-teal-50 text-teal-800 dark:bg-teal-400/15 dark:text-teal-100"
};

const toneIcons = {
  start: GraduationCap,
  interest: Lightbulb,
  direction: Target,
  skill: BookOpen,
  project: Cpu,
  opportunity: Sparkles,
  portfolio: BriefcaseBusiness
};

type PathNodeProps = {
  node: PathNodeData;
  isLast?: boolean;
};

export function PathNode({ node, isLast = false }: PathNodeProps) {
  const Icon = toneIcons[node.tone];

  return (
    <div className="relative pl-10">
      <div className="absolute left-3 top-1 flex flex-col items-center">
        <div className={`grid h-9 w-9 place-items-center rounded-full ${toneStyles[node.tone]}`}>
          <Icon size={18} />
        </div>
        {!isLast ? <div className="h-16 w-px bg-qadam-border" /> : null}
      </div>
      <Card className="mb-4">
        <h3 className="text-base font-bold">{node.title}</h3>
        <p className="mt-1 text-sm leading-6 text-qadam-muted">{node.description}</p>
      </Card>
    </div>
  );
}
