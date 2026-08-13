import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, GuestRoute, RootRedirect } from "./components/layout/RouteGuards";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthLayout } from "./components/layout/AuthLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegistroPage } from "./pages/RegistroPage";
import { TrainerHomePage } from "./pages/TrainerHomePage";
import { TrainerUserDetailPage } from "./pages/TrainerUserDetailPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ExerciseDetailPage } from "./pages/ExerciseDetailPage";
import { TrainPage } from "./pages/TrainPage";
import { PerfilPage } from "./pages/PerfilPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegistroPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="TRAINER" />}>
            <Route element={<AppLayout />}>
              <Route path="/trainer" element={<TrainerHomePage />} />
              <Route path="/trainer/users/:userId" element={<TrainerUserDetailPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="USER" />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/ejercicio/:exerciseId" element={<ExerciseDetailPage />} />
              <Route path="/dashboard/ejercicio/:exerciseId/entrenar" element={<TrainPage />} />
              <Route path="/dashboard/perfil" element={<PerfilPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
