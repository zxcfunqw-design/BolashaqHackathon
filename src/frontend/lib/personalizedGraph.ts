import universities from "../data/universities.json";
import {
  graphBoard,
  universityGraphEdges,
  universityGraphNodes,
  type UniversityGraphEdge,
  type UniversityGraphNode
} from "../data/universityGraph";
import type {
  ImplementationPlan,
  PersonalizedGraph,
  PersonalizedGraphNode,
  QuizAnswers,
  UserAccount
} from "../types";

export type BaseGraph = {
  nodes: UniversityGraphNode[];
  edges: UniversityGraphEdge[];
};

export type OpenAiPersonalizedGraphRequest = {
  user: UserAccount;
  baseGraph: BaseGraph;
  universities: typeof universities;
};

const PERSONALIZED_GRAPH_API_URL = "/api/personalized-graph";
const allowedTypes = new Set(["student", "direction", "skill", "action", "opportunity"]);
const allowedTones = new Set(["primary", "blue", "yellow", "green", "muted"]);

export async function generatePersonalizedGraphForUser(user: UserAccount): Promise<PersonalizedGraph> {
  const baseGraph = { nodes: universityGraphNodes, edges: universityGraphEdges };

  try {
    const response = await fetch(PERSONALIZED_GRAPH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user,
        baseGraph,
        universities
      } satisfies OpenAiPersonalizedGraphRequest)
    });

    if (!response.ok) {
      const details = await readError(response);
      throw new Error(details || `Personalized graph API failed with status ${response.status}`);
    }

    return sanitizePersonalizedGraph((await response.json()) as PersonalizedGraph, user, baseGraph);
  } catch {
    return createDeterministicPersonalizedGraph(user, baseGraph);
  }
}

export function createPersonalizedGraphRequest(
  user: UserAccount,
  baseGraph: BaseGraph,
  universityData: typeof universities,
  model: string
) {
  return {
    model,
    store: false,
    temperature: 0.35,
    max_output_tokens: 5000,
    instructions: [
      "You are an educational career mentor for school students in Kazakhstan.",
      "Generate a realistic personalized development graph. Do not give generic advice.",
      "Use the student's grade, region, language, selected goals, quiz answers, interests, access to internet/devices, current skills, target direction, target university/career if provided.",
      "Every action node must contain practical implementation steps.",
      "Every opportunity node must be marked as needs verification unless it comes from provided verified data.",
      "Do not invent fake deadlines.",
      "Keep the graph small and usable: 10-18 nodes maximum. Prioritize clarity over completeness.",
      "The graph must start from the you node.",
      "The graph must include 1-2 career directions, 3-5 skills, 3-5 actions/projects, 2-4 opportunities/universities, and at least 1 portfolio evidence path.",
      "Use allowed node types only: direction(layer 2), skill(layer 3), action(layer 4), opportunity(layer 5).",
      "Every id must start with personalized- and use kebab-case.",
      "Use x coordinates by layer: layer2 around 250, layer3 around 492, layer4 around 742, layer5 around 986. Use y between 40 and 640.",
      "Return JSON only with this shape: {\"nodes\":[{\"id\":\"personalized-...\",\"type\":\"direction\",\"layer\":2,\"title\":\"...\",\"subtitle\":\"...\",\"details\":[\"...\"],\"costKzt\":0,\"costNote\":\"...\",\"fundingOptions\":[],\"x\":250,\"y\":80,\"sourceUrl\":\"\",\"sourceLabel\":\"\",\"implementation\":{\"goal\":\"...\",\"estimatedTime\":\"...\",\"difficulty\":\"easy\",\"steps\":[{\"title\":\"...\",\"whatToDo\":\"...\",\"whoToTalkTo\":\"...\",\"expectedOutput\":\"...\",\"timeEstimate\":\"...\"}],\"checklist\":[],\"requiredPeople\":[],\"requiredMaterials\":[],\"risks\":[],\"evidenceForPortfolio\":[],\"next7Days\":[],\"generatedAt\":\"\"}}],\"edges\":[{\"id\":\"personalized-edge-...\",\"from\":\"you\",\"to\":\"personalized-...\",\"label\":\"...\",\"tone\":\"primary\"}]}."
    ].join(" "),
    input: JSON.stringify({
      user: {
        id: user.id,
        name: user.name,
        grade: user.grade,
        region: user.region,
        language: user.language,
        selectedGoals: user.data.selectedGoals,
        quizAnswers: user.data.quizAnswers,
        path: user.data.path,
        portfolioFields: user.data.portfolio?.fields
      },
      baseGraph,
      universities: universityData
    })
  };
}

