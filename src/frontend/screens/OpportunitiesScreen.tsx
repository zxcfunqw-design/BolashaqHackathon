import { RefreshCw } from "lucide-react";
import { opportunities } from "../data/opportunities";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { OpportunityCard } from "../components/OpportunityCard";

type OpportunitiesScreenProps = {
  online: boolean;
  savedOpportunityIds: string[];
  onSaveOpportunity: (id: string) => void;
};

export function OpportunitiesScreen({
  online,
  savedOpportunityIds,
  onSaveOpportunity
}: OpportunitiesScreenProps) {
  return (
    <div className="space-y-4">
      <section className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-qadam-primary">Opportunities</p>
          <h2 className="mt-1 text-2xl font-black">Matched for you</h2>
        </div>
        <Button variant="secondary" className="shrink-0">
          <span className="inline-flex items-center justify-center gap-2">
            <RefreshCw size={16} />
            Жаңарту
          </span>
        </Button>
      </section>

      {!online ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <p className="text-sm font-semibold text-yellow-900">
            Интернет жоқ. Показываем сохранённые возможности.
          </p>
        </Card>
      ) : null}

      <div className="space-y-3">
        {opportunities.map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            saved={savedOpportunityIds.includes(opportunity.id)}
            onSave={onSaveOpportunity}
          />
        ))}
      </div>
    </div>
  );
}
