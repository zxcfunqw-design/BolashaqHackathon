import { ExternalLink, LocateFixed, Minus, Move, Plus } from "lucide-react";
import { PointerEvent, useMemo, useRef, useState } from "react";
import {
  graphBoard,
  universityGraphEdges,
  universityGraphNodes,
  type UniversityGraphEdge,
  type UniversityGraphNode
} from "../data/universityGraph";
import type { UserPath } from "../types";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

type PathGraphScreenProps = {
  path: UserPath;
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
  student: "border-qadam-primary bg-qadam-primary text-white",
  direction: "border-blue-200 bg-blue-50 text-blue-950",
  skill: "border-teal-200 bg-teal-50 text-teal-950",
  action: "border-yellow-200 bg-yellow-50 text-yellow-950",
  opportunity: "border-emerald-200 bg-white text-qadam-graphite"
};

const nodeBadges: Record<UniversityGraphNode["type"], string> = {
  student: "1-layer",
  direction: "Направление",
  skill: "Навык",
  action: "Действие",
  opportunity: "Возможность"
};

const edgeColors: Record<NonNullable<UniversityGraphEdge["tone"]>, string> = {
  primary: "#0F766E",
  blue: "#2563EB",
  yellow: "#D89A00",
  green: "#16A34A",
  muted: "#94A3B8"
};

export function PathGraphScreen({ path }: PathGraphScreenProps) {
  const [scale, setScale] = useState(0.74);
  const [offset, setOffset] = useState({ x: 8, y: 18 });
  const [selectedId, setSelectedId] = useState("you");
  const [dragging, setDragging] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedBranch>({
    directionId: null,
    skillId: null,
    actionId: null
  });
  const lastPointer = useRef({ x: 0, y: 0 });

  const nodesById = useMemo(
    () => new Map(universityGraphNodes.map((node) => [node.id, node])),
    []
  );

  const outgoingBySource = useMemo(() => {
    const map = new Map<string, UniversityGraphEdge[]>();
    universityGraphEdges.forEach((edge) => {
      const current = map.get(edge.from) ?? [];
      current.push(edge);
      map.set(edge.from, current);
    });
    return map;
  }, []);

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

    return ids;
  }, [expanded, outgoingBySource]);

  const visibleEdges = useMemo(
    () =>
      universityGraphEdges.filter((edge) => {
        if (edge.from === "you") return true;
        return (
          edge.from === expanded.directionId ||
          edge.from === expanded.skillId ||
          edge.from === expanded.actionId
        );
      }),
    [expanded]
  );

  const selectedNode = nodesById.get(selectedId) ?? universityGraphNodes[0];
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
        <p className="mt-2 text-sm leading-6 text-qadam-muted">
          {`${path.summary}: ты -> направления -> навыки -> действия -> возможности.`}
        </p>
      </section>

      <div className="overflow-hidden rounded-[26px] border border-qadam-border bg-white shadow-soft">
        <div className="flex items-center justify-between gap-2 border-b border-qadam-border bg-slate-50 px-3 py-2">
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
          className={`relative h-[62vh] min-h-[420px] max-h-[660px] touch-none overflow-hidden bg-white ${
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

            {universityGraphNodes.map((node) => {
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
                  <span className="rounded-full bg-white/75 px-2 py-0.5 text-[11px] font-black text-qadam-primary">
                    {nodeBadges[node.type]}
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
            <Badge tone={selectedNode.type === "action" ? "yellow" : "green"}>
              {nodeBadges[selectedNode.type]}
            </Badge>
            <h3 className="mt-3 text-lg font-black">{selectedNode.title}</h3>
            <p className="mt-1 text-sm font-semibold text-qadam-muted">{selectedNode.subtitle}</p>
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
        <ul className="mt-4 space-y-2">
          {selectedNode.details.map((detail) => (
            <li key={detail} className="rounded-2xl bg-qadam-bg px-3 py-2 text-sm leading-6 text-qadam-graphite">
              {detail}
            </li>
          ))}
        </ul>
      </Card>
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
      className="grid min-h-10 min-w-10 place-items-center rounded-2xl border border-qadam-border bg-white text-qadam-primary"
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

function mod(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}