export function createOpenAiPersonalizedGraph(rawText: string, request: OpenAiPersonalizedGraphRequest) {
  const parsed = JSON.parse(stripJsonFence(rawText));
  return sanitizePersonalizedGraph(
    {
      nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
      edges: Array.isArray(parsed.edges) ? parsed.edges : [],
      generatedAt: new Date().toISOString(),
      basedOn: createBasedOn(request.user)
    },
    request.user,
    request.baseGraph
  );
}

export function sanitizePersonalizedGraph(
  graph: PersonalizedGraph,
  user: UserAccount,
  baseGraph: BaseGraph
): PersonalizedGraph {
  const baseIds = new Set(baseGraph.nodes.map((node) => node.id));
  const usedIds = new Set<string>();
  const nodes: PersonalizedGraphNode[] = [];
  const profileRoot = createStudentNode(user);

  usedIds.add(profileRoot.id);
  nodes.push(profileRoot);

  (graph.nodes ?? [])
    .filter((node) => node.id !== "you")
    .slice(0, 17)
    .forEach((node, index) => {
      const type = allowedTypes.has(node.type) && node.type !== "student" ? node.type : null;
      if (!type || !node.id || usedIds.has(node.id) || baseIds.has(node.id)) return;

      const id = node.id.startsWith("personalized-") ? slugify(node.id) : `personalized-${slugify(node.id)}`;
      if (usedIds.has(id)) return;
      usedIds.add(id);

      const layer = normalizeLayer(node.layer, type);
      const implementation = type === "action" ? sanitizeImplementation(node.implementation, node.title) : undefined;
      const hasVerifiedSource = Boolean(node.sourceUrl && node.sourceLabel);

      nodes.push({
        id,
        type,
        layer,
        title: String(node.title || "Personalized step").slice(0, 48),
        subtitle: String(node.subtitle || "Based on your diagnostic").slice(0, 72),
        details: normalizeDetails(node.details),
        costKzt: Number.isFinite(node.costKzt) ? Math.max(0, Math.round(node.costKzt)) : 0,
        costNote: normalizeCostNote(node.costNote, type, hasVerifiedSource),
        fundingOptions: (node.fundingOptions ?? []).map(String).slice(0, 4),
        x: Number.isFinite(node.x) ? clamp(node.x, 40, graphBoard.width - 170) : layerToX(layer),
        y: Number.isFinite(node.y) ? clamp(node.y, 40, graphBoard.height - 100) : 72 + index * 74,
        sourceUrl: node.sourceUrl ? String(node.sourceUrl) : undefined,
        sourceLabel: node.sourceLabel ? String(node.sourceLabel) : undefined,
        implementation
      });
    });

  const allIds = new Set(nodes.map((node) => node.id));
  const edgeIds = new Set<string>();
  const edges = (graph.edges ?? [])
    .filter((edge) => edge.id && !edgeIds.has(edge.id))
    .filter((edge) => allIds.has(edge.from) && allIds.has(edge.to))
    .slice(0, 25)
    .map((edge): UniversityGraphEdge => {
      edgeIds.add(edge.id);
      return {
        id: edge.id.startsWith("personalized-edge-") ? slugify(edge.id) : `personalized-edge-${slugify(edge.id)}`,
        from: edge.from,
        to: edge.to,
        label: edge.label ? String(edge.label).slice(0, 18) : undefined,
        tone: allowedTones.has(edge.tone ?? "") ? edge.tone : "muted"
      };
    });

  if (!edges.some((edge) => edge.from === "you")) {
    const firstDirection = nodes.find((node) => node.type === "direction") ?? nodes[1];
    if (firstDirection) {
      edges.unshift({
        id: `personalized-edge-you-${firstDirection.id}`,
        from: "you",
        to: firstDirection.id,
        label: "start",
        tone: "primary"
      });
    }
  }

  if (nodes.length < 8 || !nodes.some((node) => node.type === "action" && node.implementation?.steps.length)) {
    return createDeterministicPersonalizedGraph(user, baseGraph);
  }

  return {
    nodes: nodes.slice(0, 18),
    edges,
    generatedAt: new Date().toISOString(),
    basedOn: createBasedOn(user)
  };
}

