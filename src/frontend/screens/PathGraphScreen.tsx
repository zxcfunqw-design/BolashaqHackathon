import type { UserPath } from "../types";
import { Badge } from "../components/ui/Badge";
import { PathNode } from "../components/PathNode";

type PathGraphScreenProps = {
  path: UserPath;
};

export function PathGraphScreen({ path }: PathGraphScreenProps) {
  return (
    <div className="space-y-4">
      <section>
        <Badge tone="green">Personal development graph</Badge>
        <h2 className="mt-3 text-2xl font-black">My Path</h2>
        <p className="mt-2 text-sm leading-6 text-qadam-muted">
          Interests → directions → skills → mini-projects → opportunities → portfolio
        </p>
      </section>

      <div>
        {path.nodes.map((node, index) => (
          <PathNode key={node.id} node={node} isLast={index === path.nodes.length - 1} />
        ))}
      </div>
    </div>
  );
}
