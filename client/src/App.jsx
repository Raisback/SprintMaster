import React, { useState, useEffect, useCallback } from 'react';
import { 
  Layout, 
  Trello, 
  LogOut, 
  Plus, 
  ClipboardList, 
  Calendar, 
  User as UserIcon,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Clock,
  Target,
  Users,
  Trash2,
  ShieldCheck
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const App = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [view, setView] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modals State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);

  // RBAC Helper
  const canManageSprints = user?.role === 'ScrumMaster' || user?.role === 'ProductOwner';
  const canDeleteSprints = user?.role === 'ScrumMaster';
  const canDeleteTasks = user?.role === 'ScrumMaster' || user?.role === 'ProductOwner';

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    storyPoints: 1,
    assignee: '',
    sprintId: ''
  });

  const [newSprint, setNewSprint] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: ''
  });

  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Developer'
  });
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
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError('Login failed');
    }
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
      if (res.ok) {
        setIsRegistering(false);
        setError('Registered! Please login.');
      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError('Registration failed');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(newTask)
      });
      if (res.ok) {
        setShowTaskModal(false);
        fetchData();
        setNewTask({ title: '', description: '', status: 'To Do', priority: 'Medium', storyPoints: 1, assignee: '', sprintId: '' });
      }
    } catch (err) { setError('Failed to create task'); }
  };

  const updateTaskStatus = async (taskId, currentStatus, direction = 1) => {
    const statuses = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];
    let currentIndex = statuses.indexOf(currentStatus);
    let nextIndex = currentIndex + direction;
    
    if (nextIndex >= 0 && nextIndex < statuses.length) {
      try {
        await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
          body: JSON.stringify({ status: statuses[nextIndex] })
        });
        fetchData();
      } catch (err) { setError('Update failed'); }
    }
  };

  const deleteTask = async (taskId) => {
    if (!canDeleteTasks) return;
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
        fetchData();
      }
    } catch (err) { setError('Sprint creation failed'); }
  };

  const deleteSprint = async (id) => {
    if (!canDeleteSprints) return;
    try {
      await fetch(`${API_BASE_URL}/sprints/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      fetchData();
    } catch (err) { setError('Sprint delete failed'); }
  };

  const calculateSprintProgress = (sprintId) => {
    const sprintTasks = tasks.filter(t => t.sprintId?._id === sprintId || t.sprintId === sprintId);
    if (sprintTasks.length === 0) return 0;
    const completed = sprintTasks.filter(t => t.status === 'Done').reduce((acc, t) => acc + t.storyPoints, 0);
    const total = sprintTasks.reduce((acc, t) => acc + t.storyPoints, 0);
    return Math.round((completed / total) * 100);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-100">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6 transform -rotate-6">
              <Trello size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter">SprintMaster</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-2">v2.0 Performance Suite</p>
          </div>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering && (
              <>
                <input 
                  type="text" 
                  placeholder="Username" 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                  value={authForm.username}
                  onChange={e => setAuthForm({...authForm, username: e.target.value})}
                />
                <select 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                  value={authForm.role}
                  onChange={e => setAuthForm({...authForm, role: e.target.value})}
                >
                  <option value="Developer">Developer</option>
                  <option value="ScrumMaster">ScrumMaster</option>
                  <option value="ProductOwner">ProductOwner</option>
                </select>
              </>
            )}
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
              value={authForm.email}
              onChange={e => setAuthForm({...authForm, email: e.target.value})}
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
              value={authForm.password}
              onChange={e => setAuthForm({...authForm, password: e.target.value})}
            />
            
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-indigo-100 transition-all transform active:scale-95 uppercase tracking-widest text-sm">
              {isRegistering ? 'Create Account' : 'Enter Workspace'}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-500 rounded-2xl flex items-center gap-3 border border-red-100 animate-bounce">
              <AlertCircle size={18} />
              <p className="text-xs font-black uppercase tracking-wider">{error}</p>
            </div>
          )}

          <button 
            onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
            className="w-full mt-8 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
          >
            {isRegistering ? 'Already have an account? Login' : 'New here? Request Access'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-100 flex flex-col p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <Trello size={24} className="text-white" />
          </div>
          <div>
            <h2 className="font-black text-xl tracking-tighter">SprintMaster</h2>
            <div className="flex items-center gap-1">
              <ShieldCheck size={10} className="text-indigo-500" />
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {[
            { id: 'dashboard', icon: Layout, label: 'Dashboard' },
            { id: 'board', icon: Trello, label: 'Active Board' },
            { id: 'backlog', icon: ClipboardList, label: 'Backlog' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all ${
                view === item.id 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-2' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                <UserIcon size={14} className="text-slate-600" />
              </div>
              <p className="font-black text-xs text-slate-600 truncate">{user?.username}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            <LogOut size={16} />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter capitalize">
              {view === 'dashboard' ? 'Overview' : view + ' Space'}
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Welcome back, {user?.username.split(' ')[0]}</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95"
            >
              <Plus size={18} />
              New Task
            </button>
            {canManageSprints && (
              <button 
                onClick={() => setShowSprintModal(true)}
                className="flex items-center gap-3 bg-white border-2 border-slate-800 hover:bg-slate-800 hover:text-white text-slate-800 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
              >
                <Calendar size={18} />
                Init Sprint
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
              <div className="grid grid-cols-12 gap-8">
                {/* Stats */}
                <div className="col-span-12 grid grid-cols-4 gap-8">
                  {[
                    { label: 'Total Tasks', value: tasks.length, icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Velocity', value: tasks.filter(t => t.status === 'Done').reduce((acc, t) => acc + t.storyPoints, 0), icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Active Sprints', value: sprints.length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Contributors', value: availableUsers.length, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center">
                      <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl mb-4`}>
                        <stat.icon size={24} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                      <h3 className="text-3xl font-black text-slate-800">{stat.value}</h3>
                    </div>
                  ))}
                </div>

                {/* Sprints Overview */}
                <div className="col-span-12 lg:col-span-8 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-black tracking-tighter uppercase text-slate-800">Strategic Roadmaps</h3>
                    <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Ongoing Cycles</div>
                  </div>
                  <div className="space-y-6">
                    {sprints.map(sprint => (
                      <div key={sprint._id} className="group p-8 bg-slate-50 hover:bg-indigo-50 rounded-[2rem] transition-all border border-transparent hover:border-indigo-100 relative">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h4 className="font-black text-lg text-slate-800 mb-1">{sprint.name}</h4>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{sprint.goal || 'No goal defined'}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="px-4 py-2 bg-white rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">
                              {calculateSprintProgress(sprint._id)}% Done
                            </span>
                            {canDeleteSprints && (
                              <button onClick={() => deleteSprint(sprint._id)} className="p-2 hover:bg-red-500 hover:text-white text-slate-300 rounded-lg transition-colors">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="w-full h-3 bg-white rounded-full overflow-hidden p-0.5 border border-slate-100">
                          <div 
                            className="h-full bg-indigo-600 rounded-full shadow-lg shadow-indigo-100 transition-all duration-1000"
                            style={{ width: `${calculateSprintProgress(sprint._id)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                    {sprints.length === 0 && (
                      <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                        <Calendar size={48} className="mb-4 opacity-20" />
                        <p className="font-black text-[10px] uppercase tracking-[0.3em]">No active cycles initialized</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Sidebar */}
                <div className="col-span-12 lg:col-span-4 bg-slate-900 rounded-[3rem] p-10 text-white">
                  <h3 className="text-xl font-black tracking-tighter uppercase mb-10">Agile Collective</h3>
                  <div className="space-y-6">
                    {availableUsers.map(u => (
                      <div key={u._id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-black text-xs">
                            {u.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-sm tracking-tight">{u.username}</p>
                            <p className="text-indigo-400 font-bold text-[9px] uppercase tracking-[0.2em]">{u.role}</p>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${u.role === 'ScrumMaster' ? 'bg-indigo-400' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'}`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {view === 'board' && (
              <div className="grid grid-cols-5 gap-6">
                {['Backlog', 'To Do', 'In Progress', 'Review', 'Done'].map(status => (
                  <div key={status} className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          status === 'Backlog' ? 'bg-slate-300' :
                          status === 'To Do' ? 'bg-indigo-400' :
                          status === 'In Progress' ? 'bg-amber-400' :
                          status === 'Review' ? 'bg-purple-400' : 'bg-emerald-400'
                        }`}></span>
                        {status}
                      </h3>
                      <span className="bg-white border border-slate-100 text-slate-400 font-black text-[9px] px-2 py-1 rounded-lg">
                        {tasks.filter(t => t.status === status).length}
                      </span>
                    </div>
                    
                    <div className="space-y-4 min-h-[500px]">
                      {tasks.filter(t => t.status === status).map(task => (
                        <div 
                          key={task._id}
                          onClick={() => updateTaskStatus(task._id, task.status, 1)}
                          onContextMenu={(e) => { e.preventDefault(); updateTaskStatus(task._id, task.status, -1); }}
                          className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative"
                        >
                          {canDeleteTasks && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }}
                              className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          <div className="flex gap-2 mb-4">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                              task.priority === 'High' ? 'bg-red-50 text-red-500' :
                              task.priority === 'Medium' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                            }`}>
                              {task.priority}
                            </span>
                            {task.sprintId && (
                              <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600">
                                {task.sprintId.name}
                              </span>
                            )}
                          </div>
                          <h4 className="font-black text-sm text-slate-800 leading-tight mb-2">{task.title}</h4>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide line-clamp-2 mb-4">{task.description}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center font-black text-[8px] text-slate-500">
                                {task.assignee?.username.substring(0, 1).toUpperCase() || '?'}
                              </div>
                              <span className="text-[9px] font-black text-slate-400 uppercase">{task.assignee?.username || 'Unassigned'}</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-800 bg-slate-50 px-2 py-1 rounded-lg">
                              {task.storyPoints} SP
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {view === 'backlog' && (
              <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Requirement</th>
                      <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Severity</th>
                      <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Owner</th>
                      <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Cycle</th>
                      <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-center">Estimation</th>
                      <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task._id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${
                              task.status === 'Done' ? 'bg-emerald-400' : 'bg-slate-300'
                            }`}></div>
                            <div>
                              <p className="font-black text-sm text-slate-800">{task.title}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.status}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${
                            task.priority === 'High' ? 'bg-red-50 text-red-500' :
                            task.priority === 'Medium' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center font-black text-[10px] text-slate-500 border border-slate-200">
                              {task.assignee?.username.substring(0, 2).toUpperCase() || '??'}
                            </div>
                            <span className="text-xs font-bold text-slate-600">{task.assignee?.username || 'None'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-xl">
                            {task.sprintId?.name || 'In Backlog'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="font-black text-sm text-slate-800">{task.storyPoints}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            {canDeleteTasks && (
                              <button onClick={() => deleteTask(task._id)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-xl transition-all">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tasks.length === 0 && (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                    <ClipboardList size={48} className="mb-4 opacity-20" />
                    <p className="font-black text-[10px] uppercase tracking-[0.3em]">Backlog is currently clear</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-12 relative border border-slate-100">
              <button onClick={() => setShowTaskModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition-colors">
                <X size={24} />
              </button>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 uppercase">Create New Requirement</h2>
              <form onSubmit={createTask} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Title</label>
                  <input type="text" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm" placeholder="Define the feature or task..." value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Description</label>
                  <textarea className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm h-32 resize-none" placeholder="Provide technical context..." value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Assignee</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-xs" value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})}>
                      <option value="">Choose Member</option>
                      {availableUsers.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sprint Allocation</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-xs" value={newTask.sprintId} onChange={e => setNewTask({...newTask, sprintId: e.target.value})}>
                      <option value="">Leave in Backlog</option>
                      {sprints.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Priority Level</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-xs" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Story Points</label>
                    <input type="number" min="1" max="13" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-xs" value={newTask.storyPoints} onChange={e => setNewTask({...newTask, storyPoints: parseInt(e.target.value)})} />
                  </div>
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-indigo-100 transition-all transform active:scale-95 uppercase tracking-[0.2em] text-sm">Deploy Task</button>
              </form>
            </div>
          </div>
        )}

        {/* Sprint Modal */}
        {showSprintModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-12 relative border border-slate-100">
              <button onClick={() => setShowSprintModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition-colors">
                <X size={24} />
              </button>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 uppercase">Initialize New Cycle</h2>
              <form onSubmit={createSprint} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cycle Name</label>
                  <input type="text" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm" placeholder="e.g., Sprint Q4 - Phase 1" value={newSprint.name} onChange={e => setNewSprint({...newSprint, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Strategic Goal</label>
                  <textarea className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm h-24 resize-none" placeholder="What are we delivering this cycle?" value={newSprint.goal} onChange={e => setNewSprint({...newSprint, goal: e.target.value})}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Start Date</label>
                    <input type="date" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-xs" value={newSprint.startDate} onChange={e => setNewSprint({...newSprint, startDate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">End Date</label>
                    <input type="date" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-xs" value={newSprint.endDate} onChange={e => setNewSprint({...newSprint, endDate: e.target.value})} />
                  </div>
                </div>
                <button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-5 rounded-3xl shadow-xl transition-all transform active:scale-95 uppercase tracking-[0.2em] text-sm">Commit Cycle</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;