function createDeterministicPersonalizedGraph(user: UserAccount, baseGraph: BaseGraph): PersonalizedGraph {
  const answers = user.data.quizAnswers;
  const interest = answers.interests ?? user.data.path.interests[0] ?? "IT";
  const access = answers.access ?? "Phone only";
  const experience = answers.experience ?? "Nothing yet";
  const yearlyGoal = answers.goal ?? "Build first project";
  const studyPlace = answers["study-place"] ?? user.region;
  const isRobotics = /robotics|physics/i.test(`${interest} ${user.data.path.summary}`);
  const isAi = /it|ai|computer|software|data/i.test(`${interest} ${user.data.path.summary}`);
  const weakAccess = /phone|weak/i.test(access);
  const rural = /village|rural|ауыл|аул/i.test(`${studyPlace} ${user.region}`);
  const junior = parseGrade(user.grade) <= 8;
  const y = junior ? [72, 176, 280, 384, 488] : [56, 152, 248, 344, 440, 536];
  const root = createStudentNode(user);
  const directionA = isRobotics
    ? makeNode("personalized-robotics-engineering", "direction", 2, "Robotics Engineering", "Physics, IoT and prototypes", 250, y[0], [
        "Best fit for physics, devices and hands-on experiments.",
        "Good path toward robotics, automation or engineering programs."
      ])
    : makeNode("personalized-ai-computer-science", "direction", 2, "AI / Computer Science", "Software, data and useful tools", 250, y[0], [
        "Best fit for IT, logic, math and practical software.",
        "Good path toward AITU, KBTU, NU or related computer science programs."
      ]);
  const directionB = makeNode("personalized-community-product", "direction", 2, "Community Product", "Local problem to portfolio", 250, y[1], [
    "Use your school or region as the source of real project ideas.",
    "Turn a local problem into evidence for portfolio and contests."
  ]);

  const skills = isRobotics
    ? [
        makeNode("personalized-physics-foundation", "skill", 3, "Physics foundation", "For sensors and mechanisms", 492, y[0], [
          "Review electricity, measurements and simple mechanics.",
          junior ? "Keep experiments small and safe." : "Connect formulas to prototype decisions."
        ]),
        makeNode("personalized-arduino-iot", "skill", 3, "Arduino / IoT basics", "Sensors and simple circuits", 492, y[1], [
          weakAccess ? "Use Tinkercad simulation or borrowed kits first." : "Build or simulate one sensor circuit.",
          "Save a diagram and short explanation."
        ]),
        makeNode("personalized-cad-sketching", "skill", 3, "CAD / sketching", "Design before building", 492, y[2], [
          "Draw the device, parts and expected inputs/outputs.",
          "Use paper sketches if software access is limited."
        ])
      ]
    : [
        makeNode("personalized-python-foundation", "skill", 3, "Python foundation", "Small scripts first", 492, y[0], [
          weakAccess ? "Use phone-friendly lessons and write code in short sessions." : "Practice variables, loops, functions and files.",
          "Keep every exercise as portfolio evidence."
        ]),
        makeNode("personalized-math-for-ai", "skill", 3, "Math for AI", "Logic, algebra, probability", 492, y[1], [
          "Solve small logic and graph tasks weekly.",
          junior ? "Focus on patterns and visual explanations." : "Add ENТ/olympiad-style practice."
        ]),
        makeNode("personalized-english-foundation", "skill", 3, "English foundation", "Docs and applications", 492, y[2], [
          "Learn 10 technical words per week.",
          "Practice a 60-second explanation of your project."
        ])
      ];

  if (weakAccess || rural) {
    skills.push(
      makeNode("personalized-low-internet-workflow", "skill", 3, "Low-internet workflow", "Offline notes and proof", 492, y[3], [
        "Download or screenshot tasks when internet is stable.",
        "Keep project notes, photos and drafts offline."
      ])
    );
  }

  const actions = isRobotics
    ? [
        makeAction("personalized-sensor-prototype", "Sensor prototype", "Measure one local problem", 742, y[0], [
          "Choose a measurable problem: temperature, light, water, noise or soil moisture.",
          "Build or simulate the sensor logic.",
          "Record a photo, diagram and result table."
        ]),
        makeAction("personalized-demo-day", "Demo day", "Explain and test", 742, y[1], [
          "Prepare a 3-minute explanation for a teacher or club.",
          "Show what the prototype measures and what you learned.",
          "Collect one feedback note and improve the design."
        ])
      ]
    : [
        makeAction("personalized-telegram-bot", "Telegram bot MVP", "Useful school helper", 742, y[0], [
          "Pick one school problem: announcements, homework reminders or club signups.",
          "Write the conversation flow on paper first.",
          "Build the smallest working version or clickable mockup."
        ]),
        makeAction("personalized-data-project", "Data mini-project", "Chart a local question", 742, y[1], [
          "Collect 10-30 simple observations from school or community.",
          "Make a table and one chart.",
          "Write what the data suggests and what is still uncertain."
        ])
      ];

  actions.push(
    makeAction("personalized-community-project", "Document local problem", "Portfolio evidence path", 742, y[2], [
      "Interview one teacher, parent or older student.",
      "Write the problem, who it affects, and why it matters.",
      "Attach photos, notes or a short audio summary as evidence."
    ])
  );

  if (!junior) {
    actions.push(
      makeAction("personalized-competition-pack", "Competition pack", "Pitch, proof, reflection", 742, y[3], [
        "Turn your project into a one-page pitch.",
        "Add screenshots, budget if needed, and your role.",
        "Ask a teacher to review it before submission."
      ])
    );
  }

  const opportunities = isRobotics
    ? [
        makeOpportunity("personalized-satbayev-route", "Satbayev route", "Engineering option", 986, y[0], true),
        makeOpportunity("personalized-nu-engineering-route", "NU Engineering route", "Long-term target", 986, y[1], true)
      ]
    : [
        makeOpportunity("personalized-aitu-route", "AITU route", "CS / AI option", 986, y[0], true),
        makeOpportunity("personalized-kbtu-route", "KBTU route", "Tech/business option", 986, y[1], true),
        makeOpportunity("personalized-nu-cs-route", "NU CS route", "Long-term target", 986, y[2], true)
      ];

  opportunities.push(
    makeOpportunity(
      "personalized-online-student-contest",
      junior ? "Online exploration contest" : "Regional hackathon / contest",
      rural ? "Online-first opportunity" : "Project opportunity",
      986,
      y[3] ?? 560,
      false
    )
  );

  const nodes = [root, directionA, directionB, ...skills, ...actions, ...opportunities].slice(0, 18);
  const edges: UniversityGraphEdge[] = [
    { id: "personalized-edge-you-main", from: "you", to: directionA.id, label: "match", tone: "primary" },
    { id: "personalized-edge-you-community", from: "you", to: directionB.id, label: "local", tone: "green" },
    ...skills.slice(0, 3).map((node, index): UniversityGraphEdge => ({
      id: `personalized-edge-main-skill-${index}`,
      from: directionA.id,
      to: node.id,
      label: "skill",
      tone: index === 0 ? "primary" : "blue"
    })),
    ...(skills[3] ? [{ id: "personalized-edge-low-internet", from: directionB.id, to: skills[3].id, label: "access", tone: "muted" } as UniversityGraphEdge] : []),
    ...actions.map((node, index): UniversityGraphEdge => ({
      id: `personalized-edge-action-${index}`,
      from: skills[Math.min(index, skills.length - 1)].id,
      to: node.id,
      label: index === 2 ? "proof" : "build",
      tone: index === 2 ? "green" : "yellow"
    })),
    ...opportunities.map((node, index): UniversityGraphEdge => ({
      id: `personalized-edge-opportunity-${index}`,
      from: actions[Math.min(index, actions.length - 1)].id,
      to: node.id,
      label: "apply",
      tone: index === opportunities.length - 1 ? "green" : "primary"
    }))
  ];

  return sanitizePersonalizedGraph(
    {
      nodes,
      edges,
      generatedAt: new Date().toISOString(),
      basedOn: createBasedOn(user)
    },
    user,
    baseGraph
  );
}

