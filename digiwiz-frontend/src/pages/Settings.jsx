import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Settings = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Settings</h1>
          <p className="page__subtitle">Manage your account preferences</p>
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-section-title">Profile</h3>
        <form className="auth-form" onSubmit={handleSave}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" defaultValue={user?.name} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" defaultValue={user?.email} disabled />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input type="text" defaultValue={user?.role} disabled />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" placeholder="Leave blank to keep current" />
          </div>
          <button type="submit" className="btn btn--primary">
            {saved ? "Saved ✓" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
