export type GraphNodeType = "student" | "direction" | "skill" | "action" | "opportunity";

export type GraphLayer = 1 | 2 | 3 | 4 | 5;

export type UniversityGraphNode = {
  id: string;
  type: GraphNodeType;
  layer: GraphLayer;
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
  tone?: "primary" | "blue" | "yellow" | "green" | "muted";
};

export const graphBoard = {
  width: 1180,
  height: 720
};

export const universityGraphNodes: UniversityGraphNode[] = [
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
