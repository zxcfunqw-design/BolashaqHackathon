import { WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { createPortfolioOutput } from "../lib/storage";
import type { PortfolioDraft, PortfolioFields } from "../types";

type PortfolioScreenProps = {
  portfolio: PortfolioDraft;
  onPortfolioChange: (portfolio: PortfolioDraft) => void;
};

export function PortfolioScreen({ portfolio, onPortfolioChange }: PortfolioScreenProps) {
  const [fields, setFields] = useState<PortfolioFields>(portfolio.fields);
  const [generated, setGenerated] = useState(portfolio.generated);

  const output = useMemo(() => createPortfolioOutput(fields), [fields]);

  const saveDraft = (nextFields: PortfolioFields, nextGenerated = generated) => {
    onPortfolioChange({
      fields: nextFields,
      output: createPortfolioOutput(nextFields),
      generated: nextGenerated,
      updatedAt: new Date().toISOString()
    });
  };

  const updateField = (key: keyof PortfolioFields, value: string) => {
    const next = { ...fields, [key]: value };
    setFields(next);
    setGenerated(false);
    saveDraft(next, false);
  };

  const generate = () => {
    setGenerated(true);
    saveDraft(fields, true);
  };

  return (
    <div className="space-y-4">
      <section>
        <p className="text-sm font-bold text-qadam-primary">Portfolio builder</p>
        <h2 className="mt-1 text-2xl font-black">Turn actions into proof</h2>
      </section>

      <Card>
        <div className="space-y-4">
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
        </div>

        <Button fullWidth className="mt-5" onClick={generate}>
          <span className="inline-flex items-center justify-center gap-2">
            <WandSparkles size={17} />
            Create portfolio description
          </span>
        </Button>
      </Card>

      {generated ? (
        <Card className="border-qadam-primary/20 bg-emerald-50">
          <p className="text-xs font-bold uppercase text-qadam-primary">Generated draft</p>
          <p className="mt-3 text-sm leading-7 text-qadam-graphite">{output}</p>
        </Card>
      ) : null}
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function Field({ label, value, onChange }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-qadam-graphite">{label}</span>
      <textarea
        className="mt-2 min-h-20 w-full resize-none rounded-2xl border border-qadam-border bg-qadam-bg px-4 py-3 text-sm leading-6 outline-none transition focus:border-qadam-primary focus:ring-2 focus:ring-qadam-primary/15"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
