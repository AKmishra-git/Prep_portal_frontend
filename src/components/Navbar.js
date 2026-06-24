import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LogOut, Moon, Search, Sun, Terminal } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const loc = useLocation();

  const handleLogout = async () => {
    await logout();
    nav("/login", { replace: true });
  };

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-xl bg-[#0A0A0A]/70 border-b border-white/10"
      data-testid="app-navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 group"
          data-testid="navbar-logo-link"
        >
          <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 grid place-items-center group-hover:border-cyan-400/60 transition-all">
            <Terminal className="h-4 w-4 text-cyan-400" strokeWidth={1.75} />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight text-white text-[15px]">
              Prep<span className="text-cyan-400">Hub</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              interview command center
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-6">
          {[
            { to: "/dashboard", label: "Dashboard" },
            { to: "/subject/dsa", label: "DSA" },
            { to: "/subject/oops", label: "OOPS" },
            { to: "/subject/cn", label: "CN" },
            { to: "/subject/os", label: "OS" },
            { to: "/subject/dbms", label: "DBMS" },
          ].map((item) => {
            const active = loc.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                data-testid={`nav-link-${item.label.toLowerCase()}`}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <Link
          to="/search"
          data-testid="navbar-search-link"
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-white/60 border border-white/10 hover:border-white/30 hover:text-white transition-all bg-white/5"
        >
          <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span className="hidden sm:inline">Search videos…</span>
        </Link>

        <button
          onClick={toggle}
          aria-label="toggle theme"
          data-testid="navbar-theme-toggle"
          className="h-9 w-9 grid place-items-center rounded-md border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all text-white/70"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Moon className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>

        {user && (
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 grid place-items-center text-[11px] font-bold text-black">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="hidden lg:block leading-tight">
              <div className="text-[13px] text-white font-medium" data-testid="navbar-user-name">
                {user.name}
              </div>
              <div className="text-[10px] text-white/40">{user.email}</div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          data-testid="navbar-logout-button"
          className="h-9 px-3 grid place-items-center rounded-md border border-white/10 hover:border-rose-400/50 hover:text-rose-400 hover:bg-rose-500/5 transition-all text-white/70 text-sm"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
