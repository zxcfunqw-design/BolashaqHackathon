export type GraphNodeType = "student" | "direction" | "skill" | "action" | "opportunity";

export type GraphLayer = 1 | 2 | 3 | 4 | 5;

export type UniversityGraphNode = {
  id: string;
  type: GraphNodeType;
  layer: GraphLayer;
  title: string;
  subtitle: string;
  costKzt: number;
  costNote?: string;
  fundingOptions?: string[];
  x: number;
  y: number;
  details: string[];
  sourceUrl?: string;
  sourceLabel?: string;
};

export type UniversityGraphEdge = {
  id: string;
  from: string;
  to: string;
  label?: string;
  tone?: "primary" | "blue" | "yellow" | "green" | "muted";
};

export const graphBoard = {
  width: 1180,
  height: 720
};

const baseUniversityGraphNodes: Array<
  Omit<UniversityGraphNode, "costKzt" | "costNote" | "fundingOptions">
> = [
  {
    id: "you",
    type: "student",
    layer: 1,
    title: "You",
    subtitle: "IT + Engineering path",
    x: 40,
    y: 314,
    details: [
      "Interests: IT, physics, robotics and practical projects.",
      "Format: phone-first path that still works with weak internet.",
      "Goal: choose a direction, skill, action and university endpoint."
    ]
  },
  {
    id: "ai-engineer",
    type: "direction",
    layer: 2,
    title: "AI Engineer",
    subtitle: "Best fit from diagnostic answers",
    x: 250,
    y: 96,
    details: [
      "Good match for students who enjoy math, logic and Python.",
      "Starts with simple models, chatbots and data analysis.",
      "Can lead to AI, Data Science and Computer Science programs."
    ]
  },
  {
    id: "software-engineer",
    type: "direction",
    layer: 2,
    title: "Software Engineer",
    subtitle: "Products, web and backend",
    x: 250,
    y: 314,
    details: [
      "Good match for students who like building useful apps.",
      "Starts with a Telegram bot, website or small service.",
      "Can lead to Software Engineering and Information Systems."
    ]
  },
  {
    id: "robotics-engineer",
    type: "direction",
    layer: 2,
    title: "Robotics Engineer",
    subtitle: "Physics, IoT and devices",
    x: 250,
    y: 532,
    details: [
      "Good match for students who enjoy physics, circuits and prototypes.",
      "Starts with a sensor simulation or Arduino-style project.",
      "Can lead to Robotics, Automation and Engineering programs."
    ]
  },
  {
    id: "ai-python",
    type: "skill",
    layer: 3,
    title: "Python",
    subtitle: "Code for AI and data",
    x: 492,
    y: 68,
    details: [
      "Variables, loops, functions and working with files.",
      "Mini libraries: pandas, matplotlib or simple APIs.",
      "Goal: write small scripts without fear."
    ]
  },
  {
    id: "ai-math",
    type: "skill",
    layer: 3,
    title: "Math",
    subtitle: "Logic, algebra and probability",
    x: 492,
    y: 172,
    details: [
      "Algebra, graphs, percentages and probability basics.",
      "Practice through ENT-style tasks and olympiad explanations.",
      "Goal: understand why a model produces a result."
    ]
  },
  {
    id: "ai-english",
    type: "skill",
    layer: 3,
    title: "English",
    subtitle: "Documentation and applications",
    x: 492,
    y: 276,
    details: [
      "Technical vocabulary and reading contest rules.",
      "Short project descriptions for portfolios.",
      "Goal: read university and course materials confidently."
    ]
  },
  {
    id: "software-js",
    type: "skill",
    layer: 3,
    title: "Web basics",
    subtitle: "HTML, CSS, JavaScript",
    x: 492,
    y: 276,
    details: [
      "Pages, forms, simple state and responsive layout.",
      "Practice through small school services.",
      "Goal: build the first working interface."
    ]
  },
  {
    id: "software-api",
    type: "skill",
    layer: 3,
    title: "Backend/API",
    subtitle: "Data and service logic",
    x: 492,
    y: 380,
    details: [
      "Requests, JSON, persistence and server logic.",
      "Practice through a bot, schedule or catalog.",
      "Goal: understand how an app works inside."
    ]
  },
  {
    id: "software-product",
    type: "skill",
    layer: 3,
    title: "Product thinking",
    subtitle: "Problem, user and result",
    x: 492,
    y: 484,
    details: [
      "Find a real problem at school or in the community.",
      "Describe the user and validate the idea.",
      "Goal: build not just code, but a useful product."
    ]
  },
  {
    id: "robotics-physics",
    type: "skill",
    layer: 3,
    title: "Physics",
    subtitle: "Electricity and mechanics",
    x: 492,
    y: 380,
    details: [
      "Force, motion, electric circuits and simple calculations.",
      "Practice through experiments and simulations.",
      "Goal: explain how the device behaves."
    ]
  },
  {
    id: "robotics-iot",
    type: "skill",
    layer: 3,
    title: "IoT basics",
    subtitle: "Sensors and automation",
    x: 492,
    y: 484,
    details: [
      "Sensor, signal, condition and action.",
      "Practice through Arduino or Tinkercad simulation.",
      "Goal: create a clear prototype story."
    ]
  },
  {
    id: "robotics-cad",
    type: "skill",
    layer: 3,
    title: "3D/CAD",
    subtitle: "Model and assembly",
    x: 492,
    y: 588,
    details: [
      "Sketch, dimensions and simple construction.",
      "Practice through a sensor case or small model.",
      "Goal: show engineering thinking."
    ]
  },
  {
    id: "ai-bot",
    type: "action",
    layer: 4,
    title: "Build a Telegram bot",
    subtitle: "AI assistant for school",
    x: 734,
    y: 58,
    details: [
      "Bot answers common student questions.",
      "Start with rules, menu and simple text flows.",
      "Portfolio proof: problem, solution, screenshots and feedback."
    ]
  },
  {
    id: "ai-data",
    type: "action",
    layer: 4,
    title: "Build a data dashboard",
    subtitle: "Study, clubs or community data",
    x: 734,
    y: 188,
    details: [
      "Collect a table and show conclusions with charts.",
      "Use school data or open data.",
      "Portfolio proof: dataset, insights and visualizations."
    ]
  },
  {
    id: "ai-olympiad",
    type: "action",
    layer: 4,
    title: "Join an olympiad",
    subtitle: "Prepare for upcoming months",
    x: 734,
    y: 318,
    details: [
      "Choose math, informatics or a project contest.",
      "Save the deadline and preparation plan.",
      "Portfolio proof: certificate, solved tasks and reflection."
    ]
  },
  {
    id: "software-local-event",
    type: "action",
    layer: 4,
    title: "Launch a local event tool",
    subtitle: "Registration and schedule",
    x: 734,
    y: 298,
    details: [
      "Create a registration form for a school event.",
      "Add participant list and schedule.",
      "Portfolio proof: real users and measurable result."
    ]
  },
  {
    id: "software-hackathon",
    type: "action",
    layer: 4,
    title: "Go to a hackathon",
    subtitle: "Team, MVP and presentation",
    x: 734,
    y: 428,
    details: [
      "Choose an online or hybrid format.",
      "Build an MVP in one or two weeks.",
      "Portfolio proof: demo, role in team and outcome."
    ]
  },
  {
    id: "robotics-sensor",
    type: "action",
    layer: 4,
    title: "Build a sensor prototype",
    subtitle: "Smart greenhouse or classroom",
    x: 734,
    y: 428,
    details: [
      "Simulate temperature or humidity sensing.",
      "Describe value for school, family or community.",
      "Portfolio proof: scheme, logic, photo or video."
    ]
  },
  {
    id: "robotics-demo-day",
    type: "action",
    layer: 4,
    title: "Run a demo day",
    subtitle: "Local engineering presentation",
    x: 734,
    y: 558,
    details: [
      "Show the prototype to a teacher or class.",
      "Collect questions and improve the project.",
      "Portfolio proof: feedback, next iteration and learning."
    ]
  },
  {
    id: "aitu",
    type: "opportunity",
    layer: 5,
    title: "Astana IT University",
    subtitle: "CS, Software Engineering, AI",
    x: 986,
    y: 86,
    details: [
      "Strong endpoint for AI and Software paths.",
      "Good proof: bot, dashboard or web project.",
      "Useful to strengthen math, informatics and English."
    ],
    sourceUrl: "https://astanait.edu.kz/en/bachelor/",
    sourceLabel: "AITU bachelor programs"
  },
  {
    id: "nu",
    type: "opportunity",
    layer: 5,
    title: "Nazarbayev University",
    subtitle: "Engineering and Digital Sciences",
    x: 986,
    y: 248,
    details: [
      "Strong endpoint for research-heavy paths.",
      "Good fit for AI, robotics and engineering.",
      "Important to show academic foundation and projects."
    ],
    sourceUrl: "https://old.nu.edu.kz/admissions/undergraduate-eng",
    sourceLabel: "NU undergraduate"
  },
  {
    id: "satbayev",
    type: "opportunity",
    layer: 5,
    title: "Satbayev University",
    subtitle: "Automation, Robotics, CS",
    x: 986,
    y: 410,
    details: [
      "Strong endpoint for hardware, IoT and robotics.",
      "A sensor or engineering-scheme portfolio is especially useful.",
      "Good fit for technical and industrial trajectories."
    ],
    sourceUrl: "https://official.satbayev.university/en/programs",
    sourceLabel: "Satbayev education programs"
  },
  {
    id: "kbtu",
    type: "opportunity",
    layer: 5,
    title: "KBTU",
    subtitle: "IT, engineering, English-medium",
    x: 986,
    y: 572,
    details: [
      "Strong endpoint for software and industry tracks.",
      "Useful proof: English, web/API and product project.",
      "A hackathon MVP can show teamwork and execution."
    ],
    sourceUrl:
      "https://kbtu.edu.kz/en/schools/school-of-information-technology-and-engineering/bachelor-s-educational-programs-of-the-school-of-information-technology-and-engineering",
    sourceLabel: "KBTU SITE programs"
  }
];

