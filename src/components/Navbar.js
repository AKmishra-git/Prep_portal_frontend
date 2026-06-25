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
      className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border"
      data-testid="app-navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 group"
          data-testid="navbar-logo-link"
        >
          <div className="h-9 w-9 rounded-lg bg-muted border border-border grid place-items-center group-hover:border-cyan-400/60 transition-all">
            <Terminal className="h-4 w-4 text-cyan-500" strokeWidth={1.75} />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight text-foreground text-[15px]">
              Prep<span className="text-cyan-500">Hub</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
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
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground border border-border hover:border-border/60 hover:text-foreground transition-all bg-muted"
        >
          <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span className="hidden sm:inline">Search videos…</span>
        </Link>

        <button
          onClick={toggle}
          aria-label="toggle theme"
          data-testid="navbar-theme-toggle"
          className="h-9 w-9 grid place-items-center rounded-md border border-border hover:border-border/60 hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Moon className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>

        {user && (
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 grid place-items-center text-[11px] font-bold text-black">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="hidden lg:block leading-tight">
              <div className="text-[13px] text-foreground font-medium" data-testid="navbar-user-name">
                {user.name}
              </div>
              <div className="text-[10px] text-muted-foreground">{user.email}</div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          data-testid="navbar-logout-button"
          className="h-9 px-3 grid place-items-center rounded-md border border-border hover:border-rose-400/50 hover:text-rose-500 hover:bg-rose-500/5 transition-all text-muted-foreground text-sm"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}