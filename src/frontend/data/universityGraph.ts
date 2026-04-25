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
    title: "Ты",
    subtitle: "IT + Engineering path",
    x: 40,
    y: 314,
    details: [
      "Интересы: IT, физика, робототехника",
      "Формат: phone-first, слабый интернет",
      "Цель: выбрать направление, навыки, действия и вузовый результат"
    ]
  },
  {
    id: "ai-engineer",
    type: "direction",
    layer: 2,
    title: "AI Engineer",
    subtitle: "Лучший fit по тесту",
    x: 250,
    y: 96,
    details: [
      "Подходит, если нравятся математика, логика и Python",
      "Можно начать с простых моделей, чат-ботов и анализа данных",
      "Дальше путь ведет к AI, Data Science и Computer Science программам"
    ]
  },
  {
    id: "software-engineer",
    type: "direction",
    layer: 2,
    title: "Software Engineer",
    subtitle: "Продукты, web, backend",
    x: 250,
    y: 314,
    details: [
      "Подходит, если нравится собирать полезные приложения",
      "Можно начать с Telegram-бота, сайта или маленького сервиса",
      "Дальше путь ведет к Software Engineering и Information Systems"
    ]
  },
  {
    id: "robotics-engineer",
    type: "direction",
    layer: 2,
    title: "Robotics Engineer",
    subtitle: "Физика, IoT, устройства",
    x: 250,
    y: 532,
    details: [
      "Подходит, если нравятся физика, схемы и реальные прототипы",
      "Можно начать с симуляции датчика или Arduino-проекта",
      "Дальше путь ведет к Robotics, Automation и Engineering"
    ]
  },
  {
    id: "ai-python",
    type: "skill",
    layer: 3,
    title: "Python",
    subtitle: "Код для AI и данных",
    x: 492,
    y: 68,
    details: [
      "Переменные, циклы, функции, работа с файлами",
      "Мини-библиотеки: pandas, matplotlib или простые API",
      "Цель: писать маленькие скрипты без страха"
    ]
  },
  {
    id: "ai-math",
    type: "skill",
    layer: 3,
    title: "Математика",
    subtitle: "Логика, алгебра, вероятность",
    x: 492,
    y: 172,
    details: [
      "Алгебра, графики, проценты, вероятность",
      "Практика через задачи ЕНТ и олимпиадные разборы",
      "Цель: понимать, почему модель дает результат"
    ]
  },
  {
    id: "ai-english",
    type: "skill",
    layer: 3,
    title: "Английский язык",
    subtitle: "Документация и заявки",
    x: 492,
    y: 276,
    details: [
      "Технические слова, чтение условий конкурсов",
      "Короткие описания проекта для портфолио",
      "Цель: спокойно читать материалы вузов и курсов"
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
      "Страница, формы, простое состояние",
      "Практика через мини-сервисы для школы",
      "Цель: собрать первый рабочий интерфейс"
    ]
  },
  {
    id: "software-api",
    type: "skill",
    layer: 3,
    title: "Backend/API",
    subtitle: "Данные и логика сервиса",
    x: 492,
    y: 380,
    details: [
      "Запросы, JSON, хранение данных",
      "Практика через бота, расписание или каталог",
      "Цель: понять, как приложение работает внутри"
    ]
  },
  {
    id: "software-product",
    type: "skill",
    layer: 3,
    title: "Product thinking",
    subtitle: "Проблема, пользователь, результат",
    x: 492,
    y: 484,
    details: [
      "Найти проблему в школе или селе",
      "Описать пользователя и проверить идею",
      "Цель: делать не просто код, а полезный продукт"
    ]
  },
  {
    id: "robotics-physics",
    type: "skill",
    layer: 3,
    title: "Физика",
    subtitle: "Электричество и механика",
    x: 492,
    y: 380,
    details: [
      "Сила, движение, электрические цепи",
      "Практика через простые расчеты и симуляции",
      "Цель: понимать поведение устройства"
    ]
  },
  {
    id: "robotics-iot",
    type: "skill",
    layer: 3,
    title: "IoT basics",
    subtitle: "Датчики и автоматизация",
    x: 492,
    y: 484,
    details: [
      "Датчик, сигнал, условие, действие",
      "Практика через Arduino/Tinkercad simulation",
      "Цель: собрать понятный prototype story"
    ]
  },
  {
    id: "robotics-cad",
    type: "skill",
    layer: 3,
    title: "3D/CAD",
    subtitle: "Модель и сборка",
    x: 492,
    y: 588,
    details: [
      "Эскиз, размеры, простая конструкция",
      "Практика через корпус датчика или макет",
      "Цель: показать инженерное мышление"
    ]
  },
  {
    id: "ai-bot",
    type: "action",
    layer: 4,
    title: "Сделать Telegram-бота",
    subtitle: "AI-помощник для школы",
    x: 734,
    y: 58,
    details: [
      "Бот отвечает на частые вопросы учеников",
      "Можно начать с правил, меню и простого текста",
      "Портфолио: проблема, решение, скриншоты, отзыв"
    ]
  },
  {
    id: "ai-data",
    type: "action",
    layer: 4,
    title: "Собрать data dashboard",
    subtitle: "Учеба, кружки или село",
    x: 734,
    y: 188,
    details: [
      "Собрать таблицу и показать выводы графиками",
      "Можно взять школьные или открытые данные",
      "Портфолио: dataset, выводы, визуализация"
    ]
  },
  {
    id: "ai-olympiad",
    type: "action",
    layer: 4,
    title: "Участвовать в олимпиаде",
    subtitle: "Подготовка на ближайшие месяцы",
    x: 734,
    y: 318,
    details: [
      "Выбрать математику, информатику или проектный конкурс",
      "Сохранить дедлайн и план подготовки",
      "Портфолио: сертификат, решение, рефлексия"
    ]
  },
  {
    id: "software-local-event",
    type: "action",
    layer: 4,
    title: "Запустить локальное мероприятие",
    subtitle: "Регистрация и расписание",
    x: 734,
    y: 298,
    details: [
      "Сделать форму регистрации для школьного события",
      "Добавить список участников и расписание",
      "Портфолио: реальный пользователь и результат"
    ]
  },
  {
    id: "software-hackathon",
    type: "action",
    layer: 4,
    title: "Пойти на хакатон",
    subtitle: "Команда, MVP, презентация",
    x: 734,
    y: 428,
    details: [
      "Выбрать онлайн или гибридный формат",
      "Собрать MVP за 1-2 недели",
      "Портфолио: демо, роль в команде, итог"
    ]
  },
  {
    id: "robotics-sensor",
    type: "action",
    layer: 4,
    title: "Собрать sensor prototype",
    subtitle: "Умная теплица или класс",
    x: 734,
    y: 428,
    details: [
      "Симулировать датчик температуры/влажности",
      "Описать пользу для школы или семьи",
      "Портфолио: схема, логика, фото/видео"
    ]
  },
  {
    id: "robotics-demo-day",
    type: "action",
    layer: 4,
    title: "Провести demo day",
    subtitle: "Локальная инженерная защита",
    x: 734,
    y: 558,
    details: [
      "Показать прототип учителю или классу",
      "Собрать вопросы и улучшить проект",
      "Портфолио: feedback, next iteration, learning"
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
      "Сильный финал для AI/Software пути",
      "Можно показать бота, dashboard или web-проект",
      "Полезно усилить математику, информатику и английский"
    ],
    sourceUrl: "https://astanait.edu.kz/en/bachelor/",
    sourceLabel: "AITU Bachelor programs"
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
      "Сильный финал для research-heavy пути",
      "Подходит для AI, robotics и engineering",
      "Важно показывать академическую базу и проекты"
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
      "Сильный финал для hardware, IoT и robotics",
      "Портфолио с датчиком или инженерной схемой особенно полезно",
      "Подходит для технических и индустриальных траекторий"
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
      "Сильный финал для software + industry track",
      "Полезны английский, web/API и продуктовый проект",
      "Можно показать MVP, хакатон и командную роль"
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
    costKzt: 0,
    costNote: "Grant-focused route placeholder; scholarship competition is required.",
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
