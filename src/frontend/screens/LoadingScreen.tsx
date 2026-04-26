import { CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";

const steps = [
  "Building your personal graph...",
  "Matching your goals with skills...",
  "Creating your first action steps...",
  "Preparing your portfolio route..."
];

export function LoadingScreen() {
  return (
    <div className="flex min-h-[calc(100vh-112px)] items-center">
      <Card className="w-full text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-qadam-primary/10 text-qadam-primary">
          <Loader2 className="animate-spin" size={30} />
        </div>
        <h2 className="mt-5 text-2xl font-black">Building your personal graph...</h2>
        <p className="mt-2 text-sm leading-6 text-qadam-muted">
          QadamGraph is using your profile, goals and diagnostic answers to prepare a practical path.
        </p>
        <div className="mt-6">
          <ProgressBar value={78} />
        </div>
        <ul className="mt-6 space-y-3 text-left">
          {steps.map((step) => (
            <li key={step} className="flex items-center gap-3 text-sm font-semibold text-qadam-graphite">
              <CheckCircle2 size={19} className="text-qadam-primary" />
              {step}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
