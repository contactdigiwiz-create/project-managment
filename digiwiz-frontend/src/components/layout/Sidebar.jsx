import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  Calendar,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/messages", icon: MessageSquare, label: "Messages" },
  { to: "/calendar", icon: Calendar, label: "Calendar" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"><img alt="src" src="/images/logo.png" />
        </div>
      </div>

      <p className="sidebar-menu-label">Menu</p>

      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link--active" : ""}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={logout}>
        <LogOut size={18} />
        <span>Log Out</span>
      </button>
    </aside>
  );
};

export default Sidebar;
