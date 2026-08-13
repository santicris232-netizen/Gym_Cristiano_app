import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NavBar } from "./NavBar";

/** Shell de las rutas protegidas (trainer y dashboard): nav + contenedor.
 *  Solo se monta detrás de <ProtectedRoute>, así que `user` ya existe. */
export function AppLayout() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="min-h-screen">
      <NavBar role={user.role} name={user.name} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
