import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, Loader2, Filter } from 'lucide-react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Board from './Board';
import Backlog from './Backlog';
import Auth from './Auth';
import { TaskModal, SprintModal } from './Modals';

const API_BASE_URL = 'http://localhost:5000/api';

const App = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [view, setView] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState('all');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const canManageSprints = user?.role === 'ScrumMaster' || user?.role === 'ProductOwner';
  const canDeleteSprints = user?.role === 'ScrumMaster';
  const canDeleteTasks = user?.role === 'ScrumMaster' || user?.role === 'ProductOwner';

  const [newTask, setNewTask] = useState({ 
    title: '', description: '', status: 'To Do', priority: 'Medium', 
    storyPoints: 1, assignee: '', sprintId: '', subtasks: [] 
  });
  const [newSprint, setNewSprint] = useState({ name: '', goal: '', startDate: '', endDate: '' });
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '', role: 'Developer' });
  const [isRegistering, setIsRegistering] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { 'x-auth-token': token };
      const [tasksRes, sprintsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/tasks`, { headers }),
        fetch(`${API_BASE_URL}/sprints`, { headers }),
        fetch(`${API_BASE_URL}/users`, { headers })
      ]);
      const tasksData = await tasksRes.json();
      const sprintsData = await sprintsRes.json();
      const usersData = await usersRes.json();
      
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setSprints(Array.isArray(sprintsData) ? sprintsData : []);
      setAvailableUsers(Array.isArray(usersData) ? usersData : []);

      const active = sprintsData.find(s => s.status === 'active');
      if (active && selectedSprintId === 'all') setSelectedSprintId(active._id);
    } catch (err) { setError('Failed to load data'); } finally { setLoading(false); }
  }, [token, selectedSprintId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveTask = async (e) => {
    e.preventDefault();
    const method = editingTask ? 'PUT' : 'POST';
    const url = editingTask ? `${API_BASE_URL}/tasks/${editingTask._id}` : `${API_BASE_URL}/tasks`;
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(newTask)
      });
      if (res.ok) {
        setShowTaskModal(false);
        setEditingTask(null);
        setNewTask({ title: '', description: '', status: 'To Do', priority: 'Medium', storyPoints: 1, assignee: '', sprintId: '', subtasks: [] });
        fetchData();
      }
    } catch (err) { setError('Failed to save task'); }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      storyPoints: task.storyPoints,
      assignee: task.assignee?._id || task.assignee || '',
      sprintId: task.sprintId?._id || task.sprintId || '',
      subtasks: task.subtasks || []
    });
    setShowTaskModal(true);
  };

  const moveTaskToStatus = async (taskId, newStatus) => {
    try {
      await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch (err) { setError('Update failed'); }
  };

  const updateSprintStatus = async (sprintId, status) => {
    try {
      await fetch(`${API_BASE_URL}/sprints/${sprintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) { setError('Failed to update sprint status'); }
  };

  const deleteTask = async (taskId) => {
    if (!canDeleteTasks) return;
    if (!window.confirm('Delete this task?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (res.ok) fetchData();
    } catch (err) { setError('Delete failed'); }
  };

  const createSprint = async (e) => {
    e.preventDefault();
    if (!canManageSprints) return;
    try {
      const res = await fetch(`${API_BASE_URL}/sprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(newSprint)
      });
      if (res.ok) { 
        setShowSprintModal(false); 
        setNewSprint({ name: '', goal: '', startDate: '', endDate: '' });
        fetchData(); 
      }
    } catch (err) { setError('Sprint creation failed'); }
  };

  const deleteSprint = async (id) => {
    if (!canDeleteSprints) return;
    if (!window.confirm('Delete this sprint? Tasks will return to backlog.')) return;
    try {
      await fetch(`${API_BASE_URL}/sprints/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      fetchData();
    } catch (err) { setError('Sprint delete failed'); }
  };

  const calculateSprintProgress = (sprintId) => {
    const sprintTasks = tasks.filter(t => (t.sprintId?._id || t.sprintId) === sprintId);
    if (sprintTasks.length === 0) return 0;
    const completed = sprintTasks.filter(t => t.status === 'Done').reduce((acc, t) => acc + t.storyPoints, 0);
    const total = sprintTasks.reduce((acc, t) => acc + t.storyPoints, 0);
    return Math.round((completed / total) * 100);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email, password: authForm.password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      } else { setError(data.msg); }
    } catch (err) { setError('Login failed'); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (res.ok) { setIsRegistering(false); setError('Registered! Please login.'); } else { setError(data.msg); }
    } catch (err) { setError('Registration failed'); }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <Auth isRegistering={isRegistering} setIsRegistering={setIsRegistering} authForm={authForm} setAuthForm={setAuthForm} handleLogin={handleLogin} handleRegister={handleRegister} error={error} setError={setError} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      <Sidebar user={user} view={view} setView={setView} handleLogout={handleLogout} />

      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter capitalize">
              {view === 'dashboard' ? 'Overview' : view + ' Space'}
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Agile Workspace</p>
          </div>
          <div className="flex gap-4">
            {view === 'board' && (
               <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm">
                 <Filter size={16} className="text-slate-400" />
                 <select value={selectedSprintId} onChange={(e) => setSelectedSprintId(e.target.value)} className="bg-transparent font-black text-[10px] uppercase tracking-widest text-slate-600 outline-none cursor-pointer">
                   <option value="all">All Sprints</option>
                   {sprints.map(s => (<option key={s._id} value={s._id}>{s.name}</option>))}
                 </select>
               </div>
            )}
            <button onClick={() => { setEditingTask(null); setShowTaskModal(true); }} className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95">
              <Plus size={18} /> New Task
            </button>
            {canManageSprints && (
              <button onClick={() => setShowSprintModal(true)} className="flex items-center gap-3 bg-white border-2 border-slate-800 hover:bg-slate-800 hover:text-white text-slate-800 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95">
                <Calendar size={18} /> Init Sprint
              </button>
            )}
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        ) : (
          <>
            {view === 'dashboard' && (
              <Dashboard 
                tasks={tasks} sprints={sprints} availableUsers={availableUsers} 
                calculateSprintProgress={calculateSprintProgress} 
                canDeleteSprints={canDeleteSprints} deleteSprint={deleteSprint} 
                updateSprintStatus={updateSprintStatus}
              />
            )}
            {view === 'board' && (
              <Board 
                tasks={tasks} selectedSprintId={selectedSprintId}
                moveTaskToStatus={moveTaskToStatus} deleteTask={deleteTask} 
                canDeleteTasks={canDeleteTasks} openEditModal={openEditModal}
              />
            )}
            {view === 'backlog' && <Backlog tasks={tasks} deleteTask={deleteTask} canDeleteTasks={canDeleteTasks} openEditModal={openEditModal} />}
          </>
        )}

        {showTaskModal && (
          <TaskModal 
            setShowTaskModal={setShowTaskModal} newTask={newTask} 
            setNewTask={setNewTask} availableUsers={availableUsers} 
            sprints={sprints} handleSave={handleSaveTask} isEditing={!!editingTask}
          />
        )}
        {showSprintModal && <SprintModal setShowSprintModal={setShowSprintModal} newSprint={newSprint} setNewSprint={setNewSprint} createSprint={createSprint} />}
      </main>
    </div>
  );
};

export default App;