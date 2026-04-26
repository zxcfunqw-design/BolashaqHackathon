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
  height: 860
};

const baseUniversityGraphNodes: Array<
  Omit<UniversityGraphNode, "costKzt" | "costNote" | "fundingOptions">
> = [
  {
    id: "you",
    type: "student",
    layer: 1,
    title: "Никита",
    subtitle: "Школьник из Щучинска",
    x: 40,
    y: 368,
    details: [
      "Профиль из JSON: школьник из Щучинска.",
      "Тест показал несколько направлений, но полный граф готов для Python-программиста.",
      "Маршрут строится от навыков к первым проектам и вузовым целям."
    ]
  },
  {
    id: "python-programmer",
    type: "direction",
    layer: 2,
    title: "Python-программист",
    subtitle: "Полный граф рекомендаций",
    x: 250,
    y: 72,
    details: [
      "Главное направление с заполненным графом в исходном JSON.",
      "Подходит для Telegram-ботов, парсеров, backend и анализа данных.",
      "Дальше можно развивать путь в Software Engineering, Data Science или DevOps."
    ]
  },
  {
    id: "devops-engineer",
    type: "direction",
    layer: 2,
    title: "DevOps-инженер",
    subtitle: "Ожидает детализации",
    x: 250,
    y: 246,
    details: [
      "Направление найдено в результатах теста.",
      "В JSON помечено как pending_graph, поэтому пока показано как будущая ветка.",
      "Близкие базовые навыки: Python, Git, Linux и работа с документацией."
    ]
  },
  {
    id: "robotics-engineer",
    type: "direction",
    layer: 2,
    title: "Инженер",
    subtitle: "Электроника / робототехника",
    x: 250,
    y: 420,
    details: [
      "Направление найдено в результатах теста.",
      "В JSON помечено как pending_graph, поэтому требует отдельного графа навыков.",
      "Может пересекаться с Python через автоматизацию, IoT и обработку данных."
    ]
  },
  {
    id: "tech-entrepreneur",
    type: "direction",
    layer: 2,
    title: "Tech Entrepreneur",
    subtitle: "Бизнесмен в IT",
    x: 250,
    y: 594,
    details: [
      "Направление найдено в результатах теста.",
      "В JSON помечено как pending_graph, поэтому пока не раскрыто глубоко.",
      "Python-проекты можно использовать как MVP для будущей предпринимательской ветки."
    ]
  },
  {
    id: "python-basics",
    type: "skill",
    layer: 3,
    title: "Основы Python",
    subtitle: "Синтаксис, функции, классы",
    x: 492,
    y: 28,
    details: [
      "Переменные, циклы, функции, классы.",
      "Следить за стилем кода и стандартом PEP8.",
      "Цель: уверенно писать небольшие программы без копирования целиком."
    ]
  },
  {
    id: "algorithms",
    type: "skill",
    layer: 3,
    title: "Алгоритмы",
    subtitle: "Структуры данных и Big O",
    x: 492,
    y: 140,
    details: [
      "Оценка сложности Big O.",
      "Массивы, хеш-таблицы, бинарный поиск.",
      "Практика помогает для олимпиад, ЕНТ-информатики и технических интервью."
    ]
  },
  {
    id: "databases",
    type: "skill",
    layer: 3,
    title: "Базы данных",
    subtitle: "SQL, PostgreSQL, SQLite",
    x: 492,
    y: 252,
    details: [
      "Научиться хранить данные проекта не только в файлах.",
      "Начать с SQLite, затем перейти к PostgreSQL.",
      "Полезно для ботов, парсеров, каталогов и dashboard-проектов."
    ]
  },
  {
    id: "git",
    type: "skill",
    layer: 3,
    title: "Git и GitHub",
    subtitle: "clone, commit, push, pull",
    x: 492,
    y: 364,
    details: [
      "Системы контроля версий: clone, commit, push, pull.",
      "GitHub нужен как витрина кода и доказательство самостоятельной работы.",
      "Каждый учебный проект лучше вести в отдельном репозитории."
    ]
  },
  {
    id: "english",
    type: "skill",
    layer: 3,
    title: "Английский язык",
    subtitle: "B1-B2 для документации",
    x: 492,
    y: 476,
    details: [
      "Цель: B1-B2 для чтения PEP, официальной документации и StackOverflow.",
      "Полезно для IELTS/TOEFL и заявок в международные университеты.",
      "Начинать можно с технического словаря и коротких описаний проектов."
    ]
  },
  {
    id: "search-skill",
    type: "skill",
    layer: 3,
    title: "Поиск информации",
    subtitle: "Docs, StackOverflow, разбор ошибок",
    x: 492,
    y: 588,
    details: [
      "Уметь искать решения в официальной документации и StackOverflow.",
      "Формулировать ошибку, проверять версии библиотек и читать примеры.",
      "Это снижает зависимость от наставника и ускоряет обучение."
    ]
  },
  {
    id: "time-management",
    type: "skill",
    layer: 3,
    title: "Тайм-менеджмент",
    subtitle: "Декомпозиция задач",
    x: 492,
    y: 700,
    details: [
      "Разбивать большой проект на микро-задачи по 1-2 часа.",
      "Вести короткий список задач: что сделал, что сломалось, что дальше.",
      "Так проще доводить проекты до портфолио, а не бросать на середине."
    ]
  },
  {
    id: "free-course",
    type: "action",
    layer: 4,
    title: "Пройти бесплатный курс",
    subtitle: "Открытые платформы",
    x: 734,
    y: 154,
    details: [
      "Первый практический шаг из JSON.",
      "Выбрать короткий курс по Python и идти по нему с ежедневной практикой.",
      "Результат: 8-12 маленьких задач и понятная база синтаксиса."
    ]
  },
  {
    id: "telegram-bot",
    type: "action",
    layer: 4,
    title: "Написать Telegram-бота",
    subtitle: "Первый портфолио-проект",
    x: 734,
    y: 324,
    details: [
      "Первый практический проект из JSON.",
      "Бот может отвечать на вопросы школы, хранить расписание или помогать с подготовкой.",
      "Для портфолио нужны ссылка на код, скриншоты и короткое описание пользы."
    ]
  },
  {
    id: "web-parser",
    type: "action",
    layer: 4,
    title: "Создать парсер данных",
    subtitle: "Данные с веб-сайта",
    x: 734,
    y: 494,
    details: [
      "Практический шаг из JSON для закрепления Python.",
      "Парсер учит работать с HTTP, HTML, файлами и базами данных.",
      "Хороший следующий шаг: превратить собранные данные в мини-dashboard."
    ]
  },
  {
    id: "nu",
    type: "opportunity",
    layer: 5,
    title: "Назарбаев Университет",
    subtitle: "NU: dream tier",
    x: 986,
    y: 94,
    details: [
      "IELTS: Overall 6.5, минимум 6.0 по каждой секции; стоимость в РК около 100 000 тенге.",
      "NUET: 60 вопросов за 120 минут; безопасный таргет для SEDS - от 180 баллов.",
      "SAT: опционально для Direct Admission; целевой диапазон 1400+.",
      "Грант NU покрывает обучение, проживание и стипендию.",
      "Сильные extracurriculars: волонтерство 30-50 часов и олимпиады по информатике."
    ],
    sourceUrl: "https://nu.edu.kz/admissions",
    sourceLabel: "NU Admissions"
  },
  {
    id: "kaist",
    type: "opportunity",
    layer: 5,
    title: "KAIST",
    subtitle: "Южная Корея: dream tier",
    x: 986,
    y: 304,
    details: [
      "IELTS 6.5+ или TOEFL iBT 83+; рекомендуется IELTS 7.0+ или TOEFL 95+.",
      "SAT/ACT: целевой SAT 1450-1520, особенно сильный Math 780-800.",
      "KAIST International Student Scholarship покрывает tuition, страховку и дает ежемесячную стипендию.",
      "Сильные extracurriculars: международные олимпиады и 2-3 завершенных технических проекта на GitHub."
    ],
    sourceUrl: "https://admission.kaist.ac.kr/intl-undergraduate/",
    sourceLabel: "KAIST International Admissions"
  },
  {
    id: "aitu",
    type: "opportunity",
    layer: 5,
    title: "Astana IT University",
    subtitle: "AITU: regular / backup tier",
    x: 986,
    y: 514,
    details: [
      "ЕНТ: ориентир 110-115+ баллов; профильные предметы математика и информатика.",
      "Государственный грант РК и сельская квота могут покрыть обучение и дать стипендию.",
      "Внутренние гранты AITU и скидки доступны через олимпиады и соревнования вроде AITU Open.",
      "Сертификат Яндекс Лицея может усилить заявку и показать долгую Python-практику."
    ],
    sourceUrl: "https://astanait.edu.kz/en/bachelor/",
    sourceLabel: "AITU Bachelor programs"
  }
];

