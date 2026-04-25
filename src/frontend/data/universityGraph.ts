export type GraphNodeType = "student" | "career" | "university" | "route";

export type UniversityGraphNode = {
  id: string;
  type: GraphNodeType;
  title: string;
  subtitle: string;
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
  tone?: "primary" | "blue" | "yellow" | "muted";
};

export const universityGraphNodes: UniversityGraphNode[] = [
  {
    id: "you",
    type: "student",
    title: "Ты",
    subtitle: "IT + Engineering path",
    x: 60,
    y: 300,
    details: [
      "Интересы: IT, physics, robotics",
      "Доступ: phone-first, weak internet",
      "Цель: выбрать профессию и вузовый маршрут"
    ]
  },
  {
    id: "software-engineer",
    type: "career",
    title: "Software Engineer",
    subtitle: "Web, mobile, backend",
    x: 265,
    y: 110,
    details: [
      "Подходит, если нравится программирование и логика",
      "Ключевые предметы: математика + информатика",
      "Мини-проект: Telegram bot или simple web app"
    ]
  },
  {
    id: "data-ai",
    type: "career",
    title: "Data / AI Specialist",
    subtitle: "Data, ML, analytics",
    x: 265,
    y: 300,
    details: [
      "Подходит для интереса к математике, статистике и Python",
      "Мини-проект: анализ данных школы или села",
      "Полезно: English + олимпиадные задачи"
    ]
  },
  {
    id: "robotics-engineer",
    type: "career",
    title: "Robotics Engineer",
    subtitle: "Sensors, IoT, automation",
    x: 265,
    y: 500,
    details: [
      "Подходит для физики, электроники и инженерных задач",
      "Ключевые предметы: математика + физика",
      "Мини-проект: sensor prototype или Arduino simulation"
    ]
  },
  {
    id: "aitu",
    type: "university",
    title: "Astana IT University",
    subtitle: "CS, Software Engineering, AI, IoT",
    x: 490,
    y: 80,
    details: [
      "Bachelor направления включают Computer Science, Software Engineering, Big Data, Cybersecurity, Smart Technologies",
      "Для IT-направлений профильные предметы часто: математика + информатика",
      "Сильный fit для software, data, cybersecurity"
    ],
    sourceUrl: "https://astanait.edu.kz/en/bachelor/",
    sourceLabel: "AITU Bachelor programs"
  },
  {
    id: "nu",
    type: "university",
    title: "Nazarbayev University",
    subtitle: "Engineering and Digital Sciences",
    x: 490,
    y: 240,
    details: [
      "Undergraduate routes include engineering and digital sciences",
      "SEDS includes Computer Science, Electrical and Computer Engineering, Robotics-related departments",
      "Strong fit for research-heavy engineering path"
    ],
    sourceUrl: "https://old.nu.edu.kz/admissions/undergraduate-eng",
    sourceLabel: "NU undergraduate"
  },
  {
    id: "satbayev",
    type: "university",
    title: "Satbayev University",
    subtitle: "Technical university, robotics, CS",
    x: 490,
    y: 410,
    details: [
      "Education programs include Automation and Robotics and Computer Science",
      "Technical focus: engineering, telecommunications, automation, robotics",
      "Good fit for hardware, industrial IoT and robotics"
    ],
    sourceUrl: "https://official.satbayev.university/en/programs",
    sourceLabel: "Satbayev education programs"
  },
  {
    id: "kbtu",
    type: "university",
    title: "KBTU",
    subtitle: "IT, engineering, English-medium",
    x: 490,
    y: 580,
    details: [
      "School of Information Technology and Engineering has bachelor programs including Automation and Control and Information Systems",
      "KBTU bachelor page highlights English-medium instruction and industry-oriented programs",
      "Good fit for software + business/industry track"
    ],
    sourceUrl:
      "https://kbtu.edu.kz/en/schools/school-of-information-technology-and-engineering/bachelor-s-educational-programs-of-the-school-of-information-technology-and-engineering",
    sourceLabel: "KBTU SITE programs"
  },
  {
    id: "route-unt",
    type: "route",
    title: "UNT focus",
    subtitle: "Math + CS or Physics",
    x: 720,
    y: 145,
    details: [
      "Software/Data: математика + информатика",
      "Robotics/engineering: математика + физика",
      "Каждую неделю: 2 small practice sets"
    ]
  },
  {
    id: "route-skills",
    type: "route",
    title: "Skill stack",
    subtitle: "Python, math, English",
    x: 720,
    y: 320,
    details: [
      "Python basics: variables, loops, functions, APIs",
      "Math: algebra, probability, logic",
      "English: technical vocabulary and application reading"
    ]
  },
  {
    id: "route-proof",
    type: "route",
    title: "Portfolio proof",
    subtitle: "Project + contest + story",
    x: 720,
    y: 500,
    details: [
      "Mini-project: bot, data dashboard or sensor prototype",
      "Opportunity: STEM hackathon or online contest",
      "Result: one polished portfolio description"
    ]
  }
];

export const universityGraphEdges: UniversityGraphEdge[] = [
  { id: "you-software", from: "you", to: "software-engineer", label: "logic", tone: "primary" },
  { id: "you-data", from: "you", to: "data-ai", label: "math", tone: "primary" },
  { id: "you-robotics", from: "you", to: "robotics-engineer", label: "physics", tone: "primary" },
  { id: "software-aitu", from: "software-engineer", to: "aitu", label: "best fit", tone: "blue" },
  { id: "software-kbtu", from: "software-engineer", to: "kbtu", tone: "muted" },
  { id: "data-aitu", from: "data-ai", to: "aitu", tone: "blue" },
  { id: "data-nu", from: "data-ai", to: "nu", tone: "blue" },
  { id: "robotics-nu", from: "robotics-engineer", to: "nu", tone: "yellow" },
  { id: "robotics-satbayev", from: "robotics-engineer", to: "satbayev", label: "technical", tone: "yellow" },
  { id: "kbtu-route", from: "kbtu", to: "route-proof", tone: "muted" },
  { id: "aitu-unt", from: "aitu", to: "route-unt", tone: "primary" },
  { id: "nu-skills", from: "nu", to: "route-skills", tone: "primary" },
  { id: "satbayev-proof", from: "satbayev", to: "route-proof", tone: "primary" },
  { id: "unt-skills", from: "route-unt", to: "route-skills", tone: "muted" },
  { id: "skills-proof", from: "route-skills", to: "route-proof", tone: "muted" }
];
