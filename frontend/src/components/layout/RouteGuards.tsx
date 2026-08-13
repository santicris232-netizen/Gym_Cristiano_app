import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../types";
import { Spinner } from "../ui/Spinner";

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center text-neon-blue">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

/** Protege una rama de rutas: exige sesión y el rol indicado. Si no hay
 *  sesión, redirige a /login?next=<ruta actual> (el login la respeta al
 *  volver, ver LoginForm). */
export function ProtectedRoute({ role }: { role: Role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenSpinner />;

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (user.role !== role) {
    return <Navigate to={user.role === "TRAINER" ? "/trainer" : "/dashboard"} replace />;
  }

  return <Outlet />;
}

/** Para /login y /registro: si ya hay sesión, no dejar volver a entrar. */
export function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenSpinner />;
  if (user) return <Navigate to={user.role === "TRAINER" ? "/trainer" : "/dashboard"} replace />;

  return <Outlet />;
}

export function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "TRAINER" ? "/trainer" : "/dashboard"} replace />;
}
