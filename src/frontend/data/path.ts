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
  name: "Aruzhan",
  summary: "IT + Engineering",
  interests: ["IT", "Physics"],
  directions: ["AI", "Engineering", "Robotics"],
  skills: ["Python", "Math", "English"],
  project: "Telegram bot / sensor prototype",
  opportunity: "STEM Hackathon",
  recommendedGraphNodeIds: ["you", "ai-engineer", "ai-python", "ai-bot", "aitu"],
  savedAt: new Date().toISOString(),
  nodes: [
    {
      id: "now",
      title: "Я сейчас",
      description: "9-сынып, ауыл мектебі, phone-first learning",
      tone: "start"
    },
    {
      id: "interests",
      title: "Интересы: IT, Physics",
      description: "You like logic, experiments and practical tasks.",
      tone: "interest"
    },
    {
      id: "directions",
      title: "Направления: AI, Engineering, Robotics",
      description: "Good fit for technical contests and small prototypes.",
      tone: "direction"
    },
    {
      id: "skills",
      title: "Навыки: Python, Math, English",
      description: "Start with simple scripts, formulas and tech vocabulary.",
      tone: "skill"
    },
    {
      id: "project",
      title: "Проект: Telegram bot / sensor prototype",
      description: "A practical mini-project that can become portfolio proof.",
      tone: "project"
    },
    {
      id: "opportunities",
      title: "Возможности: STEM Hackathon",
      description: "Online format, low internet, suitable for grades 8-11.",
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
      { id: "p1", text: "Finish 8 short Python lessons on a phone", done: true },
      { id: "p2", text: "Write one paragraph about your career interest", done: true },
      { id: "p3", text: "Solve 10 math or logic practice tasks", done: false }
    ]
  },
  {
    title: "60 days",
    focus: "First project",
    items: [
      { id: "p4", text: "Build a Telegram bot idea on paper", done: false },
      { id: "p5", text: "Find one mentor, teacher or older student", done: false },
      { id: "p6", text: "Save two contests that accept online work", done: false }
    ]
  },
  {
    title: "90 days",
    focus: "Portfolio proof",
    items: [
      { id: "p7", text: "Submit one mini-project or contest application", done: false },
      { id: "p8", text: "Create a portfolio description in Kazakh/Russian", done: false },
      { id: "p9", text: "Record results, feedback and next step", done: false }
    ]
  }
];
