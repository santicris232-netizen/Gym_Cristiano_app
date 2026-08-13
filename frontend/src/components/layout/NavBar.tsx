import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { BarbellIcon } from "../ui/icons";
import type { Role } from "../../types";

const TRAINER_LINKS = [{ href: "/trainer", label: "Alumnos" }];
const USER_LINKS = [
  { href: "/dashboard", label: "Mi semana" },
  { href: "/dashboard/perfil", label: "Perfil" },
];

export function NavBar({ role, name }: { role: Role; name: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const links = role === "TRAINER" ? TRAINER_LINKS : USER_LINKS;
  const home = role === "TRAINER" ? "/trainer" : "/dashboard";

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to={home} className="flex items-center gap-2">
          <BarbellIcon className="h-5 w-5 text-neon-blue" />
          <span className="font-display text-lg tracking-wide whitespace-nowrap">
            GYM <span className="text-neon-blue">CRISTIANO</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => {
            const active = location.pathname === l.href;
            return (
              <Link
                key={l.href}
                to={l.href}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold uppercase tracking-wide transition ${
                  active ? "bg-surface text-neon-blue" : "text-cream-dim hover:text-cream"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-xs text-cream-dim sm:inline">{name}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Salir
          </Button>
        </div>
      </div>

      <nav className="flex items-center gap-1 border-t border-line px-4 py-1.5 sm:hidden">
        {links.map((l) => {
          const active = location.pathname === l.href;
          return (
            <Link
              key={l.href}
              to={l.href}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                active ? "bg-surface text-neon-blue" : "text-cream-dim"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
