import type { GoalOption, PlanSection, QuizQuestion, UserPath } from "../types";

export const goalOptions: GoalOption[] = [
  {
    id: "career",
    title: "Choose a career direction",
    subtitle: "IT, engineering, medicine, design or another path"
  },
  {
    id: "contests",
    title: "Find hackathons and contests",
    subtitle: "Low-internet opportunities you can start from school"
  },
  {
    id: "skills",
    title: "Understand what skills to learn",
    subtitle: "A clear list for the next 30, 60 and 90 days"
  },
  {
    id: "portfolio",
    title: "Build a portfolio",
    subtitle: "Turn projects and contests into a strong story"
  },
  {
    id: "grants",
    title: "Find grants and opportunities",
    subtitle: "Saved cards that still work when connection is weak"
  }
];

export const quizQuestions: QuizQuestion[] = [
  {
    id: "study-place",
    question: "Where do you study?",
    options: ["Village school", "District center", "City school"]
  },
  {
    id: "interests",
    question: "What are you interested in?",
    options: ["IT", "Physics", "Medicine", "Agrotech", "Business", "Design", "Languages", "Ecology", "Robotics"]
  },
  {
    id: "access",
    question: "What do you have access to?",
    options: ["Phone only", "Computer sometimes", "Weak internet", "Stable internet"]
  },
  {
    id: "experience",
    question: "What have you already done?",
    options: ["Olympiad", "School project", "Volunteering", "Hackathon", "Nothing yet"]
  },
  {
    id: "goal",
    question: "What is your goal for this year?",
    options: ["Pick a direction", "Win a contest", "Build first project", "Apply for a grant"]
  }
];

export const mockUserPath: UserPath = {
  name: "Никита",
  summary: "Python-программист",
  interests: ["IT", "Python", "автоматизация"],
  directions: ["Python-программист", "DevOps", "робототехника"],
  skills: ["Python", "SQL", "Git", "English B1-B2"],
  project: "Telegram-бот / парсер данных",
  opportunity: "NU / KAIST / AITU",
  savedAt: new Date().toISOString(),
  nodes: [
    {
      id: "now",
      title: "Никита сейчас",
      description: "Школьник из Щучинска, выбирает техническую траекторию",
      tone: "start"
    },
    {
      id: "interests",
      title: "Интересы: IT и Python",
      description: "Тест показал несколько технических направлений, полный граф готов для Python.",
      tone: "interest"
    },
    {
      id: "directions",
      title: "Направление: Python-программист",
      description: "Базовый маршрут можно расширять в backend, data, DevOps или техническое предпринимательство.",
      tone: "direction"
    },
    {
      id: "skills",
      title: "Навыки: Python, SQL, Git, English",
      description: "Из JSON: синтаксис Python, алгоритмы, базы данных, Git, английский и поиск информации.",
      tone: "skill"
    },
    {
      id: "project",
      title: "Проект: Telegram-бот / парсер",
      description: "Первые практические шаги: пройти курс, сделать Telegram-бота и собрать парсер данных.",
      tone: "project"
    },
    {
      id: "opportunities",
      title: "Вузы: NU, KAIST, AITU",
      description: "В граф добавлены экзамены, гранты, олимпиады, проекты и портфолио-требования.",
      tone: "opportunity"
    },
    {
      id: "portfolio",
      title: "Портфолио",
      description: "Describe your problem, action, result and learning.",
      tone: "portfolio"
    }
  ]
};

export const planSections: PlanSection[] = [
  {
    title: "30 days",
    focus: "Foundation",
    items: [
      { id: "p1", text: "Пройти 8-10 коротких уроков по синтаксису Python", done: true },
      { id: "p2", text: "Оформить GitHub и загрузить первый учебный репозиторий", done: true },
      { id: "p3", text: "Решить 10 задач на массивы, хеш-таблицы и бинарный поиск", done: false }
    ]
  },
  {
    title: "60 days",
    focus: "First project",
    items: [
      { id: "p4", text: "Собрать MVP Telegram-бота с меню и простым хранилищем данных", done: false },
      { id: "p5", text: "Написать короткое описание проекта для портфолио", done: false },
      { id: "p6", text: "Начать английский словарь для документации, PEP и StackOverflow", done: false }
    ]
  },
  {
    title: "90 days",
    focus: "Portfolio proof",
    items: [
      { id: "p7", text: "Создать парсер данных с веб-сайта и сохранить результат в SQLite", done: false },
      { id: "p8", text: "Собрать README: проблема, решение, скриншоты, ссылка на код", done: false },
      { id: "p9", text: "Сверить требования NU, KAIST и AITU с текущими экзаменами и проектами", done: false }
    ]
  }
];
