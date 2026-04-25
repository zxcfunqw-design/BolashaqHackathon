import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { loadUserPath, refreshSavedPath } from "./lib/storage";
import type { Language, MainTab, UserPath } from "./types";
import { DashboardScreen } from "./screens/DashboardScreen";
import { GoalSelectionScreen } from "./screens/GoalSelectionScreen";
import { LoadingScreen } from "./screens/LoadingScreen";
import { OpportunitiesScreen } from "./screens/OpportunitiesScreen";
import { PathGraphScreen } from "./screens/PathGraphScreen";
import { PlanScreen } from "./screens/PlanScreen";
import { PortfolioScreen } from "./screens/PortfolioScreen";
import { QuizScreen } from "./screens/QuizScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";

type FlowStep = "welcome" | "goals" | "quiz" | "loading" | "app";

export function App() {
  const online = useOnlineStatus();
  const [language, setLanguage] = useState<Language>("kk");
  const [flowStep, setFlowStep] = useState<FlowStep>("welcome");
  const [activeTab, setActiveTab] = useState<MainTab>("home");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [path, setPath] = useState<UserPath>(() => loadUserPath());

  const toggleGoal = (id: string) => {
    setSelectedGoals((current) =>
      current.includes(id) ? current.filter((goal) => goal !== id) : [...current, id]
    );
  };

  const finishDiagnostic = () => {
    setFlowStep("loading");
    const nextPath = refreshSavedPath();
    setPath(nextPath);
  };

  useEffect(() => {
    if (flowStep !== "loading") return;

    const timer = window.setTimeout(() => {
      setFlowStep("app");
      setActiveTab("home");
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [flowStep]);

  const renderContent = () => {
    if (flowStep === "welcome") {
      return (
        <WelcomeScreen
          language={language}
          onLanguageChange={setLanguage}
          onStart={() => setFlowStep("goals")}
        />
      );
    }

    if (flowStep === "goals") {
      return (
        <GoalSelectionScreen
          selectedGoals={selectedGoals}
          onToggleGoal={toggleGoal}
          onContinue={() => setFlowStep("quiz")}
        />
      );
    }

    if (flowStep === "quiz") {
      return <QuizScreen onComplete={finishDiagnostic} />;
    }

    if (flowStep === "loading") {
      return <LoadingScreen />;
    }

    if (activeTab === "path") return <PathGraphScreen path={path} />;
    if (activeTab === "plan") return <PlanScreen />;
    if (activeTab === "opportunities") return <OpportunitiesScreen online={online} />;
    if (activeTab === "portfolio") return <PortfolioScreen />;

    return <DashboardScreen path={path} onNavigate={setActiveTab} />;
  };

  const title = flowStep === "app" ? tabTitle(activeTab) : "QadamGraph";

  return (
    <AppShell
      online={online}
      title={title}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      showNav={flowStep === "app"}
    >
      {renderContent()}
    </AppShell>
  );
}

function tabTitle(tab: MainTab) {
  const titles: Record<MainTab, string> = {
    home: "Dashboard",
    path: "My Path",
    plan: "90-Day Plan",
    opportunities: "Opportunities",
    portfolio: "Portfolio"
  };

  return titles[tab];
}
