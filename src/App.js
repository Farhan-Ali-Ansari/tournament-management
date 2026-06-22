import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import MyTeams from "./pages/MyTeams";
import Guide from "./pages/Guide";
import BuyMeACoffee from "./pages/BuyMeACoffee";
import Settings from "./pages/Settings";
import TournamentApp from "./pages/TournamentApp";
import TournamentRedirect from "./components/TournamentRedirect";
import SharedFixtures from "./pages/SharedFixtures";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/share/:id" element={<SharedFixtures />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams"
              element={
                <ProtectedRoute>
                  <MyTeams />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guide"
              element={
                <ProtectedRoute>
                  <Guide />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coffee"
              element={
                <ProtectedRoute>
                  <BuyMeACoffee />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tournament/:id"
              element={
                <ProtectedRoute>
                  <TournamentRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tournament/:id/setup"
              element={
                <ProtectedRoute>
                  <TournamentApp />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tournament/:id/teams"
              element={
                <ProtectedRoute>
                  <TournamentApp />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tournament/:id/game"
              element={
                <ProtectedRoute>
                  <TournamentApp />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
}
