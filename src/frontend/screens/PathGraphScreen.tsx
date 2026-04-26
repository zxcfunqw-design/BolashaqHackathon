import { Calculator, CheckCircle2, ExternalLink, LocateFixed, Minus, Move, Plus, Sparkles, WandSparkles, WalletCards } from "lucide-react";
import { PointerEvent, useMemo, useRef, useState } from "react";
import {
  graphBoard,
  universityGraphEdges,
  universityGraphNodes,
  type UniversityGraphEdge,
  type UniversityGraphNode
} from "../data/universityGraph";
import {
  calculateFinancialPaths,
  formatKzt,
  formatKztCompact,
  type FinancialPath
} from "../lib/financialCalculator";
import { expandGraphWithAi } from "../lib/graphExpand";
import { generateGraphText } from "../lib/graphAi";
import { generateActionPlan } from "../lib/actionPlanAi";
import { generatePersonalizedGraphForUser } from "../lib/personalizedGraph";
import type {
  DesiredPath,
  GeneratedGraphExpansion,
  GraphAiText,
  ImplementationPlan,
  Language,
  PersonalizedGraph,
  PersonalizedGraphNode,
  QuizAnswers,
  UserAccount,
  UserPath
} from "../types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

type PathGraphScreenProps = {
  actionPlans: Record<string, ImplementationPlan>;
  desiredPath?: DesiredPath | null;
  onDesiredPathChange?: (desiredPath: DesiredPath | null) => void;
  graphExpansion?: GeneratedGraphExpansion;
  graphTexts: Record<string, GraphAiText>;
  language: Language;
  path: UserPath;
  personalizedGraph?: PersonalizedGraph;
  quizAnswers: QuizAnswers;
  selectedGoals: string[];
  user: UserAccount | null;
  onActionPlanGenerated: (nodeId: string, actionPlan: ImplementationPlan) => void;
  onGraphExpanded: (graphExpansion: GeneratedGraphExpansion) => void;
  onPersonalizedGraphGenerated: (personalizedGraph: PersonalizedGraph) => void;
  onGraphTextGenerated: (nodeId: string, graphText: GraphAiText) => void;
};

type ExpandedBranch = {
  directionId: string | null;
  skillId: string | null;
  actionId: string | null;
};

const nodeSize = {
  width: 190,
  height: 98
};

const nodeStyles: Record<UniversityGraphNode["type"], string> = {
  student: "border-qadam-primary bg-qadam-primary text-qadam-primaryContrast",
  direction: "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-100",
  skill: "border-teal-200 bg-teal-50 text-teal-950 dark:border-teal-500/30 dark:bg-teal-500/15 dark:text-teal-100",
  action: "border-yellow-200 bg-yellow-50 text-yellow-950 dark:border-yellow-500/30 dark:bg-yellow-500/15 dark:text-yellow-100",
  opportunity: "border-emerald-200 bg-qadam-card text-qadam-graphite dark:border-emerald-500/30 dark:bg-emerald-500/10"
};

const nodeBadges: Record<UniversityGraphNode["type"], string> = {
  student: "1-layer",
  direction: "Direction",
  skill: "Skill",
  action: "Action",
  opportunity: "University"
};

const edgeColors: Record<NonNullable<UniversityGraphEdge["tone"]>, string> = {
  primary: "#0F766E",
  blue: "#2563EB",
  yellow: "#D89A00",
  green: "#16A34A",
  muted: "#94A3B8"
};

