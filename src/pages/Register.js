import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Terminal, Loader2, ArrowRight } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await register(name, email, password);
      if (res?.success === false) {
        setError(res.message || "Registration failed");
      } else {
        setSuccess("Account created. Redirecting to login…");
        setTimeout(() => nav("/login"), 900);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Could not register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-10">
          <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 grid place-items-center">
            <Terminal className="h-5 w-5 text-cyan-400" strokeWidth={1.75} />
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-white text-lg">
              Prep<span className="text-cyan-400">Hub</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              create your account
            </div>
          </div>
        </div>

        <div className="mb-7">
          <div className="text-[10px] uppercase tracking-[0.22em] text-purple-400 mb-2">
            new recruit
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-white">Start your prep</h2>
          <p className="text-white/50 text-sm mt-1.5">
            Already grinding?{" "}
            <Link to="/login" data-testid="register-login-link" className="text-cyan-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handle} className="space-y-4" data-testid="register-form">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-white/50 mb-1.5">
              Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="register-name-input"
              placeholder="Ada Lovelace"
              className="w-full bg-white/5 border border-white/10 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 rounded-md px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-white/50 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="register-email-input"
              placeholder="you@dev.io"
              className="w-full bg-white/5 border border-white/10 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 rounded-md px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-white/50 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="register-password-input"
              placeholder="min 6 chars"
              className="w-full bg-white/5 border border-white/10 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 rounded-md px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-all"
            />
          </div>

          {error && (
            <div
              data-testid="register-error-message"
              className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              data-testid="register-success-message"
              className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-md px-3 py-2"
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            data-testid="register-submit-button"
            className="w-full h-11 rounded-md bg-white text-black font-medium text-sm hover:bg-purple-400 transition-all disabled:opacity-60 flex items-center justify-center gap-2 group"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>
                Create account
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
