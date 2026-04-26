import universities from "../data/universities.json";
import type {
  GeneratedGraphEdge,
  GeneratedGraphExpansion,
  GeneratedGraphNode,
  Language,
  QuizAnswers,
  UserPath
} from "../types";
import type { UniversityGraphEdge, UniversityGraphNode } from "../data/universityGraph";

export type GraphExpandRequest = {
  language: Language;
  selectedGoals: string[];
  quizAnswers: QuizAnswers;
  path: UserPath;
  selectedNode: UniversityGraphNode;
  existingNodes: UniversityGraphNode[];
  existingEdges: UniversityGraphEdge[];
};

export type OpenAiGraphExpandRequest = GraphExpandRequest & {
  universities: typeof universities;
};

const GRAPH_EXPAND_API_URL = "/api/graph-expand";

export async function expandGraphWithAi(request: GraphExpandRequest): Promise<GeneratedGraphExpansion> {
  try {
    const response = await fetch(GRAPH_EXPAND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...request,
        universities
      } satisfies OpenAiGraphExpandRequest)
    });

    if (!response.ok) {
      const details = await readError(response);
      throw new Error(details || `Graph expand API failed with status ${response.status}`);
    }

    return sanitizeExpansion((await response.json()) as GeneratedGraphExpansion, request);
  } catch {
    return createFallbackExpansion(request);
  }
}

export function createOpenAiGraphExpandRequest(request: OpenAiGraphExpandRequest, model: string) {
  return {
    model,
    store: false,
    temperature: 0.45,
    max_output_tokens: 1400,
    instructions: [
      "You expand a career-path graph for rural school students in Kazakhstan.",
      "Use the selected graph node, student's selected goals, quiz answers, current path, existing graph, and university JSON.",
      "Suggest 3-5 new graph nodes and 3-6 edges.",
      "Allowed node types: direction(layer 2), skill(layer 3), action(layer 4), opportunity(layer 5).",
      "Opportunities may be universities, hackathons, contests, grants, clubs, mini-projects, or portfolio milestones.",
      "Prefer Kazakhstan-relevant universities and opportunities. If not sure about a deadline, do not invent it.",
      "Every id must start with ai- and use kebab-case.",
      "Use x coordinates by layer: layer2 around 250, layer3 around 492, layer4 around 742, layer5 around 986. Use y between 40 and 640.",
      "Return only valid JSON: {\"nodes\":[{\"id\":\"string\",\"type\":\"skill\",\"layer\":3,\"title\":\"string\",\"subtitle\":\"string\",\"costKzt\":0,\"costNote\":\"string\",\"fundingOptions\":[\"string\"],\"x\":492,\"y\":120,\"details\":[\"string\"],\"sourceUrl\":\"string\",\"sourceLabel\":\"string\"}],\"edges\":[{\"id\":\"string\",\"from\":\"existing-or-new-id\",\"to\":\"new-id\",\"label\":\"string\",\"tone\":\"primary\"}]}."
    ].join(" "),
    input: JSON.stringify(request)
  };
}

export function createOpenAiGraphExpansion(rawText: string, request: OpenAiGraphExpandRequest) {
  const parsed = JSON.parse(stripJsonFence(rawText));
  return sanitizeExpansion(
    {
      nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
      edges: Array.isArray(parsed.edges) ? parsed.edges : [],
      generatedAt: new Date().toISOString()
    },
    request
  );
}

