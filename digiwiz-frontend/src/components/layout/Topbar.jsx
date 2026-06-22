import { Bell, Search, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Topbar = () => {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={16} />
        <input type="text" placeholder="Search..." />
      </div>
      <div className="topbar-right">
        <button className="topbar-notif">
          <Bell size={18} />
          <span>Notification</span>
        </button>
        <div className="topbar-user">
          <User size={16} />
          <span>Howdy, {user?.name?.split(" ")[0]}</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
