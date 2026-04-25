import { CheckCircle2, Circle } from "lucide-react";
import type { PlanSection } from "../types";
import { Card } from "./ui/Card";

type PlanChecklistProps = {
  section: PlanSection;
};

export function PlanChecklist({ section }: PlanChecklistProps) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold">{section.title}</h3>
          <p className="text-sm text-qadam-muted">{section.focus}</p>
        </div>
        <span className="rounded-full bg-qadam-primary/10 px-3 py-1 text-xs font-bold text-qadam-primary">
          {section.items.filter((item) => item.done).length}/{section.items.length}
        </span>
      </div>

      <ul className="mt-4 space-y-3">
        {section.items.map((item) => (
          <li key={item.id} className="flex gap-3 text-sm leading-6">
            {item.done ? (
              <CheckCircle2 className="mt-0.5 shrink-0 text-qadam-primary" size={20} />
            ) : (
              <Circle className="mt-0.5 shrink-0 text-slate-300" size={20} />
            )}
            <span className={item.done ? "font-medium text-qadam-graphite" : "text-qadam-muted"}>
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
