import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const statusColors = {
  active: "#22c55e",
  on_hold: "#f59e0b",
  completed: "#6366f1",
  cancelled: "#ef4444",
};

const priorityColors = {
  low: "#6ee7b7",
  medium: "#fbbf24",
  high: "#f87171",
};

const EMPTY_FORM = {
  name: "",
  description: "",
  status: "active",
  priority: "medium",
  deadline: "",
};

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const openCreate = () => {
    setEditProject(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (project) => {
    setEditProject(project);
    setForm({
      name: project.name,
      description: project.description || "",
      status: project.status,
      priority: project.priority,
      deadline: project.deadline ? project.deadline.split("T")[0] : "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editProject) {
        await api.patch(`/projects/${editProject._id}`, form);
      } else {
        await api.post("/projects", form);
      }
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project?")) return;
    await api.delete(`/projects/${id}`);
    fetchProjects();
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Projects</h1>
          <p className="page__subtitle">Manage all active and upcoming projects</p>
        </div>
        <button className="btn btn--primary" onClick={openCreate}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet. Create your first one!</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((p) => (
            <div key={p._id} className="project-card">
              <div className="project-card__header">
                <h3 className="project-card__name">{p.name}</h3>
                <div className="project-card__actions">
                  <button onClick={() => openEdit(p)} className="icon-btn"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(p._id)} className="icon-btn icon-btn--danger"><Trash2 size={14} /></button>
                </div>
              </div>
              {p.description && <p className="project-card__desc">{p.description}</p>}
              <div className="project-card__footer">
                <span className="badge" style={{ background: statusColors[p.status] }}>{p.status}</span>
                <span className="badge" style={{ background: priorityColors[p.priority] }}>{p.priority}</span>
                {p.deadline && (
                  <span className="project-card__deadline">
                    Due {new Date(p.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>{editProject ? "Edit Project" : "New Project"}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="modal__body">
              <div className="form-group">
                <label>Project Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter project name" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Project description..." rows={3} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn btn--ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editProject ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