const nodeFinance: Record<
  string,
  Pick<UniversityGraphNode, "costKzt" | "costNote" | "fundingOptions">
> = {
  you: {
    costKzt: 0,
    costNote: "Profile setup is free.",
    fundingOptions: ["No funding needed"]
  },
  "ai-engineer": {
    costKzt: 0,
    costNote: "Career direction choice.",
    fundingOptions: ["No funding needed"]
  },
  "software-engineer": {
    costKzt: 0,
    costNote: "Career direction choice.",
    fundingOptions: ["No funding needed"]
  },
  "robotics-engineer": {
    costKzt: 0,
    costNote: "Career direction choice.",
    fundingOptions: ["No funding needed"]
  },
  "ai-python": {
    costKzt: 12000,
    costNote: "Phone-friendly Python course, mobile data and practice materials.",
    fundingOptions: ["Free YouTube/Coursera audit", "School computer club", "Family micro-budget"]
  },
  "ai-math": {
    costKzt: 18000,
    costNote: "ENT/olympiad practice set and tutoring reserve.",
    fundingOptions: ["School teacher support", "Free online problem banks", "Local sponsor"]
  },
  "ai-english": {
    costKzt: 20000,
    costNote: "English prep materials and speaking practice.",
    fundingOptions: ["Free language clubs", "Library resources", "Family micro-budget"]
  },
  "software-js": {
    costKzt: 10000,
    costNote: "Web basics course and hosting experiments.",
    fundingOptions: ["FreeCodeCamp", "GitHub Pages", "School computer lab"]
  },
  "software-api": {
    costKzt: 14000,
    costNote: "Backend/API practice, database sandbox and deployment reserve.",
    fundingOptions: ["Free cloud tier", "Teacher mentor", "Hackathon credits"]
  },
  "software-product": {
    costKzt: 5000,
    costNote: "User interviews, printing and presentation materials.",
    fundingOptions: ["School project budget", "Team split", "No-code free tools"]
  },
  "robotics-physics": {
    costKzt: 12000,
    costNote: "Physics prep materials and simple experiment supplies.",
    fundingOptions: ["School lab", "Teacher support", "Reused materials"]
  },
  "robotics-iot": {
    costKzt: 30000,
    costNote: "Sensors, wires or simulator upgrade budget.",
    fundingOptions: ["Tinkercad simulation", "Borrowed Arduino kit", "Mini-grant"]
  },
  "robotics-cad": {
    costKzt: 15000,
    costNote: "CAD practice, model printing reserve or materials.",
    fundingOptions: ["Free CAD software", "School makerspace", "Local sponsor"]
  },
  "ai-bot": {
    costKzt: 7000,
    costNote: "Bot hosting, internet and demo materials.",
    fundingOptions: ["Free hosting tier", "School server", "Team split"]
  },
  "ai-data": {
    costKzt: 9000,
    costNote: "Dataset preparation, charts and presentation.",
    fundingOptions: ["Open data", "Free spreadsheet tools", "Teacher mentor"]
  },
  "ai-olympiad": {
    costKzt: 25000,
    costNote: "Registration/travel reserve and preparation materials.",
    fundingOptions: ["School contest budget", "District support", "Grant application"]
  },
  "software-local-event": {
    costKzt: 12000,
    costNote: "Event materials, forms, printing and local logistics.",
    fundingOptions: ["School budget", "Community partner", "Free digital forms"]
  },
  "software-hackathon": {
    costKzt: 22000,
    costNote: "Hackathon registration, transport or demo reserve.",
    fundingOptions: ["Free online hackathons", "Team split", "Sponsor reimbursement"]
  },
  "robotics-sensor": {
    costKzt: 42000,
    costNote: "Sensor prototype materials or replacement parts.",
    fundingOptions: ["Borrowed kit", "Mini-grant", "Local business sponsor"]
  },
  "robotics-demo-day": {
    costKzt: 14000,
    costNote: "Demo stand, poster and local presentation materials.",
    fundingOptions: ["School event budget", "Reused materials", "Parent committee"]
  },
  aitu: {
    costKzt: 850000,
    costNote: "Estimated first-year self-funded university budget placeholder.",
    fundingOptions: ["State grant", "University scholarship", "Part-time tech work", "Family plan"]
  },
  nu: {
    costKzt: 150000,
    costNote: "Grant-focused route placeholder; includes application, test prep and travel reserve, not tuition.",
    fundingOptions: ["NU grant", "Need-based support", "External scholarship"]
  },
  satbayev: {
    costKzt: 720000,
    costNote: "Estimated first-year self-funded engineering budget placeholder.",
    fundingOptions: ["State grant", "University discount", "Regional sponsor", "Family plan"]
  },
  kbtu: {
    costKzt: 1100000,
    costNote: "Estimated first-year self-funded IT/engineering budget placeholder.",
    fundingOptions: ["State grant", "Merit scholarship", "Corporate scholarship", "Part-time work"]
  }
};

