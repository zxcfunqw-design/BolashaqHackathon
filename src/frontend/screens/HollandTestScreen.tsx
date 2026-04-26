import { ArrowLeft, ArrowRight, BrainCircuit, Check, SkipForward } from "lucide-react";
import { useMemo, useState } from "react";
import {
  calculateHollandResult,
  hollandTest,
  hollandTypeDescriptions,
  hollandTypeLabels,
  hollandTypes
} from "../data/holland";
import type { HollandResult } from "../types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";

type HollandTestScreenProps = {
  initialResult?: HollandResult | null;
  onComplete: (result: HollandResult) => void;
  onSkip: () => void;
};

export function HollandTestScreen({
  initialResult,
  onComplete,
  onSkip
}: HollandTestScreenProps) {
  const initialAnswers = useMemo(() => {
    if (!initialResult) return {};

    return Object.fromEntries(
      Object.entries(initialResult.answers).map(([questionId, score]) => [Number(questionId), score])
    );
  }, [initialResult]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>(initialAnswers);
  const question = hollandTest.questions[step];
  const selectedScore = answers[question.id];
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / hollandTest.questions.length) * 100);
  const previewResult = useMemo(() => calculateHollandResult(answers), [answers]);

  const choose = (score: number) => {
    setAnswers((current) => ({ ...current, [question.id]: score }));
  };

  const next = () => {
    if (step === hollandTest.questions.length - 1) {
      onComplete(calculateHollandResult(answers));
      return;
    }

    setStep((current) => current + 1);
  };

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-qadam-primary">Optional personalization</p>
            <h2 className="mt-1 text-2xl font-black">Holland RIASEC test</h2>
          </div>
          <Badge tone="blue">
            <BrainCircuit size={14} />
            Agent context
          </Badge>
        </div>
        <p className="text-sm leading-6 text-qadam-muted">
          {hollandTest.test_info.description} The result becomes a preference signal for the AI agent.
        </p>
        <ProgressBar value={progress} label={`${answeredCount}/${hollandTest.questions.length}`} />
      </section>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <Badge tone="green">
            Question {step + 1} of {hollandTest.questions.length}
          </Badge>
          <Badge tone="gray">{hollandTypeLabels[question.type]}</Badge>
        </div>
        <h3 className="mt-4 text-xl font-black leading-7">{question.text}</h3>
        <div className="mt-5 grid gap-2">
          {question.options.map((option) => (
            <button
              key={`${question.id}-${option.score}`}
              className={`min-h-12 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                selectedScore === option.score
                  ? "border-qadam-primary bg-qadam-primary text-white"
                  : "border-qadam-border bg-qadam-card text-qadam-graphite hover:border-qadam-primary/50"
              }`}
              onClick={() => choose(option.score)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <Badge tone="yellow">{previewResult.code || "RIASEC"}</Badge>
            <h3 className="mt-3 text-base font-black">Live profile</h3>
          </div>
          <Check className="text-qadam-primary" size={20} />
        </div>
        <div className="mt-4 grid gap-2">
          {hollandTypes.map((type) => (
            <div key={type} className="rounded-2xl bg-qadam-bg px-3 py-2">
              <div className="flex items-center justify-between gap-3 text-sm font-bold">
                <span>{hollandTypeLabels[type]}</span>
                <span className="text-qadam-primary">{previewResult.scores[type]}</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-qadam-muted">
                {hollandTypeDescriptions[type]}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-[0.8fr_1.2fr] gap-2">
        <Button
          variant="secondary"
          disabled={step === 0}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <ArrowLeft size={17} />
            Back
          </span>
        </Button>
        <Button disabled={selectedScore === undefined} onClick={next}>
          <span className="inline-flex items-center justify-center gap-2">
            {step === hollandTest.questions.length - 1 ? "Save profile" : "Next"}
            <ArrowRight size={17} />
          </span>
        </Button>
      </div>

      <Button variant="secondary" fullWidth onClick={onSkip}>
        <span className="inline-flex items-center justify-center gap-2">
          <SkipForward size={17} />
          Skip Holland test
        </span>
      </Button>
    </div>
  );
}
