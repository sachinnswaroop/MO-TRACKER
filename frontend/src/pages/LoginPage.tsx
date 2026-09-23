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
  { icon: BarChart3, text: "Real-time lead and conversion dashboards" },
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
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-b from-charcoal-800 to-charcoal-900 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-6rem] right-[-4rem] h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <Logo size={48} />
          <div>
            <div className="font-display text-xl font-extrabold">MO Tracker</div>
            <div className="text-xs text-white/60">Central Bank of India</div>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight">
            Marketing performance,
            <br />
            all in one place.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-white/60">
            Track leads, conversions and daily field activity for the Bhopal CAC marketing team — built for
            officers and admins alike.
          </p>
          <div className="mt-9 space-y-4">
            {HIGHLIGHTS.map((h) => (
              <div key={h.text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/8 text-brand-300 ring-1 ring-white/10">
                  <h.icon size={16} />
                </span>
                <span className="text-sm text-white/75">{h.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/35">@Copyright, CAC, Bhopal</div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-ink-50 p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Logo size={48} />
            <div>
              <div className="font-display text-lg font-extrabold text-ink-900">MO Tracker</div>
              <div className="text-xs text-ink-500">Central Bank of India</div>
            </div>
          </div>

          <h2 className="font-display text-[28px] font-extrabold text-ink-900">Welcome back</h2>
          <p className="mb-7 mt-1.5 text-sm text-ink-500">Sign in to your marketing performance portal.</p>

          {error && (
            <div className="mb-4">
              <Alert>{error}</Alert>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-500">User ID</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required autoFocus />
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