export function PathGraphScreen({
  actionPlans,
  desiredPath,
  graphExpansion,
  graphTexts,
  language,
  onDesiredPathChange,
  path,
  personalizedGraph,
  quizAnswers,
  selectedGoals,
  user,
  onActionPlanGenerated,
  onGraphExpanded,
  onPersonalizedGraphGenerated,
  onGraphTextGenerated
}: PathGraphScreenProps) {
  const initialNodeIds = desiredPath?.nodeIds ?? path.recommendedGraphNodeIds ?? [
    "you",
    "python-programmer",
    "python-basics",
    "telegram-bot",
    "aitu"
  ];
  const [scale, setScale] = useState(0.74);
  const [offset, setOffset] = useState({ x: 8, y: 18 });
  const [selectedId, setSelectedId] = useState(initialNodeIds[initialNodeIds.length - 1] ?? "you");
  const [dragging, setDragging] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState("");
  const [expandBusy, setExpandBusy] = useState(false);
  const [expandError, setExpandError] = useState("");
  const [regenerateBusy, setRegenerateBusy] = useState(false);
  const [regenerateError, setRegenerateError] = useState("");
  const [planBusy, setPlanBusy] = useState(false);
  const [planError, setPlanError] = useState("");
  const [expanded, setExpanded] = useState<ExpandedBranch>(() => getExpandedFromNodeIds(initialNodeIds));
  const lastPointer = useRef({ x: 0, y: 0 });
  const baseGraph = useMemo<{ nodes: PersonalizedGraphNode[]; edges: UniversityGraphEdge[] }>(
    () =>
      isValidPersonalizedGraph(personalizedGraph)
        ? {
            nodes: personalizedGraph.nodes,
            edges: personalizedGraph.edges
          }
        : {
            nodes: universityGraphNodes,
            edges: universityGraphEdges
          },
    [personalizedGraph]
  );
  const graphNodes = useMemo(
    () => mergeNodes(baseGraph.nodes, graphExpansion?.nodes ?? []),
    [baseGraph.nodes, graphExpansion?.nodes]
  );
  const graphEdges = useMemo(
    () => mergeEdges(baseGraph.edges, graphExpansion?.edges ?? []),
    [baseGraph.edges, graphExpansion?.edges]
  );

  const nodesById = useMemo(
    () => new Map(graphNodes.map((node) => [node.id, node])),
    [graphNodes]
  );

  const outgoingBySource = useMemo(() => {
    const map = new Map<string, UniversityGraphEdge[]>();
    graphEdges.forEach((edge) => {
      const current = map.get(edge.from) ?? [];
      current.push(edge);
      map.set(edge.from, current);
    });
    return map;
  }, [graphEdges]);

  const visibleNodeIds = useMemo(() => {
    const ids = new Set<string>(["you"]);

    getTargets("you", outgoingBySource).forEach((id) => ids.add(id));

    if (expanded.directionId) {
      getTargets(expanded.directionId, outgoingBySource).forEach((id) => ids.add(id));
    }

    if (expanded.skillId) {
      getTargets(expanded.skillId, outgoingBySource).forEach((id) => ids.add(id));
    }

    if (expanded.actionId) {
      getTargets(expanded.actionId, outgoingBySource).forEach((id) => ids.add(id));
    }

    ids.add(selectedId);
    getTargets(selectedId, outgoingBySource).forEach((id) => ids.add(id));

    return ids;
  }, [expanded, outgoingBySource, selectedId]);

  const visibleEdges = useMemo(
    () =>
      graphEdges.filter((edge) => {
        if (edge.from === "you") return true;
        return (
          edge.from === expanded.directionId ||
          edge.from === expanded.skillId ||
          edge.from === expanded.actionId ||
          edge.from === selectedId
        );
      }),
    [expanded, graphEdges, selectedId]
  );

  const selectedNode = nodesById.get(selectedId) ?? graphNodes[0];
  const selectedGraphText = graphTexts[selectedNode.id];
  const selectedActionPlan = actionPlans[selectedNode.id] ?? selectedNode.implementation;
  const allFinancialPaths = useMemo(
    () =>
      calculateFinancialPaths({
        nodes: graphNodes,
        edges: graphEdges,
        startId: "you"
      }),
    [graphEdges, graphNodes]
  );
  const selectedFinancialPaths = useMemo(
    () =>
      selectedNode.type === "opportunity"
        ? calculateFinancialPaths({
            nodes: graphNodes,
            edges: graphEdges,
            startId: "you",
            targetId: selectedNode.id
          })
        : [],
    [graphEdges, graphNodes, selectedNode.id, selectedNode.type]
  );
  const selectedFinancialPath = selectedFinancialPaths[0] ?? null;
  const cheapestPaths = allFinancialPaths.slice(0, 3);
  const activeLayer = Math.max(
    selectedNode.layer,
    expanded.actionId ? 5 : expanded.skillId ? 4 : expanded.directionId ? 3 : 2
  );
  const gridSize = Math.max(16, 32 * scale);
  const gridStyle = {
    backgroundImage:
      "linear-gradient(#E2E8F0 1px, transparent 1px), linear-gradient(90deg, #E2E8F0 1px, transparent 1px)",
    backgroundPosition: `${mod(offset.x, gridSize)}px ${mod(offset.y, gridSize)}px`,
    backgroundSize: `${gridSize}px ${gridSize}px`
  };

  const zoom = (delta: number) => {
    setScale((current) => Math.min(1.35, Math.max(0.52, Number((current + delta).toFixed(2)))));
  };

  const resetView = () => {
    setScale(0.74);
    setOffset({ x: 8, y: 18 });
  };

  const startPan = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button,a,[data-edge-hitbox='true']")) return;
    setDragging(true);
    lastPointer.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const movePan = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;

    const dx = event.clientX - lastPointer.current.x;
    const dy = event.clientY - lastPointer.current.y;
    lastPointer.current = { x: event.clientX, y: event.clientY };
    setOffset((current) => ({ x: current.x + dx, y: current.y + dy }));
  };

  const stopPan = () => setDragging(false);

  const handleEdgeClick = (edge: UniversityGraphEdge) => {
    const target = nodesById.get(edge.to);
    if (!target) return;

    setSelectedId(target.id);

    if (target.type === "direction") {
      setExpanded({ directionId: target.id, skillId: null, actionId: null });
      return;
    }

    if (target.type === "skill") {
      setExpanded((current) => ({
        directionId: current.directionId,
        skillId: target.id,
        actionId: null
      }));
      return;
    }

    if (target.type === "action") {
      setExpanded((current) => ({
        directionId: current.directionId,
        skillId: current.skillId,
        actionId: target.id
      }));
    }
  };

  const handleNodeClick = (node: UniversityGraphNode) => {
    setSelectedId(node.id);

    if (node.type === "direction") {
      setExpanded({ directionId: node.id, skillId: null, actionId: null });
      return;
    }

    if (node.type === "skill") {
      setExpanded((current) => ({ ...current, skillId: node.id, actionId: null }));
      return;
    }

    if (node.type === "action") {
      setExpanded((current) => ({ ...current, actionId: node.id }));
    }
  };

  const activateFinancialPath = (financialPath: FinancialPath) => {
    setExpanded(getExpandedFromNodeIds(financialPath.nodeIds));
    setSelectedId(financialPath.targetId);
  };

  const chooseDesiredPath = (financialPath: FinancialPath) => {
    activateFinancialPath(financialPath);
    onDesiredPathChange?.({
      nodeIds: financialPath.nodeIds,
      pathTitles: financialPath.steps.map((step) => step.title),
      targetId: financialPath.targetId,
      targetTitle: financialPath.targetTitle,
      totalCostKzt: financialPath.totalCostKzt,
      fundingOptions: financialPath.fundingOptions,
      selectedAt: new Date().toISOString()
    });
  };

  const desiredPathKey = desiredPath?.nodeIds.join(">");

  const handleGenerateGraphText = async () => {
    setAiBusy(true);
    setAiError("");

    try {
      const graphText = await generateGraphText({
        language,
        path,
        quizAnswers,
        selectedGoals,
        selectedNode
      });
      onGraphTextGenerated(selectedNode.id, graphText);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "AI text generation failed.");
    } finally {
      setAiBusy(false);
    }
  };

  const handleExpandGraph = async () => {
    setExpandBusy(true);
    setExpandError("");

    try {
      const expansion = await expandGraphWithAi({
        existingEdges: graphEdges,
        existingNodes: graphNodes,
        language,
        path,
        quizAnswers,
        selectedGoals,
        selectedNode
      });
      const mergedExpansion = {
        nodes: mergeNodes(graphExpansion?.nodes ?? [], expansion.nodes),
        edges: mergeEdges(graphExpansion?.edges ?? [], expansion.edges),
        generatedAt: expansion.generatedAt
      };
      onGraphExpanded(mergedExpansion);
    } catch (error) {
      setExpandError(error instanceof Error ? error.message : "Graph expansion failed.");
    } finally {
      setExpandBusy(false);
    }
  };

  const handleRegenerateGraph = async () => {
    if (!user) return;
    if (!window.confirm("Regenerate your personal graph from your current profile and quiz answers?")) return;

    setRegenerateBusy(true);
    setRegenerateError("");

    try {
      const nextGraph = await generatePersonalizedGraphForUser(user);
      onPersonalizedGraphGenerated(nextGraph);
      onGraphExpanded({ nodes: [], edges: [], generatedAt: new Date().toISOString() });
      setSelectedId("you");
      const firstDirection = nextGraph.edges.find((edge) => edge.from === "you")?.to ?? null;
      setExpanded({ directionId: firstDirection, skillId: null, actionId: null });
    } catch (error) {
      setRegenerateError(error instanceof Error ? error.message : "Graph regeneration failed.");
    } finally {
      setRegenerateBusy(false);
    }
  };

  const handleGenerateActionPlan = async () => {
    if (selectedNode.type !== "action") return;

    setPlanBusy(true);
    setPlanError("");

    try {
      const actionPlan = await generateActionPlan({
        language,
        path,
        quizAnswers,
        selectedGoals,
        selectedNode
      });
      onActionPlanGenerated(selectedNode.id, actionPlan);
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : "Action plan generation failed.");
    } finally {
      setPlanBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <section>
        <div className="flex items-center justify-between gap-3">
          <Badge tone="green">Path graph</Badge>
          <Badge tone="blue">{Math.round(scale * 100)}%</Badge>
        </div>
        <h2 className="mt-3 text-2xl font-black">Path canvas</h2>
        {isValidPersonalizedGraph(personalizedGraph) ? (
          <p className="mt-2 rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-bold text-qadam-primary dark:bg-emerald-400/15 dark:text-emerald-100">
            Your personal path is ready.
          </p>
        ) : null}
        <p className="mt-2 text-sm leading-6 text-qadam-muted">
          {`${path.summary}: you -> direction -> skill -> action -> university.`}
        </p>
        <Button className="mt-4" disabled={regenerateBusy || !user} onClick={handleRegenerateGraph} variant="secondary">
          {regenerateBusy ? "Regenerating..." : "Regenerate my graph"}
        </Button>
        {regenerateError ? (
          <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {regenerateError}
          </p>
        ) : null}
      </section>

      <div className="overflow-hidden rounded-[26px] border border-qadam-border bg-qadam-card shadow-soft">
        <div className="flex items-center justify-between gap-2 border-b border-qadam-border bg-qadam-bg px-3 py-2">
          <div className="flex items-center gap-2 text-xs font-bold text-qadam-muted">
            <Move size={15} />
            Layer {activeLayer}/5
          </div>
          <div className="flex items-center gap-1">
            <IconButton label="Zoom out" onClick={() => zoom(-0.12)}>
              <Minus size={17} />
            </IconButton>
            <IconButton label="Reset view" onClick={resetView}>
              <LocateFixed size={17} />
            </IconButton>
            <IconButton label="Zoom in" onClick={() => zoom(0.12)}>
              <Plus size={17} />
            </IconButton>
          </div>
        </div>

        <div
          className={`relative h-[62vh] min-h-[420px] max-h-[660px] touch-none overflow-hidden bg-qadam-card ${
            dragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          onPointerDown={startPan}
          onPointerMove={movePan}
          onPointerUp={stopPan}
          onPointerCancel={stopPan}
          onWheel={(event) => {
            event.preventDefault();
            zoom(event.deltaY > 0 ? -0.08 : 0.08);
          }}
          style={gridStyle}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width: graphBoard.width,
              height: graphBoard.height,
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`
            }}
          >
            <svg
              className="absolute inset-0 overflow-visible"
              height={graphBoard.height}
              viewBox={`0 0 ${graphBoard.width} ${graphBoard.height}`}
              width={graphBoard.width}
            >
              <defs>
                <marker
                  id="arrow"
                  markerHeight="8"
                  markerWidth="8"
                  orient="auto"
                  refX="7"
                  refY="4"
                  viewBox="0 0 8 8"
                >
                  <path d="M0 0 L8 4 L0 8 Z" fill="#64748B" />
                </marker>
              </defs>
              {visibleEdges.map((edge) => {
                const from = nodesById.get(edge.from);
                const to = nodesById.get(edge.to);
                if (!from || !to || !visibleNodeIds.has(from.id) || !visibleNodeIds.has(to.id)) {
                  return null;
                }

                return (
                  <GraphEdge
                    edge={edge}
                    from={from}
                    key={edge.id}
                    onClick={handleEdgeClick}
                    selected={selectedId === to.id}
                    to={to}
                  />
                );
              })}
            </svg>

            {graphNodes.map((node) => {
              if (!visibleNodeIds.has(node.id)) return null;

              const selected = selectedNode.id === node.id;
              const branchActive =
                node.id === expanded.directionId ||
                node.id === expanded.skillId ||
                node.id === expanded.actionId;

              return (
                <button
                  key={node.id}
                  className={`absolute rounded-[22px] border-2 p-3 text-left shadow-soft transition ${
                    nodeStyles[node.type]
                  } ${selected ? "ring-4 ring-qadam-yellow/40" : ""} ${
                    branchActive ? "shadow-[0_14px_32px_rgba(15,118,110,0.18)]" : ""
                  }`}
                  data-testid={`graph-node-${node.id}`}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: nodeSize.width,
                    minHeight: nodeSize.height
                  }}
                  onClick={() => handleNodeClick(node)}
                  type="button"
                >
                  <span className="rounded-full bg-qadam-card/80 px-2 py-0.5 text-[11px] font-black text-qadam-primary">
                    {nodeBadges[node.type]}
                  </span>
                  <span className="ml-1 rounded-full bg-qadam-card/80 px-2 py-0.5 text-[11px] font-black text-qadam-primary">
                    {formatKztCompact(node.costKzt)}
                  </span>
                  <strong className="mt-2 block text-sm leading-5">{node.title}</strong>
                  <span className="mt-1 block text-xs leading-4 opacity-75">{node.subtitle}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge tone="blue">AI expansion</Badge>
            <h3 className="mt-3 text-lg font-black">Add more nodes</h3>
            <p className="mt-1 text-sm leading-6 text-qadam-muted">
              Add universities, skills, opportunities and hackathon-style actions based on your selected node.
            </p>
          </div>
          <div className="grid min-h-11 min-w-11 place-items-center rounded-2xl bg-blue-50 text-qadam-blue dark:bg-blue-400/15 dark:text-blue-100">
            <WandSparkles size={20} />
          </div>
        </div>
        <Button className="mt-4" disabled={expandBusy} fullWidth onClick={handleExpandGraph}>
          {expandBusy ? "Expanding graph..." : "Expand graph with AI"}
        </Button>
        {expandError ? (
          <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {expandError}
          </p>
        ) : null}
        {graphExpansion?.nodes.length ? (
          <p className="mt-3 rounded-2xl bg-qadam-bg px-3 py-2 text-sm leading-6 text-qadam-muted">
            AI draft nodes added: {graphExpansion.nodes.length}. Click generated nodes on the canvas to inspect them.
          </p>
        ) : null}
      </Card>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge tone="yellow">DFS finance</Badge>
            <h3 className="mt-3 text-lg font-black">Financial calculator</h3>
            <p className="mt-1 text-sm leading-6 text-qadam-muted">
              Select a university endpoint to calculate the full path cost from the graph.
            </p>
          </div>
          <div className="grid min-h-11 min-w-11 place-items-center rounded-2xl bg-yellow-50 text-yellow-700 dark:bg-yellow-300/15 dark:text-yellow-100">
            <Calculator size={20} />
          </div>
        </div>

        {selectedFinancialPath ? (
          <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-300/35 dark:bg-yellow-300/15">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-yellow-800">Selected endpoint</p>
                <p className="mt-1 text-sm font-bold text-qadam-graphite">
                  {selectedFinancialPath.targetTitle}
                </p>
              </div>
              <strong className="text-right text-base text-yellow-800">
                {formatKzt(selectedFinancialPath.totalCostKzt)}
              </strong>
            </div>
            <p className="mt-3 text-xs leading-5 text-qadam-muted">
              {describeFinancialPath(selectedFinancialPath)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedFinancialPath.fundingOptions.slice(0, 5).map((option) => (
                <span
                className="rounded-full bg-qadam-card px-2 py-1 text-[11px] font-bold text-yellow-900 dark:text-yellow-100"
                  key={option}
                >
                  {option}
                </span>
              ))}
            </div>
            <Button
              className="mt-4"
              fullWidth
              onClick={() => chooseDesiredPath(selectedFinancialPath)}
              variant={desiredPathKey === selectedFinancialPath.nodeIds.join(">") ? "secondary" : "primary"}
            >
              {desiredPathKey === selectedFinancialPath.nodeIds.join(">")
                ? "Selected as desired path"
                : "Choose this path"}
            </Button>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-qadam-border bg-qadam-bg p-3 text-sm leading-6 text-qadam-muted">
            Current selected node is not a final university. DFS still found {allFinancialPaths.length} full routes
            from "you" to university endpoints.
          </div>
        )}

        <div className="mt-4 border-t border-qadam-border pt-4">
          <div className="flex items-center gap-2">
            <WalletCards className="text-qadam-primary" size={18} />
            <p className="text-sm font-black text-qadam-graphite">Minimum cost options</p>
          </div>
          <div className="mt-3 space-y-2">
            {cheapestPaths.map((financialPath, index) => (
              <button
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-qadam-border bg-qadam-card px-3 py-3 text-left transition hover:border-qadam-primary/40"
                key={financialPath.nodeIds.join("-")}
                onClick={() => activateFinancialPath(financialPath)}
                type="button"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-black text-qadam-graphite">
                    #{index + 1} {financialPath.targetTitle}
                  </span>
                  <span className="mt-1 block truncate text-xs font-semibold text-qadam-muted">
                    {describeFinancialPath(financialPath)}
                  </span>
                </span>
                <strong className="shrink-0 text-sm text-qadam-primary">
                  {formatKztCompact(financialPath.totalCostKzt)}
                </strong>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge tone={selectedNode.type === "action" ? "yellow" : "green"}>
              {nodeBadges[selectedNode.type]}
            </Badge>
            <h3 className="mt-3 text-lg font-black">{selectedNode.title}</h3>
            <p className="mt-1 text-sm font-semibold text-qadam-muted">{selectedNode.subtitle}</p>
            <p className="mt-2 text-sm font-black text-qadam-primary">
              Node cost: {formatKzt(selectedNode.costKzt)}
            </p>
            {selectedNode.costNote ? (
              <p className="mt-1 text-xs leading-5 text-qadam-muted">{selectedNode.costNote}</p>
            ) : null}
          </div>
          {selectedNode.sourceUrl ? (
            <a
              className="grid min-h-11 min-w-11 place-items-center rounded-2xl border border-qadam-border text-qadam-primary"
              href={selectedNode.sourceUrl}
              rel="noreferrer"
              target="_blank"
              title={selectedNode.sourceLabel}
            >
              <ExternalLink size={18} />
            </a>
          ) : null}
        </div>
        {selectedNode.fundingOptions?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedNode.fundingOptions.map((option) => (
              <span
                className="rounded-full bg-qadam-bg px-2 py-1 text-[11px] font-bold text-qadam-primary"
                key={option}
              >
                {option}
              </span>
            ))}
          </div>
        ) : null}
        <ul className="mt-4 space-y-2">
          {selectedNode.details.map((detail) => (
            <li key={detail} className="rounded-2xl bg-qadam-bg px-3 py-2 text-sm leading-6 text-qadam-graphite">
              {detail}
            </li>
          ))}
        </ul>
      </Card>

      {selectedNode.type === "action" ? (
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge tone="yellow">Implementation</Badge>
              <h3 className="mt-3 text-lg font-black">Action execution plan</h3>
              <p className="mt-1 text-sm leading-6 text-qadam-muted">
                Concrete steps for doing this action, collecting proof, and turning it into portfolio evidence.
              </p>
            </div>
            <div className="grid min-h-11 min-w-11 place-items-center rounded-2xl bg-yellow-50 text-yellow-700 dark:bg-yellow-300/15 dark:text-yellow-100">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <Button className="mt-4" disabled={planBusy} fullWidth onClick={handleGenerateActionPlan}>
            {planBusy
              ? "Generating plan..."
              : selectedActionPlan
                ? "Refresh step-by-step plan"
                : "Get step-by-step plan"}
          </Button>

          {planError ? (
            <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {planError}
            </p>
          ) : null}

          {selectedActionPlan ? <ImplementationPlanView plan={selectedActionPlan} /> : null}
        </Card>
      ) : null}

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge tone="blue">AI text</Badge>
            <h3 className="mt-3 text-lg font-black">Personalized graph explanation</h3>
            <p className="mt-1 text-sm leading-6 text-qadam-muted">
              4o-mini adapts this node using selected goals, quiz answers, path data and universities JSON.
            </p>
          </div>
          <div className="grid min-h-11 min-w-11 place-items-center rounded-2xl bg-blue-50 text-qadam-blue dark:bg-blue-400/15 dark:text-blue-100">
            <Sparkles size={20} />
          </div>
        </div>

        <Button
          className="mt-4"
          disabled={aiBusy}
          fullWidth
          onClick={handleGenerateGraphText}
          variant="primary"
        >
          {aiBusy ? "Generating..." : selectedGraphText ? "Refresh AI text" : "Generate AI text"}
        </Button>

        {aiError ? (
          <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {aiError}
          </p>
        ) : null}

        {selectedGraphText ? (
          <div className="mt-4 space-y-3">
            <p className="rounded-2xl bg-qadam-bg px-3 py-3 text-sm leading-6 text-qadam-graphite">
              {selectedGraphText.studentFit}
            </p>
            <AiList title="Why this path" items={selectedGraphText.whyThisPath} />
            <AiList title="Next steps" items={selectedGraphText.nextSteps} />
            <AiList title="University notes" items={selectedGraphText.universityNotes} />
            <p className="rounded-2xl bg-yellow-50 px-3 py-2 text-sm leading-6 text-yellow-900 dark:bg-yellow-300/15 dark:text-yellow-100">
              {selectedGraphText.riskNote}
            </p>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function ImplementationPlanView({ plan }: { plan: ImplementationPlan }) {
  return (
    <div className="mt-4 space-y-4">
      <section className="rounded-2xl bg-qadam-bg px-3 py-3">
        <p className="text-xs font-black uppercase text-qadam-primary">Overview</p>
        <h4 className="mt-2 text-base font-black text-qadam-graphite">{plan.goal}</h4>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-2xl bg-qadam-card px-3 py-2">
            <span className="block text-xs font-bold uppercase text-qadam-muted">Time</span>
            <strong>{plan.estimatedTime}</strong>
          </div>
          <div className="rounded-2xl bg-qadam-card px-3 py-2">
            <span className="block text-xs font-bold uppercase text-qadam-muted">Difficulty</span>
            <strong className="capitalize">{plan.difficulty}</strong>
          </div>
        </div>
        <PlanList title="Required people" items={plan.requiredPeople} />
        <PlanList title="Required materials" items={plan.requiredMaterials} />
        <PlanList title="Next 7 days" items={plan.next7Days} />
      </section>

      <section>
        <p className="text-xs font-black uppercase text-qadam-primary">Step-by-step plan</p>
        <div className="mt-2 space-y-3">
          {plan.steps.map((step, index) => (
            <article className="rounded-2xl border border-qadam-border bg-qadam-card px-3 py-3" key={`${step.title}-${index}`}>
              <div className="flex items-start gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-qadam-primary text-xs font-black text-qadam-primaryContrast">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-qadam-graphite">{step.title}</h4>
                  <dl className="mt-2 space-y-2 text-sm leading-6">
                    <PlanDefinition label="What to do" value={step.whatToDo} />
                    <PlanDefinition label="Who to talk to" value={step.whoToTalkTo} />
                    <PlanDefinition label="Expected output" value={step.expectedOutput} />
                    <PlanDefinition label="Time estimate" value={step.timeEstimate} />
                  </dl>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs font-black uppercase text-qadam-primary">Checklist</p>
        <ul className="mt-2 space-y-2">
          {plan.checklist.map((item) => (
            <li className="flex gap-2 rounded-2xl bg-qadam-bg px-3 py-2 text-sm leading-6" key={item}>
              <CheckCircle2 className="mt-0.5 shrink-0 text-qadam-primary" size={18} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <PlanList title="Portfolio evidence" items={plan.evidenceForPortfolio} />
      <PlanList title="Risks" items={plan.risks} tone="warning" />
    </div>
  );
}

function PlanDefinition({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-black uppercase text-qadam-muted">{label}</dt>
      <dd className="text-qadam-graphite">{value}</dd>
    </div>
  );
}

function PlanList({
  items,
  title,
  tone = "default"
}: {
  items: string[];
  title: string;
  tone?: "default" | "warning";
}) {
  if (!items.length) return null;

  return (
    <section className="mt-3">
      <p className="text-xs font-black uppercase text-qadam-primary">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li
            className={`rounded-2xl px-3 py-2 text-sm leading-6 ${
              tone === "warning"
                ? "bg-yellow-50 text-yellow-900 dark:bg-yellow-300/15 dark:text-yellow-100"
                : "bg-qadam-bg text-qadam-graphite"
            }`}
            key={item}
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function AiList({ items, title }: { items: string[]; title: string }) {
  if (!items.length) return null;

  return (
    <div>
      <p className="text-xs font-black uppercase text-qadam-primary">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li className="rounded-2xl bg-qadam-bg px-3 py-2 text-sm leading-6 text-qadam-graphite" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

type GraphEdgeProps = {
  edge: UniversityGraphEdge;
  from: UniversityGraphNode;
  to: UniversityGraphNode;
  selected: boolean;
  onClick: (edge: UniversityGraphEdge) => void;
};

function GraphEdge({ edge, from, to, selected, onClick }: GraphEdgeProps) {
  const start = {
    x: from.x + nodeSize.width,
    y: from.y + nodeSize.height / 2
  };
  const end = {
    x: to.x,
    y: to.y + nodeSize.height / 2
  };
  const mid = Math.max(56, (end.x - start.x) / 2);
  const color = edgeColors[edge.tone ?? "muted"];
  const path = `M ${start.x} ${start.y} C ${start.x + mid} ${start.y}, ${end.x - mid} ${end.y}, ${
    end.x - 10
  } ${end.y}`;
  const labelX = (start.x + end.x) / 2 - 28;
  const labelY = (start.y + end.y) / 2 - 10;

  return (
    <g>
      <path
        d={path}
        data-edge-hitbox="true"
        fill="none"
        onClick={() => onClick(edge)}
        onPointerDown={(event) => event.stopPropagation()}
        stroke="transparent"
        strokeLinecap="round"
        strokeWidth="22"
      />
      <path
        d={path}
        fill="none"
        markerEnd="url(#arrow)"
        pointerEvents="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={selected ? "5" : "3"}
      />
      {edge.label ? (
        <text
          fill={color}
          fontSize="13"
          fontWeight="800"
          pointerEvents="none"
          x={labelX}
          y={labelY}
        >
          {edge.label}
        </text>
      ) : null}
    </g>
  );
}

type IconButtonProps = {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
};

function IconButton({ children, label, onClick }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className="grid min-h-10 min-w-10 place-items-center rounded-2xl border border-qadam-border bg-qadam-card text-qadam-primary"
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function getTargets(sourceId: string, outgoingBySource: Map<string, UniversityGraphEdge[]>) {
  return (outgoingBySource.get(sourceId) ?? []).map((edge) => edge.to);
}

function getExpandedFromNodeIds(nodeIds: string[]): ExpandedBranch {
  return {
    directionId:
      nodeIds.find((nodeId) =>
        [
          "python-programmer",
          "ai-engineer",
          "devops-engineer",
          "robotics-engineer",
          "software-engineer",
          "tech-entrepreneur"
        ].includes(nodeId)
      ) ?? null,
    skillId:
      nodeIds.find((nodeId) =>
        [
          "python-basics",
          "algorithms",
          "databases",
          "git",
          "english",
          "search-skill",
          "time-management",
          "ai-python",
          "software-product",
          "robotics-iot"
        ].includes(nodeId)
      ) ?? null,
    actionId:
      nodeIds.find((nodeId) =>
        [
          "free-course",
          "telegram-bot",
          "web-parser",
          "ai-bot",
          "ai-olympiad",
          "software-hackathon",
          "robotics-sensor"
        ].includes(nodeId)
      ) ?? null
  };
}

function describeFinancialPath(financialPath: FinancialPath) {
  return financialPath.steps.map((step) => step.title).join(" -> ");
}

function mod(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function isValidPersonalizedGraph(graph: PersonalizedGraph | undefined): graph is PersonalizedGraph {
  if (!graph?.nodes?.length || !graph.edges?.length) return false;
  const ids = new Set(graph.nodes.map((node) => node.id));
  return ids.has("you") && graph.edges.some((edge) => ids.has(edge.from) && ids.has(edge.to));
}

function mergeNodes<T extends { id: string }>(base: T[], additions: T[]) {
  const map = new Map(base.map((item) => [item.id, item]));
  additions.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

function mergeEdges<T extends { id: string }>(base: T[], additions: T[]) {
  const map = new Map(base.map((item) => [item.id, item]));
  additions.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}