const nodeFinance: Record<
  string,
  Pick<UniversityGraphNode, "costKzt" | "costNote" | "fundingOptions">
> = {
  you: {
    costKzt: 0,
    costNote: "Профиль и тестовый результат уже есть в JSON.",
    fundingOptions: ["Финансирование не требуется"]
  },
  "python-programmer": {
    costKzt: 0,
    costNote: "Выбор направления.",
    fundingOptions: ["Финансирование не требуется"]
  },
  "devops-engineer": {
    costKzt: 0,
    costNote: "В JSON пока нет детального графа для этого направления.",
    fundingOptions: ["Вернуться после детализации ветки"]
  },
  "robotics-engineer": {
    costKzt: 0,
    costNote: "В JSON пока нет детального графа для этого направления.",
    fundingOptions: ["Вернуться после детализации ветки"]
  },
  "tech-entrepreneur": {
    costKzt: 0,
    costNote: "В JSON пока нет детального графа для этого направления.",
    fundingOptions: ["Вернуться после детализации ветки"]
  },
  "python-basics": {
    costKzt: 0,
    costNote: "Базу можно начать бесплатно на открытых платформах.",
    fundingOptions: ["Бесплатные курсы", "YouTube", "Школьный компьютерный класс"]
  },
  algorithms: {
    costKzt: 0,
    costNote: "Есть бесплатные задачники и разборы.",
    fundingOptions: ["Informatics.kz", "Школьный учитель", "Олимпиадные архивы"]
  },
  databases: {
    costKzt: 0,
    costNote: "SQLite и PostgreSQL можно практиковать локально бесплатно.",
    fundingOptions: ["SQLite", "PostgreSQL", "Бесплатные cloud tiers"]
  },
  git: {
    costKzt: 0,
    costNote: "Git и GitHub доступны бесплатно.",
    fundingOptions: ["GitHub", "GitHub Pages", "Школьный проект"]
  },
  english: {
    costKzt: 100000,
    costNote: "Ориентир из JSON: стоимость IELTS в РК около 100 000 тенге.",
    fundingOptions: ["Opportunity Funds", "Бесплатные language clubs", "Школьная библиотека"]
  },
  "search-skill": {
    costKzt: 0,
    costNote: "Навык развивается через практику с документацией.",
    fundingOptions: ["Официальные docs", "StackOverflow", "GitHub Issues"]
  },
  "time-management": {
    costKzt: 0,
    costNote: "Можно вести план в заметках или бесплатном таск-трекере.",
    fundingOptions: ["Заметки телефона", "Trello/Notion free", "Бумажный план"]
  },
  "free-course": {
    costKzt: 0,
    costNote: "Первый курс можно пройти бесплатно.",
    fundingOptions: ["Открытые платформы", "Coursera audit", "Stepik"]
  },
  "telegram-bot": {
    costKzt: 7000,
    costNote: "Резерв на интернет, тестовый хостинг или демонстрацию.",
    fundingOptions: ["Free hosting tier", "Школьный сервер", "Командный бюджет"]
  },
  "web-parser": {
    costKzt: 5000,
    costNote: "Резерв на интернет и хранение результатов.",
    fundingOptions: ["Локальные файлы", "SQLite", "Бесплатный хостинг"]
  },
  nu: {
    costKzt: 100000,
    costNote: "В path cost заложен IELTS из JSON; обучение целится в грант NU.",
    fundingOptions: ["Грант NU", "Opportunity Funds", "Yessenov Foundation"]
  },
  kaist: {
    costKzt: 0,
    costNote: "Маршрут целится в KAIST International Student Scholarship.",
    fundingOptions: ["KAIST Scholarship", "Олимпиадное портфолио", "GitHub-проекты"]
  },
  aitu: {
    costKzt: 0,
    costNote: "Маршрут целится в государственный грант РК или внутренний грант AITU.",
    fundingOptions: ["Государственный грант РК", "Сельская квота", "AITU Open"]
  }
};

