import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, ClipboardCheck, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Feedback";
import { Logo } from "../components/Logo";
import { ApiError } from "../lib/api";

const HIGHLIGHTS = [
  { icon: BarChart3, text: "Live lead and conversion dashboards" },
  { icon: ClipboardCheck, text: "Daily tour plans and CO reporting" },
  { icon: ShieldCheck, text: "Role-based access for MOs and admins" },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink-50 lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Bright brand area: full-bleed header on phones, side panel on desktop */}
      <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-cyan-400 via-brand-500 to-brand-700 px-6 pb-16 pt-[calc(2.5rem+env(safe-area-inset-top))] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-cyan-200/30 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <Logo size={44} className="shadow-lg" />
          <div>
            <div className="font-display text-xl font-extrabold leading-tight">MO Tracker</div>
            <div className="text-xs text-white/80">Central Bank of India</div>
          </div>
        </div>

        <div className="relative mt-8 max-w-md lg:mt-0">
          <h1 className="font-display text-[28px] font-extrabold leading-[1.15] tracking-tight lg:text-4xl">
            Marketing performance, <span className="text-cyan-100">all in one place.</span>
          </h1>
          <div className="mt-6 hidden space-y-3.5 lg:block">
            {HIGHLIGHTS.map((h) => (
              <div key={h.text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <h.icon size={16} />
                </span>
                <span className="text-sm text-white/90">{h.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden text-xs text-white/70 lg:block">@Copyright, CAC, Bhopal</div>
      </div>

      {/* Form: floats over the header on phones */}
      <div className="relative z-10 flex flex-1 items-start justify-center px-4 pb-10 lg:items-center lg:p-10">
        <div className="-mt-10 w-full max-w-sm rounded-3xl bg-white p-6 shadow-[var(--shadow-lift)] lg:mt-0 lg:bg-transparent lg:p-0 lg:shadow-none">
          <h2 className="font-display text-2xl font-extrabold text-ink-900">Welcome back</h2>
          <p className="mb-6 mt-1 text-sm text-ink-500">Sign in to continue.</p>

          {error && (
            <div className="mb-4">
              <Alert>{error}</Alert>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-500">User ID</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-500">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" variant="primary" className="mt-2 w-full !h-12 text-[15px]" disabled={loading}>
              {loading ? "Signing in…" : "Login"}
              {!loading && <ArrowRight size={16} />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
