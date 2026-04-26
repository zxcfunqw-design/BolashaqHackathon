import { LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { loginUser, registerUser } from "../lib/storage";
import type { Language, UserAccount } from "../types";

type AuthMode = "register" | "login";

type AuthScreenProps = {
  onAuth: (user: UserAccount) => void;
};

export function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("register");
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState("");
  const [region, setRegion] = useState("");
  const [language, setLanguage] = useState<Language>("kk");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";
  const canSubmit = Boolean(
    login.trim().length >= 3 &&
      password.length >= 4 &&
      (!isRegister || (name.trim() && grade.trim() && region.trim()))
  );

  const submit = async () => {
    if (!canSubmit) return;

    setBusy(true);
    setError("");

    try {
      const user = isRegister
        ? await registerUser({ name, login, password, grade, region, language })
        : await loginUser({ login, password });

      onAuth(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-104px)] items-center">
      <div className="w-full space-y-4">
        <section>
          <Badge tone="green">Offline account</Badge>
          <h2 className="mt-4 text-3xl font-black leading-tight">
            {isRegister ? "Create your Qadam profile" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-qadam-muted">
            Данные сохраняются на этом устройстве в одном JSON-объекте. Backend пока не нужен.
          </p>
        </section>

        <Card>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-qadam-bg p-1">
            <button
              className={`min-h-11 rounded-xl text-sm font-bold transition ${
                isRegister ? "bg-qadam-card text-qadam-primary shadow-soft" : "text-qadam-muted"
              }`}
              onClick={() => setMode("register")}
              type="button"
            >
              Register
            </button>
            <button
              className={`min-h-11 rounded-xl text-sm font-bold transition ${
                !isRegister ? "bg-qadam-card text-qadam-primary shadow-soft" : "text-qadam-muted"
              }`}
              onClick={() => setMode("login")}
              type="button"
            >
              Login
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {isRegister ? (
              <>
                <Field
                  label="Атың / Имя"
                  value={name}
                  onChange={setName}
                  placeholder="Aruzhan"
                  testId="auth-name"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Сынып"
                    value={grade}
                    onChange={setGrade}
                    placeholder="9"
                    testId="auth-grade"
                  />
                  <Field
                    label="Аймақ"
                    value={region}
                    onChange={setRegion}
                    placeholder="Kyzylorda"
                    testId="auth-region"
                  />
                </div>
                <div>
                  <span className="text-sm font-bold text-qadam-graphite">Language</span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Button
                      variant={language === "kk" ? "primary" : "secondary"}
                      onClick={() => setLanguage("kk")}
                    >
                      Қазақша
                    </Button>
                    <Button
                      variant={language === "ru" ? "primary" : "secondary"}
                      onClick={() => setLanguage("ru")}
                    >
                      Русский
                    </Button>
                  </div>
                </div>
              </>
            ) : null}

            <Field
              label="Login"
              value={login}
              onChange={setLogin}
              placeholder="phone or email"
              autoComplete="username"
              testId="auth-login"
            />
            <Field
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="at least 4 symbols"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              testId="auth-password"
            />
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <Button
            fullWidth
            className="mt-5"
            disabled={!canSubmit || busy}
            onClick={submit}
            data-testid="auth-submit"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {isRegister ? <UserPlus size={17} /> : <LogIn size={17} />}
              {busy ? "Saving..." : isRegister ? "Register and continue" : "Login"}
            </span>
          </Button>
        </Card>

        <p className="text-center text-xs leading-5 text-qadam-muted">
          Demo auth only: this is local offline storage, not production security.
        </p>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  testId?: string;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  testId
}: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-qadam-graphite">{label}</span>
      <input
        autoComplete={autoComplete}
        className="mt-2 min-h-12 w-full rounded-2xl border border-qadam-border bg-qadam-bg px-4 text-sm font-semibold outline-none transition focus:border-qadam-primary focus:ring-2 focus:ring-qadam-primary/15"
        placeholder={placeholder}
        type={type}
        value={value}
        data-testid={testId}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