const defaultFinance: Pick<UniversityGraphNode, "costKzt" | "costNote" | "fundingOptions"> = {
  costKzt: 0,
  costNote: "Cost is not estimated yet.",
  fundingOptions: ["Clarify with school mentor"]
};

export const universityGraphNodes: UniversityGraphNode[] = baseUniversityGraphNodes.map((node) => ({
  ...node,
  ...(nodeFinance[node.id] ?? defaultFinance)
}));

export const universityGraphEdges: UniversityGraphEdge[] = [
  { id: "you-ai", from: "you", to: "ai-engineer", label: "top match", tone: "primary" },
  { id: "you-software", from: "you", to: "software-engineer", label: "product", tone: "blue" },
  { id: "you-robotics", from: "you", to: "robotics-engineer", label: "physics", tone: "green" },
  { id: "ai-python", from: "ai-engineer", to: "ai-python", tone: "primary" },
  { id: "ai-math", from: "ai-engineer", to: "ai-math", tone: "primary" },
  { id: "ai-english", from: "ai-engineer", to: "ai-english", tone: "primary" },
  { id: "software-js", from: "software-engineer", to: "software-js", tone: "blue" },
  { id: "software-api", from: "software-engineer", to: "software-api", tone: "blue" },
  { id: "software-product", from: "software-engineer", to: "software-product", tone: "blue" },
  { id: "robotics-physics", from: "robotics-engineer", to: "robotics-physics", tone: "green" },
  { id: "robotics-iot", from: "robotics-engineer", to: "robotics-iot", tone: "green" },
  { id: "robotics-cad", from: "robotics-engineer", to: "robotics-cad", tone: "green" },
  { id: "python-bot", from: "ai-python", to: "ai-bot", tone: "primary" },
  { id: "python-data", from: "ai-python", to: "ai-data", tone: "primary" },
  { id: "math-olympiad", from: "ai-math", to: "ai-olympiad", tone: "yellow" },
  { id: "english-olympiad", from: "ai-english", to: "ai-olympiad", tone: "yellow" },
  { id: "js-event", from: "software-js", to: "software-local-event", tone: "blue" },
  { id: "api-event", from: "software-api", to: "software-local-event", tone: "blue" },
  { id: "product-hackathon", from: "software-product", to: "software-hackathon", tone: "yellow" },
  { id: "physics-sensor", from: "robotics-physics", to: "robotics-sensor", tone: "green" },
  { id: "iot-sensor", from: "robotics-iot", to: "robotics-sensor", tone: "green" },
  { id: "cad-demo", from: "robotics-cad", to: "robotics-demo-day", tone: "green" },
  { id: "bot-aitu", from: "ai-bot", to: "aitu", tone: "primary" },
  { id: "data-nu", from: "ai-data", to: "nu", tone: "primary" },
  { id: "olympiad-nu", from: "ai-olympiad", to: "nu", tone: "yellow" },
  { id: "event-kbtu", from: "software-local-event", to: "kbtu", tone: "blue" },
  { id: "hackathon-aitu", from: "software-hackathon", to: "aitu", tone: "yellow" },
  { id: "hackathon-kbtu", from: "software-hackathon", to: "kbtu", tone: "yellow" },
  { id: "sensor-satbayev", from: "robotics-sensor", to: "satbayev", tone: "green" },
  { id: "sensor-nu", from: "robotics-sensor", to: "nu", tone: "green" },
  { id: "demo-satbayev", from: "robotics-demo-day", to: "satbayev", tone: "green" }
];
