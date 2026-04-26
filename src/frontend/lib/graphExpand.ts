import universities from "../data/universities.json";
import { fetchApiWithFallback } from "./apiClient";
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

const GRAPH_EXPAND_API_PATH = "/api/graph-expand";

export async function expandGraphWithAi(request: GraphExpandRequest): Promise<GeneratedGraphExpansion> {
  try {
    const response = await fetchApiWithFallback(GRAPH_EXPAND_API_PATH, {
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
      "If the selected node is the student/root node, build the first personalized branch from the onboarding survey instead of adding generic extra nodes.",
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
  const interest = request.quizAnswers.interests ?? request.path.interests[0] ?? "IT";
  const access = request.quizAnswers.access ?? "Phone only";
  const experience = request.quizAnswers.experience ?? "Nothing yet";
  const yearlyGoal = request.quizAnswers.goal ?? "Build first project";
  const studyPlace = request.quizAnswers["study-place"] ?? "Rural school";
  const selectedGoal = request.selectedGoals[0] ?? "skills";
  const slug = slugify([source, interest, yearlyGoal].join("-"));
  const direction = directionForInterest(interest);
  const skill = skillForAccess(access, interest);
  const action = actionForGoal(yearlyGoal, experience, interest);
  const opportunity = opportunityForProfile(studyPlace, selectedGoal, interest);

  return {
    nodes: [
      {
        id: `ai-direction-${slug}`,
        type: "direction",
        layer: 2,
        title: direction.title,
        subtitle: `Based on ${interest} interest`,
        costKzt: 0,
        costNote: "Personalized from the onboarding survey.",
        fundingOptions: ["School mentor", "Free online materials"],
        x: 250,
        y: baseY,
        details: [
          `Student context: ${studyPlace}, access: ${access}.`,
          `Survey goal: ${yearlyGoal}.`,
          direction.detail
        ]
      },
      {
        id: `ai-skill-${slug}`,
        type: "skill",
        layer: 3,
        title: skill.title,
        subtitle: skill.subtitle,
        costKzt: 0,
        costNote: "Can be practiced with free or low-data resources.",
        fundingOptions: ["Teacher mentor", "Offline practice", "Free templates"],
        x: 492,
        y: baseY,
        details: [
          skill.detail,
          `Start from current experience: ${experience}.`,
          "Save screenshots, notes or teacher feedback as proof."
        ]
      },
      {
        id: `ai-action-${slug}`,
        type: "action",
        layer: 4,
        title: action.title,
        subtitle: action.subtitle,
        costKzt: 5000,
        costNote: "Small reserve for mobile internet, printing or local travel.",
        fundingOptions: ["School support", "Team split"],
        x: 742,
        y: baseY,
        details: [
          action.detail,
          "Explain the problem, your role, result and next improvement.",
          "Attach one visible artifact: photo, document, prototype or certificate."
        ]
      },
      {
        id: `ai-opportunity-${slug}`,
        type: "opportunity",
        layer: 5,
        title: opportunity.title,
        subtitle: opportunity.subtitle,
        costKzt: 10000,
        costNote: "AI fallback estimate; verify exact requirements and deadline.",
        fundingOptions: ["District education office", "School budget"],
        x: 986,
        y: baseY,
        details: [
          opportunity.detail,
          "Prefer online or hybrid formats if internet access is limited.",
          "Reuse the same portfolio draft for several applications."
        ]
      }
    ],
    edges: [
      { id: `ai-edge-${slug}-direction`, from: source, to: `ai-direction-${slug}`, label: "match", tone: "blue" },
      {
        id: `ai-edge-${slug}-skill`,
        from: `ai-direction-${slug}`,
        to: `ai-skill-${slug}`,
        label: "learn",
        tone: "primary"
      },
      {
        id: `ai-edge-${slug}-action`,
        from: `ai-skill-${slug}`,
        to: `ai-action-${slug}`,
        label: "build",
        tone: "yellow"
      },
      {
        id: `ai-edge-${slug}-opportunity`,
        from: `ai-action-${slug}`,
        to: `ai-opportunity-${slug}`,
        label: "apply",
        tone: "green"
      }
    ],
    generatedAt: new Date().toISOString()
  };
}

function directionForInterest(interest: string) {
  const normalized = interest.toLowerCase();
  if (normalized.includes("medicine")) {
    return {
      title: "Health Tech Direction",
      detail: "Connect biology, data and community health problems."
    };
  }
  if (normalized.includes("agrotech") || normalized.includes("ecology")) {
    return {
      title: "Agro/Eco Tech Direction",
      detail: "Work on local agriculture, ecology or resource-monitoring problems."
    };
  }
  if (normalized.includes("design") || normalized.includes("business")) {
    return {
      title: "Product Builder Direction",
      detail: "Turn user needs into a small service, design or business experiment."
    };
  }
  if (normalized.includes("robotics") || normalized.includes("physics")) {
    return {
      title: "Engineering Direction",
      detail: "Build practical prototypes with physics, sensors or simple simulations."
    };
  }

  return {
    title: "Software / AI Direction",
    detail: "Start with useful software, data or AI mini-projects."
  };
}

function skillForAccess(access: string, interest: string) {
  const lowAccess = access.toLowerCase().includes("phone") || access.toLowerCase().includes("weak");
  if (lowAccess) {
    return {
      title: "Phone-first research",
      subtitle: "Notes, prompts, screenshots",
      detail: `Use a phone-friendly workflow to study ${interest} and collect project evidence.`
    };
  }

  return {
    title: "Prototype basics",
    subtitle: "Simple tools and visible proof",
    detail: `Use available computer time to make a small ${interest} prototype.`
  };
}

function actionForGoal(goal: string, experience: string, interest: string) {
  if (goal.toLowerCase().includes("contest") || experience.toLowerCase().includes("olympiad")) {
    return {
      title: "Contest-ready draft",
      subtitle: "Problem, idea, proof",
      detail: `Prepare a contest submission around ${interest}.`
    };
  }
  if (goal.toLowerCase().includes("grant")) {
    return {
      title: "Grant application pack",
      subtitle: "Budget, impact, evidence",
      detail: "Write a small budget and explain who benefits from the project."
    };
  }

  return {
    title: "First mini-project",
    subtitle: "One useful result",
    detail: `Build a small ${interest} project that solves a school or local problem.`
  };
}

function opportunityForProfile(studyPlace: string, selectedGoal: string, interest: string) {
  if (selectedGoal === "portfolio") {
    return {
      title: "Portfolio milestone",
      subtitle: `${studyPlace} evidence`,
      detail: "Package the project as a portfolio story with proof and reflection."
    };
  }
  if (selectedGoal === "grants") {
    return {
      title: "Local mini-grant",
      subtitle: `${interest} support`,
      detail: "Ask school or district contacts about small project funding."
    };
  }

  return {
    title: "Regional student contest",
    subtitle: `${interest} opportunity`,
    detail: "Search for a regional contest, hackathon or school project showcase."
  };
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

  return slug || `profile-${Date.now()}`;
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
