import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PREP_BASE } from "@/lib/api";
import { Terminal, Loader2, ArrowRight } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res?.success === false) {
        setError(res.message || "Login failed");
      } else {
        nav("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    window.location.href = `${PREP_BASE}/api/prep/google`;
  };

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex relative overflow-hidden border-r border-border">
        <img
          src="https://images.unsplash.com/photo-1605379399642-870262d3d051?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXIlMjB3b3JraW5nJTIwbmlnaHQlMjBzZXR1cHxlbnwwfHx8fDE3ODIzMTE1MzJ8MA&ixlib=rb-4.1.0&q=85"
          alt="developer setup"
          className="absolute inset-0 h-full w-full object-cover opacity-20 dark:opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/60 to-transparent" />
        <div className="relative p-12 flex flex-col justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-muted border border-border grid place-items-center">
              <Terminal className="h-5 w-5 text-cyan-500" strokeWidth={1.75} />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-foreground text-lg">
                Prep<span className="text-cyan-500">Hub</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                interview command center
              </div>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-5xl font-semibold tracking-tight text-foreground leading-[1.05]">
              Ship the <span className="text-cyan-500">offer.</span>
              <br />
              Master the <span className="text-purple-500">stack.</span>
            </h1>
            <p className="mt-5 text-muted-foreground text-sm leading-relaxed">
              Curated DSA, OOPS, CN, OS &amp; DBMS playlists with progress tracking, streaks,
              notes and an in-chat AI tutor. Built for the late-night grind.
            </p>
            <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground uppercase tracking-[0.18em]">
              <span>5 subjects</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>1 streak to keep</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>0 excuses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-500 mb-2">
              welcome back
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Sign in to PrepHub</h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              Don&apos;t have an account?{" "}
              <Link to="/register" data-testid="login-register-link" className="text-cyan-500 hover:underline">
                Create one
              </Link>
            </p>
          </div>

          <form onSubmit={handle} className="space-y-4" data-testid="login-form">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="login-email-input"
                placeholder="you@dev.io"
                className="w-full bg-muted border border-border focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="login-password-input"
                placeholder="••••••••"
                className="w-full bg-muted border border-border focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all"
              />
            </div>

            {error && (
              <div
                data-testid="login-error-message"
                className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit-button"
              className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={googleLogin}
            data-testid="login-google-button"
            className="w-full h-11 rounded-md border border-border hover:border-border/60 hover:bg-muted text-foreground text-sm font-medium flex items-center justify-center gap-3 transition-all"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path fill="#EA4335" d="M12 11v3.2h4.5c-.2 1.2-1.6 3.6-4.5 3.6-2.7 0-4.9-2.2-4.9-5s2.2-5 4.9-5c1.5 0 2.6.6 3.2 1.2l2.2-2.1C16 5.6 14.2 4.8 12 4.8 7.8 4.8 4.4 8.2 4.4 12.4S7.8 20 12 20c6.9 0 7.6-6.4 7-9.6H12z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}