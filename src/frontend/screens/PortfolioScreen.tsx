import { AlertCircle, Check, Clipboard, Loader2, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { createPortfolioOutput, initialPortfolioFields } from "../lib/storage";
import { generatePortfolioDraft, type GeneratedPortfolioDraft } from "../lib/portfolioAi";
import type {
  DesiredPath,
  PortfolioDraft,
  PortfolioFields,
  PortfolioGenerationContext,
  PortfolioLanguage
} from "../types";

type PortfolioScreenProps = {
  context?: PortfolioGenerationContext;
  desiredPath?: DesiredPath | null;
  portfolio: PortfolioDraft;
  onPortfolioChange: (portfolio: PortfolioDraft) => void;
};

export function PortfolioScreen({
  context,
  desiredPath,
  portfolio,
  onPortfolioChange
}: PortfolioScreenProps) {
  const [fields, setFields] = useState<PortfolioFields>({
    ...initialPortfolioFields,
    ...portfolio.fields
  });
  const [draft, setDraft] = useState<GeneratedPortfolioDraft | null>(() =>
    portfolio.generated
      ? {
          text: portfolio.output,
          source: portfolio.source ?? "local",
          model: portfolio.model,
          warning: portfolio.warning,
          createdAt: portfolio.updatedAt
        }
      : null
  );
  const [status, setStatus] = useState<"idle" | "generating">("idle");
  const [copied, setCopied] = useState(false);

  const hasContent = useMemo(
    () =>
      [
        fields.studentName,
        fields.grade,
        fields.school,
        fields.careerGoal,
        fields.targetUniversity,
        fields.targetProgram,
        fields.academicStrengths,
        fields.did,
        fields.participated,
        fields.learned,
        fields.result,
        fields.activities,
        fields.awards,
        fields.communityImpact,
        fields.evidence,
        fields.nextStep
      ].some((value) => value.trim().length > 0),
    [fields]
  );

  const savePortfolio = (
    nextFields: PortfolioFields,
    nextDraft: GeneratedPortfolioDraft | null,
    generated: boolean
  ) => {
    onPortfolioChange({
      fields: nextFields,
      output: nextDraft?.text ?? createPortfolioOutput(nextFields),
      generated,
      updatedAt: new Date().toISOString(),
      source: nextDraft?.source,
      model: nextDraft?.model,
      warning: nextDraft?.warning
    });
  };

  const updateField = <K extends keyof PortfolioFields>(key: K, value: PortfolioFields[K]) => {
    const nextFields = { ...fields, [key]: value };
    setFields(nextFields);
    setDraft(null);
    setCopied(false);
    savePortfolio(nextFields, null, false);
  };

  const applyDesiredPath = () => {
    if (!desiredPath) return;

    const nextFields = {
      ...fields,
      targetUniversity: desiredPath.targetTitle,
      targetProgram: fields.targetProgram || "Best-fit undergraduate program",
      nextStep: `Prepare evidence for: ${desiredPath.pathTitles.join(" -> ")}`,
      evidence:
        fields.evidence ||
        "Selected path, project screenshots, certificates, teacher feedback and a short reflection"
    };

    setFields(nextFields);
    setDraft(null);
    setCopied(false);
    savePortfolio(nextFields, null, false);
  };

  const applyContext = () => {
    const nextFields = {
      ...fields,
      studentName: fields.studentName || context?.account?.name || "",
      grade: fields.grade || context?.account?.grade || "",
      school: fields.school || context?.account?.region || "",
      careerGoal:
        fields.careerGoal ||
        context?.careerTest?.resultTitle ||
        context?.path?.summary ||
        context?.quizAnswers?.interests ||
        "",
      targetUniversity: fields.targetUniversity || context?.desiredPath?.targetTitle || "",
      targetProgram: fields.targetProgram || context?.path?.summary || "",
      academicStrengths: fields.academicStrengths || context?.path?.skills?.join(", ") || "",
      nextStep:
        fields.nextStep ||
        (context?.desiredPath?.pathTitles?.length
          ? `Prepare evidence for: ${context.desiredPath.pathTitles.join(" -> ")}`
          : "")
    };

    setFields(nextFields);
    setDraft(null);
    setCopied(false);
    savePortfolio(nextFields, null, false);
  };

  const createDraft = async () => {
    setStatus("generating");
    setCopied(false);

    try {
      const nextDraft = await generatePortfolioDraft(fields, context);
      setDraft(nextDraft);
      savePortfolio(fields, nextDraft, true);
    } finally {
      setStatus("idle");
    }
  };

  const copyDraft = async () => {
    if (!draft) return;

    try {
      await navigator.clipboard.writeText(draft.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-4">
      <section>
        <p className="text-sm font-bold text-qadam-primary">Portfolio builder</p>
        <h2 className="mt-1 text-2xl font-black">AI portfolio draft</h2>
      </section>

      <Card>
        <div className="space-y-4">
          {context ? (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
              <p className="text-xs font-black uppercase text-blue-700">Portfolio context</p>
              <p className="mt-1 text-sm font-bold text-qadam-graphite">
                {context.account?.name || "Student"} · {context.account?.grade || "grade"} ·{" "}
                {context.account?.region || "region"}
              </p>
              <p className="mt-1 text-xs leading-5 text-qadam-muted">{describeContext(context)}</p>
              <Button className="mt-3 min-h-10 px-3 py-2" onClick={applyContext} variant="secondary">
                Use account and test data
              </Button>
            </div>
          ) : null}
          {desiredPath ? (
            <div className="rounded-2xl border border-qadam-primary/20 bg-emerald-50 p-3">
              <p className="text-xs font-black uppercase text-qadam-primary">Selected graph path</p>
              <p className="mt-1 text-sm font-bold text-qadam-graphite">{desiredPath.targetTitle}</p>
              <p className="mt-1 text-xs leading-5 text-qadam-muted">
                {desiredPath.pathTitles.join(" -> ")}
              </p>
              <Button className="mt-3 min-h-10 px-3 py-2" onClick={applyDesiredPath} variant="secondary">
                Use this path in portfolio
              </Button>
            </div>
          ) : null}
          <LanguageSwitch
            value={fields.language}
            onChange={(value) => updateField("language", value)}
          />
          <Field
            label="Student name"
            value={fields.studentName}
            multiline={false}
            onChange={(value) => updateField("studentName", value)}
          />
          <Field
            label="Grade"
            value={fields.grade}
            multiline={false}
            onChange={(value) => updateField("grade", value)}
          />
          <Field
            label="School or location"
            value={fields.school}
            multiline={false}
            onChange={(value) => updateField("school", value)}
          />
          <Field
            label="Career goal"
            value={fields.careerGoal}
            multiline={false}
            onChange={(value) => updateField("careerGoal", value)}
          />
          <Field
            label="Target university"
            value={fields.targetUniversity}
            multiline={false}
            onChange={(value) => updateField("targetUniversity", value)}
          />
          <Field
            label="Target program"
            value={fields.targetProgram}
            multiline={false}
            onChange={(value) => updateField("targetProgram", value)}
          />
          <Field
            label="Academic strengths"
            value={fields.academicStrengths}
            onChange={(value) => updateField("academicStrengths", value)}
          />
          <Field
            label="What did you do?"
            value={fields.did}
            onChange={(value) => updateField("did", value)}
          />
          <Field
            label="Where did you participate?"
            value={fields.participated}
            onChange={(value) => updateField("participated", value)}
          />
          <Field
            label="What did you learn?"
            value={fields.learned}
            onChange={(value) => updateField("learned", value)}
          />
          <Field
            label="What result did you get?"
            value={fields.result}
            onChange={(value) => updateField("result", value)}
          />
          <Field
            label="Activities and leadership"
            value={fields.activities}
            onChange={(value) => updateField("activities", value)}
          />
          <Field
            label="Awards or certificates"
            value={fields.awards}
            onChange={(value) => updateField("awards", value)}
          />
          <Field
            label="Community impact"
            value={fields.communityImpact}
            onChange={(value) => updateField("communityImpact", value)}
          />
          <Field
            label="Evidence to attach"
            value={fields.evidence}
            onChange={(value) => updateField("evidence", value)}
          />
          <Field
            label="Next step"
            value={fields.nextStep}
            onChange={(value) => updateField("nextStep", value)}
          />
        </div>

        <Button
          fullWidth
          className="mt-5"
          disabled={!hasContent || status === "generating"}
          onClick={createDraft}
        >
          <span className="inline-flex items-center justify-center gap-2">
            {status === "generating" ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <WandSparkles size={17} />
            )}
            {status === "generating" ? "Generating..." : "Generate with AI"}
          </span>
        </Button>
      </Card>

      {draft?.warning ? (
        <Card className="border-amber-200 bg-amber-50">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 shrink-0 text-amber-700" size={18} />
            <p className="text-sm leading-6 text-amber-900">{draft.warning}</p>
          </div>
        </Card>
      ) : null}

      {draft ? (
        <Card className="border-qadam-primary/20 bg-emerald-50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-qadam-primary">Generated draft</p>
              <p className="mt-1 text-xs font-semibold text-qadam-muted">
                {draft.source === "openai" ? `OpenAI / ${draft.model}` : "Local fallback"}
              </p>
            </div>
            <Button variant="secondary" className="min-h-10 px-3 py-2" onClick={copyDraft}>
              <span className="inline-flex items-center justify-center gap-2">
                {copied ? <Check size={16} /> : <Clipboard size={16} />}
                {copied ? "Copied" : "Copy"}
              </span>
            </Button>
          </div>
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-qadam-graphite">
            {draft.text}
          </p>
        </Card>
      ) : null}
    </div>
  );
}

function describeContext(context: PortfolioGenerationContext) {
  const parts = [
    context.selectedGoals?.length ? `Goals: ${context.selectedGoals.join(", ")}` : "",
    context.quizAnswers && Object.keys(context.quizAnswers).length
      ? `Diagnostic: ${Object.values(context.quizAnswers).join(", ")}`
      : "Diagnostic: pending",
    context.careerTest?.resultTitle ? `Career test: ${context.careerTest.resultTitle}` : "Career test: pending",
    context.path?.summary ? `Path: ${context.path.summary}` : "",
    context.desiredPath?.targetTitle ? `Target: ${context.desiredPath.targetTitle}` : ""
  ].filter(Boolean);

  return parts.join(" · ");
}

type FieldProps = {
  label: string;
  value: string;
  multiline?: boolean;
  onChange: (value: string) => void;
};

function Field({ label, value, multiline = true, onChange }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-qadam-graphite">{label}</span>
      {multiline ? (
        <textarea
          className="mt-2 min-h-20 w-full resize-none rounded-2xl border border-qadam-border bg-qadam-bg px-4 py-3 text-sm leading-6 outline-none transition focus:border-qadam-primary focus:ring-2 focus:ring-qadam-primary/15"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className="mt-2 min-h-12 w-full rounded-2xl border border-qadam-border bg-qadam-bg px-4 py-3 text-sm outline-none transition focus:border-qadam-primary focus:ring-2 focus:ring-qadam-primary/15"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

type LanguageSwitchProps = {
  value: PortfolioLanguage;
  onChange: (value: PortfolioLanguage) => void;
};

const languages: Array<{ id: PortfolioLanguage; label: string }> = [
  { id: "ru", label: "RU" },
  { id: "kk", label: "KZ" },
  { id: "en", label: "EN" }
];

function LanguageSwitch({ value, onChange }: LanguageSwitchProps) {
  return (
    <div>
      <p className="text-sm font-bold text-qadam-graphite">Draft language</p>
      <div className="mt-2 grid grid-cols-3 gap-2 rounded-2xl bg-qadam-bg p-1">
        {languages.map((language) => {
          const active = value === language.id;

          return (
            <button
              key={language.id}
              className={`min-h-10 rounded-xl text-sm font-bold transition ${
                active ? "bg-qadam-primary text-white shadow-soft" : "text-qadam-muted"
              }`}
              onClick={() => onChange(language.id)}
              type="button"
            >
              {language.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