const defaultFinance: Pick<UniversityGraphNode, "costKzt" | "costNote" | "fundingOptions"> = {
  costKzt: 0,
  costNote: "Стоимость пока не оценена.",
  fundingOptions: ["Уточнить с наставником"]
};

export const universityGraphNodes: UniversityGraphNode[] = baseUniversityGraphNodes.map((node) => ({
  ...node,
  ...(nodeFinance[node.id] ?? defaultFinance)
}));

export const universityGraphEdges: UniversityGraphEdge[] = [
  { id: "you-python", from: "you", to: "python-programmer", label: "готовый граф", tone: "primary" },
  { id: "you-devops", from: "you", to: "devops-engineer", label: "pending", tone: "muted" },
  { id: "you-robotics", from: "you", to: "robotics-engineer", label: "pending", tone: "green" },
  { id: "you-business", from: "you", to: "tech-entrepreneur", label: "pending", tone: "yellow" },
  { id: "python-basics", from: "python-programmer", to: "python-basics", tone: "primary" },
  { id: "python-algorithms", from: "python-programmer", to: "algorithms", tone: "primary" },
  { id: "python-databases", from: "python-programmer", to: "databases", tone: "blue" },
  { id: "python-git", from: "python-programmer", to: "git", tone: "blue" },
  { id: "python-english", from: "python-programmer", to: "english", tone: "yellow" },
  { id: "python-search", from: "python-programmer", to: "search-skill", tone: "green" },
  { id: "python-time", from: "python-programmer", to: "time-management", tone: "green" },
  { id: "basics-course", from: "python-basics", to: "free-course", tone: "primary" },
  { id: "basics-bot", from: "python-basics", to: "telegram-bot", tone: "primary" },
  { id: "databases-parser", from: "databases", to: "web-parser", tone: "blue" },
  { id: "git-bot", from: "git", to: "telegram-bot", tone: "blue" },
  { id: "algorithms-course", from: "algorithms", to: "free-course", tone: "primary" },
  { id: "english-nu", from: "english", to: "nu", tone: "yellow" },
  { id: "course-aitu", from: "free-course", to: "aitu", tone: "green" },
  { id: "bot-aitu", from: "telegram-bot", to: "aitu", tone: "primary" },
  { id: "bot-nu", from: "telegram-bot", to: "nu", tone: "primary" },
  { id: "parser-aitu", from: "web-parser", to: "aitu", tone: "blue" },
  { id: "parser-kaist", from: "web-parser", to: "kaist", tone: "blue" },
  { id: "parser-nu", from: "web-parser", to: "nu", tone: "primary" }
];