function createStudentNode(user: UserAccount): PersonalizedGraphNode {
  const answers = user.data.quizAnswers;
  return {
    id: "you",
    type: "student",
    layer: 1,
    title: user.name || "You",
    subtitle: `${user.grade || "School"} · ${user.region || "Kazakhstan"}`,
    costKzt: 0,
    x: 40,
    y: 314,
    details: [
      `Interest: ${answers.interests ?? user.data.path.interests.join(", ") ?? "Not provided"}.`,
      `Access: ${answers.access ?? "Not provided"}.`,
      `Goal: ${answers.goal ?? user.data.path.summary}.`
    ]
  };
}

function makeNode(
  id: string,
  type: PersonalizedGraphNode["type"],
  layer: PersonalizedGraphNode["layer"],
  title: string,
  subtitle: string,
  x: number,
  y: number,
  details: string[]
): PersonalizedGraphNode {
  return {
    id,
    type,
    layer,
    title,
    subtitle,
    costKzt: 0,
    costNote: "Personalized estimate; adjust with teacher or mentor.",
    fundingOptions: ["Free resources", "Teacher support"],
    x,
    y,
    details
  };
}

function makeAction(id: string, title: string, subtitle: string, x: number, y: number, steps: string[]) {
  const node = makeNode(id, "action", 4, title, subtitle, x, y, [
    steps[0],
    "Keep proof for portfolio: screenshots, photos, notes and feedback.",
    "Ask one adult or older student for feedback."
  ]);
  node.costKzt = 5000;
  node.implementation = createImplementation(title, steps);
  return node;
}

