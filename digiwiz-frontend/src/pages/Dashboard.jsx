import { useState, useEffect } from "react";
import { LogIn, Coffee } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useShift } from "../hooks/useShift";
import StatCard from "../components/ui/StatCard";
import api from "../api/axios";

const Dashboard = () => {
  const { user } = useAuth();
  const {
    shift,
    activeTime,
    breakTime,
    isWorking,
    isOnBreak,
    clockInTime,
    loading,
    startShift,
    endShift,
    startBreak,
    endBreak,
  } = useShift();

  const [dashboard, setDashboard] = useState(null);
  const [activities, setActivities] = useState([]);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      setDashboard(res.data.dashboard);
      setActivities(res.data.dashboard.activities);
    } catch {}
  };

  useEffect(() => {
    fetchDashboard();
    // Refresh activities every 10 seconds
    const interval = setInterval(fetchDashboard, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleShiftToggle = async () => {
    if (!shift) {
      await startShift();
    } else {
      await endShift();
    }
    fetchDashboard();
  };

  const handleBreakToggle = async () => {
    if (isOnBreak) {
      await endBreak();
    } else {
      await startBreak();
    }
    fetchDashboard();
  };

  // Format clock out time from today's ended shift
  const clockOutTime = dashboard?.shift?.clockOutTime
    ? new Date(dashboard.shift.clockOutTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Welcome Back, {user?.name?.split(" ")[0]}</h1>
          <p className="dashboard__subtitle">Here's what's happening today</p>
        </div>
        <div className="dashboard__actions">
          <button
            className={`btn btn--shift ${isWorking || isOnBreak ? "btn--shift-end" : "btn--shift-start"}`}
            onClick={handleShiftToggle}
            disabled={loading}
          >
            <LogIn size={18} />
            {isWorking || isOnBreak ? "Log out" : "Log in"}
          </button>
          <button
            className={`btn btn--break ${isOnBreak ? "btn--break-active" : ""}`}
            onClick={handleBreakToggle}
            disabled={loading || !shift}
          >
            <Coffee size={18} />
            {isOnBreak ? "Resume" : "Take a Break"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard__grid">
        <StatCard
          title="Active projects"
          value={dashboard?.projects?.active ?? 0}
          subtitle={`+${dashboard?.projects?.newThisWeek ?? 0} new this week`}
        />
        <StatCard
          title="Pending tasks"
          value={dashboard?.tasks?.pending ?? 0}
          subtitle={`+${dashboard?.tasks?.completedToday ?? 0} completed today`}
        />
        <StatCard
          title="Today's tasks"
          value={dashboard?.tasks?.today ?? 0}
          subtitle="+1 today"
        />
        <StatCard
          title="Your active hours today"
          value={activeTime}
          subtitle={`${breakTime} break time today`}
          large
        />
        <StatCard
          title="Log in time"
          value={clockInTime}
          large
        />
        <StatCard
          title="Log out time"
          value={clockOutTime}
          large
        />
        <StatCard
          title="Today's total working hour"
          value={activeTime}
          large
        />
        <StatCard
          title="Today's total break hour"
          value={breakTime}
          large
        />
      </div>

      {/* Bottom Section */}
      <div className="dashboard__bottom">
        <div className="recent-activities">
          <h3>Recent Activities</h3>
          <div className="activity-list">
            {activities.length === 0 ? (
              <p className="activity-empty">No recent activities</p>
            ) : (
              activities.map((a) => (
                <div key={a._id} className="activity-item">
                  <span className="activity-dot" />
                  <span>{a.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;