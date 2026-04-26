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
  height: 1100
};

export const universityGraphNodes: UniversityGraphNode[] = [
  {
    id: "you",
    type: "student",
    layer: 1,
    title: "Ученик",
    subtitle: "Профиль, тесты и цели",
    costKzt: 0,
    costNote: "Стартовая вершина: регистрационные данные и результаты тестов уже есть в профиле.",
    fundingOptions: ["Финансирование не требуется"],
    x: 40,
    y: 430,
    details: [
      "Профиль строится из школы, класса, региона, целей, диагностического опроса и Holland-теста.",
      "Граф можно расширять: один ученик может идти к нескольким вузам через разные навыки и проекты.",
      "Финансовый калькулятор считает путь DFS от этой вершины до выбранного вуза."
    ]
  },
  {
    id: "python-programmer",
    type: "direction",
    layer: 2,
    title: "Python-программист",
    subtitle: "Готовый детальный маршрут",
    costKzt: 0,
    costNote: "Выбор направления не требует бюджета, но влияет на набор навыков и проектов.",
    fundingOptions: ["Профориентация", "Школьный наставник"],
    x: 250,
    y: 40,
    details: [
      "Подходит для Telegram-ботов, парсеров, backend-сервисов и анализа данных.",
      "Маршрут можно развивать в Software Engineering, Data Science или DevOps.",
      "Сильное портфолио: код на GitHub, README, демонстрация и короткое описание роли ученика."
    ]
  },
  {
    id: "ai-engineer",
    type: "direction",
    layer: 2,
    title: "AI Engineer",
    subtitle: "Совместимо со старым маршрутом",
    costKzt: 0,
    costNote: "AI-трек начинается с Python, математики и честных маленьких проектов.",
    fundingOptions: ["Бесплатные курсы", "Олимпиадные архивы"],
    x: 250,
    y: 184,
    details: [
      "Сохраняет старые сохраненные маршруты пользователей после merge.",
      "Фокус: Python, логика, данные, простые модели и объяснение результата.",
      "Хорошо связывается с NU, AITU и международными scholarship-треками."
    ]
  },
  {
    id: "devops-engineer",
    type: "direction",
    layer: 2,
    title: "DevOps-инженер",
    subtitle: "Будущая ветка",
    costKzt: 0,
    costNote: "Пока показываем как альтернативу, которую можно расширить AI-генератором.",
    fundingOptions: ["GitHub", "Linux practice", "Free cloud tiers"],
    x: 250,
    y: 328,
    details: [
      "Близкие базовые навыки: Python, Git, Linux и работа с документацией.",
      "Может вести к backend, cloud и infrastructure-направлениям.",
      "Хорошая следующая вершина для AI-расширения графа."
    ]
  },
  {
    id: "robotics-engineer",
    type: "direction",
    layer: 2,
    title: "Инженер / робототехника",
    subtitle: "Физика, IoT и прототипы",
    costKzt: 0,
    costNote: "Базовый маршрут можно делать даже без дорогого железа через симуляторы.",
    fundingOptions: ["Школьный кабинет", "Tinkercad", "Командный бюджет"],
    x: 250,
    y: 472,
    details: [
      "Подходит для учеников, которым интересны физика, устройства и автоматизация.",
      "Python помогает с обработкой данных, сенсорами и демонстрациями.",
      "Портфолио лучше строить через схему, фото/видео прототипа и объяснение пользы."
    ]
  },
  {
    id: "software-engineer",
    type: "direction",
    layer: 2,
    title: "Software Engineer",
    subtitle: "Web, backend и продукт",
    costKzt: 0,
    costNote: "Старый software-маршрут сохранен, чтобы не ломать локальные данные.",
    fundingOptions: ["GitHub Pages", "Free hosting", "Школьные проекты"],
    x: 250,
    y: 616,
    details: [
      "Подходит для MVP, сайтов, регистрационных форм и небольших сервисов.",
      "Портфолио должно показать проблему, пользователя, решение и результат.",
      "Может вести к AITU, KBTU или Computer Science программам."
    ]
  },
  {
    id: "tech-entrepreneur",
    type: "direction",
    layer: 2,
    title: "Tech Entrepreneur",
    subtitle: "MVP и бизнес в IT",
    costKzt: 0,
    costNote: "Можно стартовать с бесплатных no-code/prototype-инструментов и Python-MVP.",
    fundingOptions: ["Hackathons", "School incubator", "Командный бюджет"],
    x: 250,
    y: 760,
    details: [
      "Направление для ученика, который хочет запускать идеи и собирать команду.",
      "Python-проект можно использовать как MVP для будущей предпринимательской ветки.",
      "Дальше граф можно расширить на pitch deck, customer discovery и конкурсы стартапов."
    ]
  },
  {
    id: "python-basics",
    type: "skill",
    layer: 3,
    title: "Основы Python",
    subtitle: "Синтаксис, функции, классы",
    costKzt: 0,
    costNote: "Базу можно начать бесплатно на открытых платформах.",
    fundingOptions: ["Stepik", "Coursera audit", "YouTube", "Школьный компьютерный класс"],
    x: 492,
    y: 28,
    details: [
      "Переменные, циклы, функции, классы и работа с файлами.",
      "Следить за стилем кода и стандартом PEP8.",
      "Цель: уверенно писать небольшие программы без копирования целиком."
    ]
  },
  {
    id: "ai-python",
    type: "skill",
    layer: 3,
    title: "Python для AI",
    subtitle: "Совместимость со старым AI-треком",
    costKzt: 0,
    costNote: "Использует те же бесплатные источники, что и базовый Python.",
    fundingOptions: ["Stepik", "Kaggle Learn", "Google Colab"],
    x: 492,
    y: 132,
    details: [
      "Мини-библиотеки: pandas, matplotlib, простые API и notebooks.",
      "Не нужно обещать сложный AI: достаточно понятного анализа данных.",
      "Доказательство: notebook, выводы и скриншоты результата."
    ]
  },
  {
    id: "algorithms",
    type: "skill",
    layer: 3,
    title: "Алгоритмы",
    subtitle: "Структуры данных и Big O",
    costKzt: 0,
    costNote: "Есть бесплатные задачники и разборы.",
    fundingOptions: ["Informatics.kz", "Олимпиадные архивы", "Школьный учитель"],
    x: 492,
    y: 236,
    details: [
      "Массивы, хеш-таблицы, бинарный поиск и оценка сложности.",
      "Практика помогает для олимпиад, ЕНТ-информатики и технических интервью.",
      "В портфолио можно добавить прогресс и разобранные задачи."
    ]
  },
  {
    id: "databases",
    type: "skill",
    layer: 3,
    title: "Базы данных",
    subtitle: "SQL, PostgreSQL, SQLite",
    costKzt: 0,
    costNote: "SQLite и PostgreSQL можно практиковать локально бесплатно.",
    fundingOptions: ["SQLite", "PostgreSQL", "Free cloud tiers"],
    x: 492,
    y: 340,
    details: [
      "Хранить данные проекта не только в файлах.",
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
    costKzt: 0,
    costNote: "Git и GitHub доступны бесплатно.",
    fundingOptions: ["GitHub", "GitHub Pages", "Open source examples"],
    x: 492,
    y: 444,
    details: [
      "GitHub нужен как витрина кода и доказательство самостоятельной работы.",
      "Каждый учебный проект лучше вести в отдельном репозитории.",
      "README должен объяснять проблему, запуск, скриншоты и роль ученика."
    ]
  },
  {
    id: "english",
    type: "skill",
    layer: 3,
    title: "Английский язык",
    subtitle: "B1-B2 для документации",
    costKzt: 100000,
    costNote: "Ориентир: подготовка и сдача IELTS в РК может стоить около 100 000 KZT.",
    fundingOptions: ["Opportunity Funds", "Бесплатные language clubs", "Школьная библиотека"],
    x: 492,
    y: 548,
    details: [
      "B1-B2 помогает читать документацию, StackOverflow и правила конкурсов.",
      "Для зарубежных вузов пригодятся IELTS/TOEFL или эквивалент.",
      "Начать можно с технического словаря и коротких описаний проектов."
    ]
  },
  {
    id: "search-skill",
    type: "skill",
    layer: 3,
    title: "Поиск информации",
    subtitle: "Docs, StackOverflow, debug",
    costKzt: 0,
    costNote: "Навык развивается через практику с документацией и ошибками.",
    fundingOptions: ["Официальные docs", "StackOverflow", "GitHub Issues"],
    x: 492,
    y: 652,
    details: [
      "Формулировать ошибку, проверять версии библиотек и читать примеры.",
      "Это снижает зависимость от наставника и ускоряет обучение.",
      "Хорошо работает как отдельный навык в портфолио."
    ]
  },
  {
    id: "time-management",
    type: "skill",
    layer: 3,
    title: "Тайм-менеджмент",
    subtitle: "Декомпозиция задач",
    costKzt: 0,
    costNote: "Можно вести план в заметках или бесплатном таск-трекере.",
    fundingOptions: ["Заметки телефона", "Trello/Notion free", "Бумажный план"],
    x: 492,
    y: 756,
    details: [
      "Разбивать большой проект на микро-задачи по 1-2 часа.",
      "Вести короткий список: что сделал, что сломалось, что дальше.",
      "Так проще доводить проекты до портфолио, а не бросать на середине."
    ]
  },
  {
    id: "software-product",
    type: "skill",
    layer: 3,
    title: "Product thinking",
    subtitle: "Problem, user, result",
    costKzt: 0,
    costNote: "Можно практиковать на школьных и локальных проблемах.",
    fundingOptions: ["Интервью с пользователями", "Hackathon mentors"],
    x: 492,
    y: 860,
    details: [
      "Найти реальную проблему, пользователя и критерий результата.",
      "Описать не только код, но и пользу решения.",
      "Сильная связка для грантов и интервью."
    ]
  },
  {
    id: "robotics-iot",
    type: "skill",
    layer: 3,
    title: "IoT basics",
    subtitle: "Sensors and automation",
    costKzt: 10000,
    costNote: "Минимальный резерв на датчики или доступ к школьному набору.",
    fundingOptions: ["Школьная лаборатория", "Командный бюджет", "Tinkercad"],
    x: 492,
    y: 964,
    details: [
      "Сенсор, сигнал, условие и действие.",
      "Можно начать с симуляции до покупки деталей.",
      "Хорошо дополняет Python через обработку данных."
    ]
  },
  {
    id: "free-course",
    type: "action",
    layer: 4,
    title: "Пройти бесплатный курс",
    subtitle: "Открытые платформы",
    costKzt: 0,
    costNote: "Первый курс можно пройти бесплатно.",
    fundingOptions: ["Открытые платформы", "Coursera audit", "Stepik"],
    x: 734,
    y: 60,
    details: [
      "Выбрать короткий курс по Python и идти по нему с ежедневной практикой.",
      "Результат: 8-12 маленьких задач и понятная база синтаксиса.",
      "Сертификат полезен, но код и заметки важнее."
    ]
  },
  {
    id: "telegram-bot",
    type: "action",
    layer: 4,
    title: "Написать Telegram-бота",
    subtitle: "Первый портфолио-проект",
    costKzt: 7000,
    costNote: "Резерв на интернет, тестовый хостинг или демонстрацию.",
    fundingOptions: ["Free hosting tier", "Школьный сервер", "Командный бюджет"],
    x: 734,
    y: 188,
    details: [
      "Бот может отвечать на вопросы школы, хранить расписание или помогать с подготовкой.",
      "Для портфолио нужны ссылка на код, скриншоты и короткое описание пользы.",
      "Хорошо связывает Python, Git, базы данных и продуктовый подход."
    ]
  },
  {
    id: "ai-bot",
    type: "action",
    layer: 4,
    title: "AI school assistant",
    subtitle: "Старый AI action сохранен",
    costKzt: 12000,
    costNote: "Резерв на API-тесты, демо и хостинг. Можно заменить локальными правилами.",
    fundingOptions: ["Free API credits", "Командный бюджет", "Локальный fallback"],
    x: 734,
    y: 316,
    details: [
      "Старый сохраненный маршрут ведет сюда без поломки после pull.",
      "AI в MVP лучше использовать аккуратно: объяснять ограничения и не обещать магию.",
      "Доказательство: demo, prompt, ограничения и feedback."
    ]
  },
  {
    id: "web-parser",
    type: "action",
    layer: 4,
    title: "Создать парсер данных",
    subtitle: "Данные с веб-сайта",
    costKzt: 5000,
    costNote: "Резерв на интернет и хранение результатов.",
    fundingOptions: ["Локальные файлы", "SQLite", "Бесплатный хостинг"],
    x: 734,
    y: 444,
    details: [
      "Парсер учит работать с HTTP, HTML, файлами и базами данных.",
      "Следующий шаг: превратить собранные данные в мини-dashboard.",
      "Хорошее доказательство самостоятельности для Computer Science трека."
    ]
  },
  {
    id: "ai-olympiad",
    type: "action",
    layer: 4,
    title: "Olympiad preparation",
    subtitle: "Math and informatics proof",
    costKzt: 0,
    costNote: "Можно готовиться по бесплатным архивам.",
    fundingOptions: ["Олимпиадные архивы", "Школьный учитель", "Peer group"],
    x: 734,
    y: 572,
    details: [
      "Выбрать информатику или математику и вести журнал решенных задач.",
      "Даже без победы прогресс можно показать как evidence.",
      "Сильная добавка для NU и KAIST маршрутов."
    ]
  },
  {
    id: "software-hackathon",
    type: "action",
    layer: 4,
    title: "Go to a hackathon",
    subtitle: "Team, MVP, pitch",
    costKzt: 15000,
    costNote: "Резерв на дорогу, интернет или демо-материалы.",
    fundingOptions: ["Организаторы", "Школьная поддержка", "Командный бюджет"],
    x: 734,
    y: 700,
    details: [
      "Собрать MVP за короткий срок и описать личную роль.",
      "Сохранить презентацию, demo link и обратную связь.",
      "Подходит для portfolio и entrepreneurial веток."
    ]
  },
  {
    id: "robotics-sensor",
    type: "action",
    layer: 4,
    title: "Sensor prototype",
    subtitle: "Smart greenhouse or classroom",
    costKzt: 30000,
    costNote: "Минимальный резерв на датчики, провода и демонстрацию.",
    fundingOptions: ["Школьная лаборатория", "Командный бюджет", "Городской конкурс"],
    x: 734,
    y: 828,
    details: [
      "Симулировать или собрать измерение температуры, влажности или освещения.",
      "Описать пользу для школы, семьи или сообщества.",
      "Доказательство: схема, логика, фото/видео и выводы."
    ]
  },
  {
    id: "nu",
    type: "opportunity",
    layer: 5,
    title: "Nazarbayev University",
    subtitle: "Dream tier",
    costKzt: 100000,
    costNote: "В стоимость заложен ориентир на IELTS/подготовку; обучение целится в грант NU.",
    fundingOptions: ["NU grant", "Opportunity Funds", "Yessenov Foundation"],
    x: 986,
    y: 94,
    details: [
      "NUET и английский требуют отдельной подготовки и календаря дедлайнов.",
      "Сильные extracurriculars: волонтерство, олимпиады, проекты и понятная личная роль.",
      "Портфолио должно честно показывать проблему, действие, результат и следующий шаг."
    ],
    sourceUrl: "https://nu.edu.kz/admissions",
    sourceLabel: "NU Admissions"
  },
  {
    id: "kaist",
    type: "opportunity",
    layer: 5,
    title: "KAIST",
    subtitle: "South Korea dream tier",
    costKzt: 0,
    costNote: "Маршрут целится в KAIST International Student Scholarship; фактические расходы надо уточнять.",
    fundingOptions: ["KAIST Scholarship", "Olympiad portfolio", "GitHub projects"],
    x: 986,
    y: 304,
    details: [
      "Нужны сильный английский, академическая база и завершенные технические проекты.",
      "Хорошо работают 2-3 законченных GitHub-проекта с README и демо.",
      "Для MVP достаточно сохранить как амбициозный endpoint и считать минимальный путь."
    ],
    sourceUrl: "https://admission.kaist.ac.kr/intl-undergraduate/",
    sourceLabel: "KAIST International Admissions"
  },
  {
    id: "aitu",
    type: "opportunity",
    layer: 5,
    title: "Astana IT University",
    subtitle: "Regular / backup tier",
    costKzt: 0,
    costNote: "Маршрут целится в государственный грант РК или внутренний грант AITU.",
    fundingOptions: ["Государственный грант РК", "Сельская квота", "AITU Open"],
    x: 986,
    y: 514,
    details: [
      "ЕНТ: ориентир 110-115+; профильные предметы математика и информатика.",
      "Внутренние гранты и скидки могут быть доступны через олимпиады и соревнования.",
      "Python-практика, GitHub и Telegram-бот усиливают заявку."
    ],
    sourceUrl: "https://astanait.edu.kz/en/bachelor/",
    sourceLabel: "AITU Bachelor programs"
  },
  {
    id: "kbtu",
    type: "opportunity",
    layer: 5,
    title: "KBTU",
    subtitle: "IT, engineering, English-medium",
    costKzt: 80000,
    costNote: "Резерв на подготовку, документы и поездку; обучение лучше покрывать грантом/скидкой.",
    fundingOptions: ["Грант РК", "Internal scholarships", "Hackathon portfolio"],
    x: 986,
    y: 682,
    details: [
      "Подходит для software, product и industry-oriented маршрутов.",
      "Сильные доказательства: английский, web/API проект и командный MVP.",
      "Hackathon result может показать teamwork and execution."
    ],
    sourceUrl:
      "https://kbtu.edu.kz/en/schools/school-of-information-technology-and-engineering/bachelor-s-educational-programs-of-the-school-of-information-technology-and-engineering",
    sourceLabel: "KBTU SITE programs"
  },
  {
    id: "satbayev",
    type: "opportunity",
    layer: 5,
    title: "Satbayev University",
    subtitle: "Automation, Robotics, CS",
    costKzt: 60000,
    costNote: "Резерв на подготовку, материалы проекта и документы.",
    fundingOptions: ["Грант РК", "Технические конкурсы", "Школьная лаборатория"],
    x: 986,
    y: 850,
    details: [
      "Хороший endpoint для hardware, IoT и инженерных проектов.",
      "Сенсорный прототип и схема особенно полезны для портфолио.",
      "Можно сравнивать с AITU и NU по стоимости, риску и требованиям."
    ],
    sourceUrl: "https://official.satbayev.university/en/programs",
    sourceLabel: "Satbayev programs"
  }
];

export const universityGraphEdges: UniversityGraphEdge[] = [
  { id: "you-python", from: "you", to: "python-programmer", label: "ready", tone: "primary" },
  { id: "you-ai", from: "you", to: "ai-engineer", label: "saved", tone: "blue" },
  { id: "you-devops", from: "you", to: "devops-engineer", label: "pending", tone: "muted" },
  { id: "you-robotics", from: "you", to: "robotics-engineer", label: "physics", tone: "green" },
  { id: "you-software", from: "you", to: "software-engineer", label: "product", tone: "blue" },
  { id: "you-business", from: "you", to: "tech-entrepreneur", label: "startup", tone: "yellow" },
  { id: "python-basics", from: "python-programmer", to: "python-basics", tone: "primary" },
  { id: "python-algorithms", from: "python-programmer", to: "algorithms", tone: "primary" },
  { id: "python-databases", from: "python-programmer", to: "databases", tone: "blue" },
  { id: "python-git", from: "python-programmer", to: "git", tone: "blue" },
  { id: "python-english", from: "python-programmer", to: "english", tone: "yellow" },
  { id: "python-search", from: "python-programmer", to: "search-skill", tone: "green" },
  { id: "python-time", from: "python-programmer", to: "time-management", tone: "green" },
  { id: "ai-python", from: "ai-engineer", to: "ai-python", tone: "blue" },
  { id: "ai-algorithms", from: "ai-engineer", to: "algorithms", tone: "primary" },
  { id: "ai-english", from: "ai-engineer", to: "english", tone: "yellow" },
  { id: "devops-git", from: "devops-engineer", to: "git", tone: "blue" },
  { id: "devops-search", from: "devops-engineer", to: "search-skill", tone: "green" },
  { id: "robotics-iot", from: "robotics-engineer", to: "robotics-iot", tone: "green" },
  { id: "robotics-python", from: "robotics-engineer", to: "python-basics", tone: "primary" },
  { id: "software-git", from: "software-engineer", to: "git", tone: "blue" },
  { id: "software-product", from: "software-engineer", to: "software-product", tone: "yellow" },
  { id: "business-product", from: "tech-entrepreneur", to: "software-product", tone: "yellow" },
  { id: "business-time", from: "tech-entrepreneur", to: "time-management", tone: "green" },
  { id: "basics-course", from: "python-basics", to: "free-course", tone: "primary" },
  { id: "basics-bot", from: "python-basics", to: "telegram-bot", tone: "primary" },
  { id: "ai-python-bot", from: "ai-python", to: "ai-bot", tone: "blue" },
  { id: "databases-parser", from: "databases", to: "web-parser", tone: "blue" },
  { id: "git-bot", from: "git", to: "telegram-bot", tone: "blue" },
  { id: "algorithms-course", from: "algorithms", to: "free-course", tone: "primary" },
  { id: "algorithms-olympiad", from: "algorithms", to: "ai-olympiad", tone: "primary" },
  { id: "product-hackathon", from: "software-product", to: "software-hackathon", tone: "yellow" },
  { id: "iot-sensor", from: "robotics-iot", to: "robotics-sensor", tone: "green" },
  { id: "english-nu", from: "english", to: "nu", tone: "yellow" },
  { id: "course-aitu", from: "free-course", to: "aitu", tone: "green" },
  { id: "bot-aitu", from: "telegram-bot", to: "aitu", tone: "primary" },
  { id: "bot-nu", from: "telegram-bot", to: "nu", tone: "primary" },
  { id: "ai-bot-aitu", from: "ai-bot", to: "aitu", tone: "blue" },
  { id: "ai-bot-nu", from: "ai-bot", to: "nu", tone: "primary" },
  { id: "parser-aitu", from: "web-parser", to: "aitu", tone: "blue" },
  { id: "parser-kaist", from: "web-parser", to: "kaist", tone: "blue" },
  { id: "parser-nu", from: "web-parser", to: "nu", tone: "primary" },
  { id: "olympiad-nu", from: "ai-olympiad", to: "nu", tone: "primary" },
  { id: "olympiad-kaist", from: "ai-olympiad", to: "kaist", tone: "yellow" },
  { id: "hackathon-kbtu", from: "software-hackathon", to: "kbtu", tone: "yellow" },
  { id: "hackathon-aitu", from: "software-hackathon", to: "aitu", tone: "green" },
  { id: "sensor-satbayev", from: "robotics-sensor", to: "satbayev", tone: "green" },
  { id: "sensor-nu", from: "robotics-sensor", to: "nu", tone: "primary" }
];