function sanitizeExpansion(
  expansion: GeneratedGraphExpansion,
  request: Pick<GraphExpandRequest, "existingNodes" | "existingEdges" | "selectedNode">
): GeneratedGraphExpansion {
  const existingIds = new Set(request.existingNodes.map((node) => node.id));
  const generatedIds = new Set<string>();
  const allowedTypes = new Set(["direction", "skill", "action", "opportunity"]);
  const allowedTones = new Set(["primary", "blue", "yellow", "green", "muted"]);

  const nodes = expansion.nodes
    .filter((node) => node.id?.startsWith("ai-") && !existingIds.has(node.id))
    .filter((node) => allowedTypes.has(node.type))
    .slice(0, 6)
    .map((node, index): GeneratedGraphNode => {
      generatedIds.add(node.id);
      const layer = normalizeLayer(node.layer, node.type);

      return {
        id: node.id,
        type: node.type,
        layer,
        title: String(node.title || "AI suggestion").slice(0, 48),
        subtitle: String(node.subtitle || "AI draft").slice(0, 72),
        costKzt: Number.isFinite(node.costKzt) ? Math.max(0, Math.round(node.costKzt)) : 0,
        costNote: String(node.costNote || "AI estimate; verify with official sources.").slice(0, 120),
        fundingOptions: (node.fundingOptions ?? []).map(String).slice(0, 4),
        x: Number.isFinite(node.x) ? clamp(node.x, 220, 1030) : layerToX(layer),
        y: Number.isFinite(node.y) ? clamp(node.y, 40, 640) : 80 + index * 108,
        details: (node.details ?? ["AI draft suggestion. Verify before applying."]).map(String).slice(0, 4),
        sourceUrl: node.sourceUrl ? String(node.sourceUrl) : undefined,
        sourceLabel: node.sourceLabel ? String(node.sourceLabel) : "AI source"
      };
    });

  const allNodeIds = new Set([...existingIds, ...nodes.map((node) => node.id)]);
  const existingEdgeIds = new Set(request.existingEdges.map((edge) => edge.id));

  const edges = expansion.edges
    .filter((edge) => edge.id?.startsWith("ai-") && !existingEdgeIds.has(edge.id))
    .filter((edge) => allNodeIds.has(edge.from) && allNodeIds.has(edge.to))
    .filter((edge) => generatedIds.has(edge.to) || generatedIds.has(edge.from))
    .slice(0, 8)
    .map(
      (edge): GeneratedGraphEdge => ({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        label: edge.label ? String(edge.label).slice(0, 18) : "AI",
        tone: allowedTones.has(edge.tone ?? "") ? edge.tone : "blue"
      })
    );

  if (nodes.length && !edges.length) {
    edges.push({
      id: `ai-edge-${request.selectedNode.id}-${nodes[0].id}`,
      from: request.selectedNode.id,
      to: nodes[0].id,
      label: "AI",
      tone: "blue"
    });
  }

  return {
    nodes,
    edges,
    generatedAt: new Date().toISOString()
  };
}

function createFallbackExpansion(request: GraphExpandRequest): GeneratedGraphExpansion {
  const baseY = Math.min(620, Math.max(60, request.selectedNode.y + 128));
  const source = request.selectedNode.id;

  return {
    nodes: [
      {
        id: `ai-skill-${source}-english-portfolio`,
        type: "skill",
        layer: 3,
        title: "English portfolio writing",
        subtitle: "Applications and project story",
        costKzt: 0,
        costNote: "Can be practiced with free templates and teacher feedback.",
        fundingOptions: ["Teacher mentor", "Free templates"],
        x: 492,
        y: baseY,
        details: [
          "Write one short project story in English.",
          "Prepare vocabulary for university and hackathon applications.",
          "Keep a Russian/Kazakh version for local opportunities."
        ]
      },
      {
        id: `ai-action-${source}-hackathon-draft`,
        type: "action",
        layer: 4,
        title: "Hackathon application draft",
        subtitle: "Problem, solution, role, result",
        costKzt: 5000,
        costNote: "Printing or mobile internet reserve.",
        fundingOptions: ["School support", "Team split"],
        x: 742,
        y: baseY,
        details: [
          "Create a one-page idea pitch.",
          "Explain your role and the village/school problem.",
          "Attach screenshots or a simple prototype."
        ]
      },
      {
        id: `ai-opportunity-${source}-local-stem`,
        type: "opportunity",
        layer: 5,
        title: "Local STEM contest",
        subtitle: "AI draft opportunity",
        costKzt: 10000,
        costNote: "AI draft; verify exact contest and deadline.",
        fundingOptions: ["District education office", "School budget"],
        x: 986,
        y: baseY,
        details: [
          "Look for regional STEM, robotics or project contests.",
          "Prefer online or hybrid formats for weak internet.",
          "Use the same portfolio draft for multiple applications."
        ]
      }
    ],
    edges: [
      { id: `ai-edge-${source}-english`, from: source, to: `ai-skill-${source}-english-portfolio`, label: "add", tone: "blue" },
      {
        id: `ai-edge-${source}-draft`,
        from: `ai-skill-${source}-english-portfolio`,
        to: `ai-action-${source}-hackathon-draft`,
        label: "prepare",
        tone: "yellow"
      },
      {
        id: `ai-edge-${source}-contest`,
        from: `ai-action-${source}-hackathon-draft`,
        to: `ai-opportunity-${source}-local-stem`,
        label: "apply",
        tone: "green"
      }
    ],
    generatedAt: new Date().toISOString()
  };
}

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { error?: { message?: string } };
    return data.error?.message;
  } catch {
    return "";
  }
}

function normalizeLayer(layer: number, type: GeneratedGraphNode["type"]): GeneratedGraphNode["layer"] {
  if (layer === 2 || layer === 3 || layer === 4 || layer === 5) return layer;
  if (type === "direction") return 2;
  if (type === "skill") return 3;
  if (type === "action") return 4;
  return 5;
}

function layerToX(layer: GeneratedGraphNode["layer"]) {
  return { 2: 250, 3: 492, 4: 742, 5: 986 }[layer];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function stripJsonFence(text: string) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}
