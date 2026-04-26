import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import {
  getCurrentUser,
  loadUserPath,
  logoutUser,
  refreshCurrentUserFromBackend,
  refreshSavedPath,
  updateHollandResult,
  updatePortfolio,
  updateGraphText,
  updateGraphExpansion,
  updateQuizAnswers,
  updateSavedOpportunities,
  updateSelectedGoals,
  updateUserLanguage
} from "./lib/storage";
import type {
  GeneratedGraphExpansion,
  GraphAiText,
  HollandResult,
  Language,
  MainTab,
  PortfolioDraft,
  QuizAnswers,
  UserAccount,
  UserPath
} from "./types";
import { AuthScreen } from "./screens/AuthScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { GoalSelectionScreen } from "./screens/GoalSelectionScreen";
import { HollandTestScreen } from "./screens/HollandTestScreen";
import { LoadingScreen } from "./screens/LoadingScreen";
import { OpportunitiesScreen } from "./screens/OpportunitiesScreen";
import { PathGraphScreen } from "./screens/PathGraphScreen";
import { PlanScreen } from "./screens/PlanScreen";
import { PortfolioScreen } from "./screens/PortfolioScreen";
import { QuizScreen } from "./screens/QuizScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";

type FlowStep = "auth" | "welcome" | "goals" | "quiz" | "holland" | "loading" | "app";

export function App() {
  const online = useOnlineStatus();
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getCurrentUser());
  const [language, setLanguage] = useState<Language>(() => currentUser?.language ?? "kk");
  const [flowStep, setFlowStep] = useState<FlowStep>(() => {
    if (!currentUser) return "auth";
    return currentUser.data.onboardingCompleted ? "app" : "welcome";
  });
  const [activeTab, setActiveTab] = useState<MainTab>("home");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    () => currentUser?.data.selectedGoals ?? []
  );
  const [path, setPath] = useState<UserPath>(() => loadUserPath());

  const syncCurrentUser = () => {
    const nextUser = getCurrentUser();
    setCurrentUser(nextUser);
    return nextUser;
  };

  useEffect(() => {
    refreshCurrentUserFromBackend()
      .then((user) => {
        if (!user) return;
        setCurrentUser(user);
        setLanguage(user.language);
        setSelectedGoals(user.data.selectedGoals);
        setPath(user.data.path);
        setFlowStep(user.data.onboardingCompleted ? "app" : "welcome");
      })
      .catch(() => undefined);
  }, []);

  const handleAuth = (user: UserAccount) => {
    setCurrentUser(user);
    setLanguage(user.language);
    setSelectedGoals(user.data.selectedGoals);
    setPath(user.data.path);
    setFlowStep(user.data.onboardingCompleted ? "app" : "welcome");
    setActiveTab("home");
  };

  const handleLanguageChange = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    const updated = updateUserLanguage(nextLanguage);
    if (updated) setCurrentUser(updated);
  };

  const toggleGoal = (id: string) => {
    const next = selectedGoals.includes(id)
      ? selectedGoals.filter((goal) => goal !== id)
      : [...selectedGoals, id];
    setSelectedGoals(next);
    const updated = updateSelectedGoals(next);
    if (updated) setCurrentUser(updated);
  };

  const finishDiagnostic = (answers: QuizAnswers) => {
    updateQuizAnswers(answers);
    syncCurrentUser();
    setFlowStep("holland");
  };

  const finishOnboarding = (hollandResult: HollandResult | null) => {
    setFlowStep("loading");
    updateHollandResult(hollandResult);
    const nextPath = refreshSavedPath();
    setPath(nextPath);
    syncCurrentUser();
  };

  const handlePortfolioChange = (portfolio: PortfolioDraft) => {
    const updated = updatePortfolio(portfolio);
    if (updated) setCurrentUser(updated);
  };

  const handleSaveOpportunity = (id: string) => {
    if (!currentUser) return;

    const saved = currentUser.data.savedOpportunities;
    const next = saved.includes(id)
      ? saved.filter((opportunityId) => opportunityId !== id)
      : [...saved, id];
    const updated = updateSavedOpportunities(next);
    if (updated) setCurrentUser(updated);
  };

  const handleGraphTextGenerated = (nodeId: string, graphText: GraphAiText) => {
    const updated = updateGraphText(nodeId, graphText);
    if (updated) setCurrentUser(updated);
  };

  const handleGraphExpanded = (graphExpansion: GeneratedGraphExpansion) => {
    const updated = updateGraphExpansion(graphExpansion);
    if (updated) setCurrentUser(updated);
  };

  const handleAccountSwitch = () => {
    logoutUser();
    setCurrentUser(null);
    setSelectedGoals([]);
    setPath(loadUserPath());
    setFlowStep("auth");
    setActiveTab("home");
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
    if (flowStep === "auth") {
      return <AuthScreen onAuth={handleAuth} />;
    }

    if (flowStep === "welcome") {
      return (
        <WelcomeScreen
          language={language}
          onLanguageChange={handleLanguageChange}
          onAccountOpen={currentUser ? handleAccountSwitch : undefined}
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
      return (
        <QuizScreen
          initialAnswers={currentUser?.data.quizAnswers}
          onComplete={finishDiagnostic}
        />
      );
    }

    if (flowStep === "holland") {
      return (
        <HollandTestScreen
          initialResult={currentUser?.data.hollandResult}
          onComplete={finishOnboarding}
          onSkip={() => finishOnboarding(null)}
        />
      );
    }

    if (flowStep === "loading") {
      return <LoadingScreen />;
    }

    if (activeTab === "path") {
      return (
        <PathGraphScreen
          graphExpansion={currentUser?.data.graphExpansion}
          graphTexts={currentUser?.data.graphTexts ?? {}}
          language={language}
          path={path}
          quizAnswers={currentUser?.data.quizAnswers ?? {}}
          selectedGoals={selectedGoals}
          onGraphExpanded={handleGraphExpanded}
          onGraphTextGenerated={handleGraphTextGenerated}
        />
      );
    }
    if (activeTab === "plan") return <PlanScreen />;
    if (activeTab === "opportunities") {
      return (
        <OpportunitiesScreen
          online={online}
          savedOpportunityIds={currentUser?.data.savedOpportunities ?? []}
          onSaveOpportunity={handleSaveOpportunity}
        />
      );
    }
    if (activeTab === "portfolio" && currentUser) {
      return (
        <PortfolioScreen
          portfolio={currentUser.data.portfolio}
          onPortfolioChange={handlePortfolioChange}
        />
      );
    }

    return (
      <DashboardScreen
        path={path}
        hollandResult={currentUser?.data.hollandResult}
        onNavigate={setActiveTab}
      />
    );
  };

  const title = flowStep === "auth" ? "Account" : flowStep === "app" ? tabTitle(activeTab) : "QadamGraph";

  return (
    <AppShell
      online={online}
      title={title}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      accountName={currentUser?.name}
      onAccountSwitch={currentUser ? handleAccountSwitch : undefined}
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
