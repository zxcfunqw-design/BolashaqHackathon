import { Bookmark, ChevronRight, Signal } from "lucide-react";
import type { Opportunity } from "../types";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

const internetTone = {
  low: "green",
  medium: "yellow",
  high: "blue"
} as const;

type OpportunityCardProps = {
  opportunity: Opportunity;
};

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge tone="blue">{opportunity.type}</Badge>
          <h3 className="mt-3 text-base font-bold leading-6">{opportunity.title}</h3>
        </div>
        <Badge tone={internetTone[opportunity.internet]}>
          <Signal size={13} />
          {opportunity.internet}
        </Badge>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase text-qadam-muted">Format</dt>
          <dd className="font-semibold capitalize">{opportunity.format}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-qadam-muted">Grades</dt>
          <dd className="font-semibold">{opportunity.grades}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-qadam-muted">Language</dt>
          <dd className="font-semibold">{opportunity.language}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-qadam-muted">Deadline</dt>
          <dd className="font-semibold">{opportunity.deadline}</dd>
        </div>
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="secondary">
          <span className="inline-flex items-center justify-center gap-2">
            <Bookmark size={16} />
            Save
          </span>
        </Button>
        <Button>
          <span className="inline-flex items-center justify-center gap-2">
            Details
            <ChevronRight size={16} />
          </span>
        </Button>
      </div>
    </Card>
  );
}
