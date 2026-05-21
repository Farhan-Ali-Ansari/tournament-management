import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import TournamentApp from "./pages/TournamentApp";
import TournamentRedirect from "./components/TournamentRedirect";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
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
    </AuthProvider>
  );
}
