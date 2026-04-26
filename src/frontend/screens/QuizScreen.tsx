import { ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { quizQuestions } from "../data/path";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";

import type { QuizAnswers } from "../types";

type QuizScreenProps = {
  onComplete: (answers: QuizAnswers) => void;
  initialAnswers?: QuizAnswers;
};

export function QuizScreen({ onComplete, initialAnswers = {} }: QuizScreenProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(initialAnswers);
  const question = quizQuestions[step];
  const selected = answers[question.id];
  const totalQuestions = quizQuestions.length;
  const progress = useMemo(() => Math.round(((step + 1) / totalQuestions) * 100), [step, totalQuestions]);

  const choose = (answer: string) => {
    setAnswers((current) => ({ ...current, [question.id]: answer }));
  };

  const next = () => {
    if (step === quizQuestions.length - 1) {
      onComplete(answers);
      return;
    }

    setStep((current) => current + 1);
  };

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <div>
          <p className="text-sm font-bold text-qadam-primary">Qadam Start diagnostic</p>
          <h2 className="mt-1 text-2xl font-black">
            Question {step + 1} of {totalQuestions}
          </h2>
        </div>
        <ProgressBar value={progress} />
      </section>

      <Card>
        <h3 className="text-xl font-black leading-7">{question.question}</h3>
        <div className="mt-5 grid gap-2">
          {question.options.map((option) => (
            <button
              key={option}
              data-testid={`quiz-option-${step}-${question.options.indexOf(option)}`}
              className={`min-h-12 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                selected === option
                  ? "border-qadam-primary bg-qadam-primary text-qadam-primaryContrast"
                  : "border-qadam-border bg-qadam-card text-qadam-graphite hover:border-qadam-primary/50"
              }`}
              onClick={() => choose(option)}
              type="button"
            >
              {option}
            </button>
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
        <Button disabled={!selected} onClick={next} data-testid="quiz-next">
          <span className="inline-flex items-center justify-center gap-2">
            {step === quizQuestions.length - 1 ? "Build my path" : "Next"}
            <ArrowRight size={17} />
          </span>
        </Button>
      </div>
    </div>
  );
}
