import { ArrowRight, Globe2, Languages, MapPinned, Smartphone } from "lucide-react";
import type { Language } from "../types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

type WelcomeScreenProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onAccountOpen?: () => void;
  onStart: () => void;
};

export function WelcomeScreen({
  language,
  onAccountOpen,
  onLanguageChange,
  onStart
}: WelcomeScreenProps) {
  return (
    <div className="flex min-h-[calc(100vh-104px)] flex-col justify-between gap-6">
      <section className="pt-6">
        <div className="grid h-16 w-16 place-items-center rounded-[24px] bg-qadam-primary text-qadam-primaryContrast shadow-soft">
          <MapPinned size={30} />
        </div>
        <h2 className="mt-6 text-4xl font-black leading-tight text-qadam-graphite">QadamGraph</h2>
        <p className="mt-4 text-lg font-semibold leading-7 text-qadam-graphite">
          Карта возможностей для школьников из сельских регионов Казахстана
        </p>
        <p className="mt-2 text-base leading-7 text-qadam-muted">
          Ауыл оқушыларына арналған мүмкіндік картасы
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge tone="green">
            <Smartphone size={14} />
            Mobile-first
          </Badge>
          <Badge tone="yellow">Offline-ready</Badge>
          <Badge tone="blue">Қазақша</Badge>
        </div>
      </section>

      <Card>
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-qadam-primary">
          <Languages size={18} />
          Interface language
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={language === "kk" ? "primary" : "secondary"}
            onClick={() => onLanguageChange("kk")}
          >
            Қазақша
          </Button>
          <Button
            variant={language === "ru" ? "primary" : "secondary"}
            onClick={() => onLanguageChange("ru")}
          >
            Русский
          </Button>
        </div>
        <Button fullWidth className="mt-4" onClick={onStart} data-testid="start-button">
          <span className="inline-flex items-center justify-center gap-2">
            Бастау / Начать
            <ArrowRight size={17} />
          </span>
        </Button>
        {onAccountOpen ? (
          <Button
            fullWidth
            className="mt-2"
            variant="secondary"
            onClick={onAccountOpen}
            data-testid="welcome-account"
          >
            Register / Login
          </Button>
        ) : null}
      </Card>

      <p className="flex items-center justify-center gap-2 pb-2 text-center text-xs font-medium text-qadam-muted">
        <Globe2 size={14} />
        Works best on phone, keeps your path saved locally
      </p>
    </div>
  );
}
