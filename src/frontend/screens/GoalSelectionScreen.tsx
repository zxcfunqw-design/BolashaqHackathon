import { ArrowRight, BriefcaseBusiness, Code2, GraduationCap, Lightbulb, Trophy } from "lucide-react";
import { goalOptions } from "../data/path";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const icons = [BriefcaseBusiness, Trophy, GraduationCap, Code2, Lightbulb];

type GoalSelectionScreenProps = {
  selectedGoals: string[];
  onToggleGoal: (id: string) => void;
  onContinue: () => void;
};

export function GoalSelectionScreen({
  selectedGoals,
  onToggleGoal,
  onContinue
}: GoalSelectionScreenProps) {
  return (
    <div className="space-y-5">
      <section>
        <p className="text-sm font-bold text-qadam-primary">Step 1</p>
        <h2 className="mt-2 text-2xl font-black">What do you want to do?</h2>
        <p className="mt-2 text-sm leading-6 text-qadam-muted">
          Pick one or more goals. The demo path will use these choices to shape the first route.
        </p>
      </section>

      <div className="space-y-3">
        {goalOptions.map((goal, index) => {
          const Icon = icons[index] ?? Lightbulb;
          const selected = selectedGoals.includes(goal.id);

          return (
            <Card
              key={goal.id}
              selected={selected}
              onClick={() => onToggleGoal(goal.id)}
              data-testid={`goal-${goal.id}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                    selected
                      ? "bg-qadam-primary text-qadam-primaryContrast"
                      : "bg-emerald-50 text-qadam-primary dark:bg-emerald-400/15 dark:text-emerald-100"
                  }`}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-bold leading-5">{goal.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-qadam-muted">{goal.subtitle}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Button
        fullWidth
        disabled={selectedGoals.length === 0}
        onClick={onContinue}
        data-testid="goals-continue"
      >
        <span className="inline-flex items-center justify-center gap-2">
          Continue to diagnostic
          <ArrowRight size={17} />
        </span>
      </Button>
    </div>
  );
}
