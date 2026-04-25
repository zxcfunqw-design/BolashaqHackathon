import type { UniversityGraphEdge, UniversityGraphNode } from "../data/universityGraph";

export type FinancialPathStep = {
  nodeId: string;
  title: string;
  type: UniversityGraphNode["type"];
  costKzt: number;
  costNote?: string;
  fundingOptions: string[];
};

export type FinancialPath = {
  targetId: string;
  targetTitle: string;
  nodeIds: string[];
  steps: FinancialPathStep[];
  totalCostKzt: number;
  fundingOptions: string[];
};

type CalculateFinancialPathsInput = {
  nodes: UniversityGraphNode[];
  edges: UniversityGraphEdge[];
  startId: string;
  targetId?: string;
};

export function calculateFinancialPaths({
  nodes,
  edges,
  startId,
  targetId
}: CalculateFinancialPathsInput): FinancialPath[] {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const outgoingBySource = new Map<string, UniversityGraphEdge[]>();

  edges.forEach((edge) => {
    const current = outgoingBySource.get(edge.from) ?? [];
    current.push(edge);
    outgoingBySource.set(edge.from, current);
  });

  const start = nodesById.get(startId);
  if (!start) return [];

  const paths: FinancialPath[] = [];

  const dfs = (currentId: string, nodeIds: string[], visited: Set<string>) => {
    const node = nodesById.get(currentId);
    if (!node) return;

    const reachedTarget = targetId ? currentId === targetId : node.type === "opportunity";

    if (reachedTarget && currentId !== startId) {
      paths.push(createFinancialPath(nodeIds, nodesById));
      return;
    }

    const nextEdges = outgoingBySource.get(currentId) ?? [];

    nextEdges.forEach((edge) => {
      if (visited.has(edge.to)) return;

      visited.add(edge.to);
      dfs(edge.to, [...nodeIds, edge.to], visited);
      visited.delete(edge.to);
    });
  };

  dfs(startId, [startId], new Set([startId]));

  return paths.sort((a, b) => a.totalCostKzt - b.totalCostKzt);
}

export function formatKzt(amount: number) {
  return new Intl.NumberFormat("ru-KZ", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "KZT"
  }).format(amount);
}

export function formatKztCompact(amount: number) {
  if (amount === 0) return "0 ₸";
  if (amount >= 1_000_000) return `${trimNumber(amount / 1_000_000)}M ₸`;
  if (amount >= 1_000) return `${trimNumber(amount / 1_000)}K ₸`;
  return `${amount} ₸`;
}

function createFinancialPath(
  nodeIds: string[],
  nodesById: Map<string, UniversityGraphNode>
): FinancialPath {
  const steps = nodeIds
    .map((nodeId) => nodesById.get(nodeId))
    .filter((node): node is UniversityGraphNode => Boolean(node))
    .map((node) => ({
      nodeId: node.id,
      title: node.title,
      type: node.type,
      costKzt: node.costKzt,
      costNote: node.costNote,
      fundingOptions: node.fundingOptions ?? []
    }));

  const target = steps[steps.length - 1];
  const fundingOptions = Array.from(new Set(steps.flatMap((step) => step.fundingOptions)));

  return {
    targetId: target.nodeId,
    targetTitle: target.title,
    nodeIds,
    steps,
    totalCostKzt: steps.reduce((sum, step) => sum + step.costKzt, 0),
    fundingOptions
  };
}

function trimNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