function makeOpportunity(
  id: string,
  title: string,
  subtitle: string,
  x: number,
  y: number,
  verified: boolean
): PersonalizedGraphNode {
  const university = verified ? findUniversityForTitle(title) : null;

  return {
    id,
    type: "opportunity",
    layer: 5,
    title,
    subtitle,
    costKzt: verified ? 20000 : 10000,
    costNote: verified
      ? "Check official requirements before applying."
      : "Needs verification: confirm organizer, deadline and requirements.",
    fundingOptions: ["School budget", "Family plan", "Local sponsor"],
    x,
    y,
    details: [
      verified ? "Use official admissions or program pages for requirements." : "Needs verification before relying on this opportunity.",
      "Compare language, exam and portfolio requirements.",
      "Save links and deadlines after checking official sources."
    ],
    sourceUrl: university?.sourceUrl,
    sourceLabel: verified ? university?.name ?? "Provided university data" : "Needs verification"
  };
}

function findUniversityForTitle(title: string) {
  const normalized = title.toLowerCase();
  return universities.find((university) => normalized.includes(university.id) || normalized.includes(university.name.toLowerCase()));
}

function createImplementation(goal: string, steps: string[]): ImplementationPlan {
  return {
    goal,
    estimatedTime: "2-4 weeks",
    difficulty: "medium",
    steps: steps.map((step, index) => ({
      title: `Step ${index + 1}`,
      whatToDo: step,
      whoToTalkTo: index === 0 ? "Informatics teacher or class mentor" : "Teacher, teammate or older student",
      expectedOutput: index === steps.length - 1 ? "Portfolio-ready proof and short reflection." : "A visible draft or note.",
      timeEstimate: index === 0 ? "1-2 days" : "3-5 days"
    })),
    checklist: ["Pick one clear problem", "Create a small artifact", "Collect feedback", "Save proof"],
    requiredPeople: ["Teacher or mentor", "One feedback giver"],
    requiredMaterials: ["Phone or computer access", "Notebook", "Internet when available"],
    risks: ["Scope may become too large", "Internet access may be unstable"],
    evidenceForPortfolio: ["Screenshots or photos", "Short project description", "Feedback note"],
    next7Days: ["Choose the problem", "Make the first draft", "Ask for feedback"],
    generatedAt: new Date().toISOString()
  };
}

