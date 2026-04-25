import { ExternalLink, LocateFixed, Minus, Move, Plus } from "lucide-react";
import { PointerEvent, useMemo, useRef, useState } from "react";
import { universityGraphEdges, universityGraphNodes, type UniversityGraphNode } from "../data/universityGraph";
import type { UserPath } from "../types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

type PathGraphScreenProps = {
  path: UserPath;
};

const board = {
  width: 960,
  height: 760
};

const nodeSize = {
  width: 170,
  height: 92
};

const nodeStyles: Record<UniversityGraphNode["type"], string> = {
  student: "border-qadam-primary bg-qadam-primary text-white",
  career: "border-blue-200 bg-blue-50 text-blue-950",
  university: "border-emerald-200 bg-white text-qadam-graphite",
  route: "border-yellow-200 bg-yellow-50 text-yellow-950"
};

const nodeBadges: Record<UniversityGraphNode["type"], string> = {
  student: "Start",
  career: "Profession",
  university: "University",
  route: "Optimal path"
};

const edgeColors = {
  primary: "#0F766E",
  blue: "#2563EB",
  yellow: "#D89A00",
  muted: "#94A3B8"
};

export function PathGraphScreen({ path }: PathGraphScreenProps) {
  const [scale, setScale] = useState(0.68);
  const [offset, setOffset] = useState({ x: 0, y: 8 });
  const [selectedId, setSelectedId] = useState("you");
  const [dragging, setDragging] = useState(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const nodesById = useMemo(
    () => new Map(universityGraphNodes.map((node) => [node.id, node])),
    []
  );
  const selectedNode = nodesById.get(selectedId) ?? universityGraphNodes[0];

  const zoom = (delta: number) => {
    setScale((current) => Math.min(1.35, Math.max(0.48, Number((current + delta).toFixed(2)))));
  };

  const resetView = () => {
    setScale(0.68);
    setOffset({ x: 0, y: 8 });
  };

  const startPan = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
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

  return (
    <div className="space-y-4">
      <section>
        <div className="flex items-center justify-between gap-3">
          <Badge tone="green">Whiteboard path graph</Badge>
          <Badge tone="blue">{Math.round(scale * 100)}%</Badge>
        </div>
        <h2 className="mt-3 text-2xl font-black">Path canvas</h2>
        <p className="mt-2 text-sm leading-6 text-qadam-muted">
          {path.summary}: ты → профессии → университеты → оптимальные шаги поступления.
        </p>
      </section>

      <div className="overflow-hidden rounded-[26px] border border-qadam-border bg-white shadow-soft">
        <div className="flex items-center justify-between gap-2 border-b border-qadam-border bg-slate-50 px-3 py-2">
          <div className="flex items-center gap-2 text-xs font-bold text-qadam-muted">
            <Move size={15} />
            Drag canvas
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
          className={`relative h-[520px] touch-none overflow-hidden bg-white ${
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
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width: board.width,
              height: board.height,
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`
            }}
          >
            <GridBackground />
            <svg
              className="pointer-events-none absolute inset-0"
              height={board.height}
              viewBox={`0 0 ${board.width} ${board.height}`}
              width={board.width}
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
              {universityGraphEdges.map((edge) => {
                const from = nodesById.get(edge.from);
                const to = nodesById.get(edge.to);
                if (!from || !to) return null;

                const start = {
                  x: from.x + nodeSize.width,
                  y: from.y + nodeSize.height / 2
                };
                const end = {
                  x: to.x,
                  y: to.y + nodeSize.height / 2
                };
                const mid = Math.max(44, (end.x - start.x) / 2);
                const color = edgeColors[edge.tone ?? "muted"];

                return (
                  <g key={edge.id}>
                    <path
                      d={`M ${start.x} ${start.y} C ${start.x + mid} ${start.y}, ${
                        end.x - mid
                      } ${end.y}, ${end.x - 10} ${end.y}`}
                      fill="none"
                      markerEnd="url(#arrow)"
                      stroke={color}
                      strokeLinecap="round"
                      strokeWidth="3"
                    />
                    {edge.label ? (
                      <text
                        fill={color}
                        fontSize="13"
                        fontWeight="700"
                        x={(start.x + end.x) / 2 - 24}
                        y={(start.y + end.y) / 2 - 8}
                      >
                        {edge.label}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>

            {universityGraphNodes.map((node) => {
              const selected = selectedNode.id === node.id;

              return (
                <button
                  key={node.id}
                  className={`absolute rounded-[22px] border-2 p-3 text-left shadow-soft transition ${
                    nodeStyles[node.type]
                  } ${selected ? "ring-4 ring-qadam-yellow/40" : ""}`}
                  data-testid={`graph-node-${node.id}`}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: nodeSize.width,
                    minHeight: nodeSize.height
                  }}
                  onClick={() => setSelectedId(node.id)}
                  type="button"
                >
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-black text-qadam-primary">
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
            <Badge tone={selectedNode.type === "route" ? "yellow" : "green"}>
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

function GridBackground() {
  return (
    <div
      className="absolute inset-0 rounded-none"
      style={{
        backgroundImage:
          "linear-gradient(#E2E8F0 1px, transparent 1px), linear-gradient(90deg, #E2E8F0 1px, transparent 1px)",
        backgroundSize: "32px 32px"
      }}
    />
  );
}
