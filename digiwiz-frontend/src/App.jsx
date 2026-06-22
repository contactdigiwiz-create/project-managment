import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Messages from "./pages/Messages";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">Loading...</div>;
  return user ? <Navigate to="/" /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
    <Route
      path="/"
      element={<ProtectedRoute><Layout /></ProtectedRoute>}
    >
      <Route index element={<Dashboard />} />
      <Route path="projects" element={<Projects />} />
      <Route path="messages" element={<Messages />} />
      <Route path="calendar" element={<Calendar />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