function sanitizeImplementation(value: unknown, title: string): ImplementationPlan {
  const source = typeof value === "object" && value !== null ? (value as Partial<ImplementationPlan>) : {};
  const steps = Array.isArray(source.steps)
    ? source.steps
        .map((step) => (typeof step === "object" && step !== null ? step : null))
        .filter(Boolean)
        .slice(0, 6)
    : [];

  if (!steps.length) return createImplementation(title, [`Create a practical draft for ${title}.`, "Collect feedback and proof."]);

  return {
    goal: String(source.goal || title).slice(0, 160),
    estimatedTime: String(source.estimatedTime || "2-4 weeks").slice(0, 80),
    difficulty: source.difficulty === "easy" || source.difficulty === "hard" ? source.difficulty : "medium",
    steps: steps.map((step) => {
      const item = step as Record<string, unknown>;
      return {
        title: String(item.title || "Action step").slice(0, 80),
        whatToDo: String(item.whatToDo || "Make a small visible draft.").slice(0, 220),
        whoToTalkTo: String(item.whoToTalkTo || "Teacher or mentor").slice(0, 160),
        expectedOutput: String(item.expectedOutput || "A portfolio-ready proof item.").slice(0, 180),
        timeEstimate: String(item.timeEstimate || "2-3 days").slice(0, 80)
      };
    }),
    checklist: normalizeStringArray(source.checklist, 8),
    requiredPeople: normalizeStringArray(source.requiredPeople, 6),
    requiredMaterials: normalizeStringArray(source.requiredMaterials, 6),
    risks: normalizeStringArray(source.risks, 6),
    evidenceForPortfolio: normalizeStringArray(source.evidenceForPortfolio, 6),
    next7Days: normalizeStringArray(source.next7Days, 7),
    generatedAt: new Date().toISOString()
  };
}

function normalizeDetails(details: unknown) {
  if (Array.isArray(details)) return details.map(String).filter(Boolean).slice(0, 4);
  if (typeof details === "string" && details.trim()) return [details.trim()];
  return ["Personalized from your diagnostic quiz."];
}

function normalizeStringArray(value: unknown, limit: number) {
  return Array.isArray(value) ? value.map(String).filter(Boolean).slice(0, limit) : [];
}

function normalizeCostNote(costNote: unknown, type: PersonalizedGraphNode["type"], hasVerifiedSource: boolean) {
  const note = typeof costNote === "string" && costNote.trim() ? costNote.trim() : "Personalized estimate.";
  if (type === "opportunity" && !hasVerifiedSource && !/needs verification/i.test(note)) {
    return `Needs verification: ${note}`;
  }
  return note.slice(0, 140);
}

function createBasedOn(user: UserAccount) {
  return {
    grade: user.grade,
    region: user.region,
    language: user.language,
    selectedGoals: user.data.selectedGoals,
    quizAnswers: user.data.quizAnswers
  };
}

function parseGrade(grade: string) {
  const match = grade.match(/\d+/);
  return match ? Number(match[0]) : 9;
}

function normalizeLayer(layer: number, type: PersonalizedGraphNode["type"]) {
  if (layer === 2 || layer === 3 || layer === 4 || layer === 5) return layer;
  if (type === "direction") return 2;
  if (type === "skill") return 3;
  if (type === "action") return 4;
  return 5;
}

function layerToX(layer: PersonalizedGraphNode["layer"]) {
  return { 1: 40, 2: 250, 3: 492, 4: 742, 5: 986 }[layer];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);

  return slug || `personalized-${Date.now()}`;
}

function stripJsonFence(text: string) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { error?: { message?: string } };
    return data.error?.message;
  } catch {
    return "";
  }
}
