import {createContext, useContext, ReactNode} from "react";
import type { Language } from "../types";
import { translations, TranslationKey } from "../data/translations";

type TranslationContextType = {
  language: Language;
  t: (key: TranslationKey) => string;
};

const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({ 
  language, 
  children 
}: { 
  language: Language; 
  children: ReactNode 
}) {
  const t = (key: TranslationKey) => {
    return translations[language]?.[key] || translations.ru[key] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context=useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation должен использоваться внутри TranslationProvider");
  }
  return context;
}
