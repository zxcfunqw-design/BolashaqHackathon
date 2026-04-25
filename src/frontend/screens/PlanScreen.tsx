import { planSections } from "../data/path";
import { PlanChecklist } from "../components/PlanChecklist";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";

export function PlanScreen() {
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-white to-emerald-50">
        <p className="text-sm font-bold text-qadam-primary">90-day plan</p>
        <h2 className="mt-2 text-2xl font-black">Build one real proof</h2>
        <p className="mt-2 text-sm leading-6 text-qadam-muted">
          Small weekly actions that work from a phone and weak internet.
        </p>
        <div className="mt-5">
          <ProgressBar value={22} label="Overall progress" />
        </div>
      </Card>

      {planSections.map((section) => (
        <PlanChecklist key={section.title} section={section} />
      ))}
    </div>
  );
}
