import type { Opportunity } from "../types";

export const opportunities: Opportunity[] = [
  {
    id: "stem-hackathon",
    title: "STEM Hackathon for Rural Schools",
    type: "Hackathon",
    format: "online",
    grades: "8-11",
    language: "Қазақша / Русский",
    internet: "low",
    deadline: "15 May"
  },
  {
    id: "robotics-week",
    title: "Robotics Project Week",
    type: "Mini-project",
    format: "hybrid",
    grades: "7-10",
    language: "Русский",
    internet: "medium",
    deadline: "28 May"
  },
  {
    id: "eco-grant",
    title: "Eco Idea Micro Grant",
    type: "Grant",
    format: "online",
    grades: "8-12",
    language: "Қазақша",
    internet: "low",
    deadline: "4 June"
  }
];
