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
  Trash2
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

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

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

      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (sprintsRes.ok) setSprints(await sprintsRes.json());
      if (usersRes.ok) setAvailableUsers(await usersRes.json());
    } catch (err) {
      setError("Connection lost. Please check your server.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchData();
  }, [token, fetchData]);

  // --- ACTIONS ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Auth failed');
      if (isLogin) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      } else {
        setIsLogin(true);
        alert("Success! Now sign in.");
      }
    } catch (err) { setError(err.message); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(newTask)
      });
      if (res.ok) {
        setShowTaskModal(false);
        setNewTask({ title: '', description: '', status: 'To Do', priority: 'Medium', storyPoints: 1, assignee: '', sprintId: '' });
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
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
    } catch (err) { console.error(err); }
  };

  const handleDeleteSprint = async (sprintId, e) => {
    e.stopPropagation();
    if (!window.confirm("Deleting this sprint will move all its tasks back to the Backlog. Proceed?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/sprints/${sprintId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const updateTaskStatus = async (taskId, currentStatus, direction = 'forward') => {
    const statuses = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];
    let nextIndex;
    
    if (direction === 'forward') {
      nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    } else {
      nextIndex = (statuses.indexOf(currentStatus) - 1 + statuses.length) % statuses.length;
    }
    
    const nextStatus = statuses[nextIndex];
    
    try {
      await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ status: nextStatus })
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const calculateSprintProgress = (sprintId) => {
    const sprintTasks = tasks.filter(t => t.sprintId?._id === sprintId || t.sprintId === sprintId);
    if (sprintTasks.length === 0) return 0;
    const completedPoints = sprintTasks.filter(t => t.status === 'Done').reduce((acc, t) => acc + (t.storyPoints || 0), 0);
    const totalPoints = sprintTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
    return Math.round((completedPoints / totalPoints) * 100);
  };

  const logout = () => { localStorage.clear(); setToken(null); setUser(null); };

  if (!token) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-slate-100">
            <div className="flex justify-center mb-8">
              <div className="bg-indigo-600 p-4 rounded-2xl shadow-xl shadow-indigo-100 rotate-3">
                <Trello className="text-white w-10 h-10" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-center text-slate-800 mb-2 tracking-tight">SprintMaster</h2>
            <p className="text-slate-400 text-center mb-10 text-sm font-medium">Elevate your team's agility.</p>
  
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-xs font-bold flex items-center gap-2 border border-red-100"><AlertCircle size={16}/> {error}</div>}
  
            <form onSubmit={handleAuth} className="space-y-5">
              {!isLogin && (
                <input type="text" placeholder="Username" required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
              )}
              <input type="email" placeholder="Email" required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              <input type="password" placeholder="Password" required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all transform active:scale-95">
                {isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}
              </button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-8 text-sm font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest">{isLogin ? "Join the team" : "Back to login"}</button>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-8 flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100"><Trello size={24} /></div>
          <span className="font-black text-slate-800 text-xl tracking-tighter uppercase">SprintMaster</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'dashboard', icon: Layout, label: 'Dashboard' },
            { id: 'board', icon: ClipboardList, label: 'Active Board' },
            { id: 'backlog', icon: Plus, label: 'Product Backlog' }
          ].map((item) => (
            <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${view === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}>
              <item.icon size={22} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-black text-indigo-600 border-2 border-white shadow-sm uppercase">{user?.username?.[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-800 truncate uppercase tracking-tight">{user?.username}</p>
              <p className="text-[10px] font-bold text-indigo-500 uppercase">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-2 text-slate-400 font-bold text-xs hover:text-red-500 transition-colors uppercase tracking-widest"><LogOut size={14}/> Logout</button>
        </div>
      </aside>

      <main className="flex-1 ml-72">
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-10">
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{view}</h1>
          <div className="flex gap-3">
            <button onClick={() => setShowSprintModal(true)} className="px-5 py-2.5 rounded-xl border-2 border-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2">
              <Calendar size={18} /> New Sprint
            </button>
            <button onClick={() => setShowTaskModal(true)} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
              <Plus size={18} /> Add Task
            </button>
          </div>
        </header>

        <div className="p-10">
          {loading && <div className="fixed top-24 right-10 animate-spin text-indigo-600"><Loader2 /></div>}

          {view === 'dashboard' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Inventory</p>
                  <div className="flex items-end gap-3">
                    <h3 className="text-5xl font-black text-slate-800">{tasks.length}</h3>
                    <span className="text-slate-400 font-bold pb-1 text-sm">Tasks</span>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Velocity</p>
                  <div className="flex items-end gap-3">
                    <h3 className="text-5xl font-black text-indigo-600">{tasks.filter(t => t.status === 'Done').reduce((acc, t) => acc + (t.storyPoints || 0), 0)}</h3>
                    <span className="text-slate-400 font-bold pb-1 text-sm">Points</span>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Milestones</p>
                  <div className="flex items-end gap-3">
                    <h3 className="text-5xl font-black text-slate-800">{sprints.length}</h3>
                    <span className="text-slate-400 font-bold pb-1 text-sm">Sprints</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter mb-8 flex items-center gap-3">
                  <Calendar className="text-indigo-600" /> Active & Planned Sprints
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sprints.map(s => {
                    const progress = calculateSprintProgress(s._id);
                    return (
                      <div key={s._id} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group relative">
                        <div className="flex justify-between items-start mb-4">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>{s.status}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-indigo-600">{progress}%</span>
                            <button 
                              onClick={(e) => handleDeleteSprint(s._id, e)}
                              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <h4 className="text-lg font-black text-slate-800 mb-1">{s.name}</h4>
                        <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-1">{s.goal || 'Focus on delivery'}</p>
                        
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mb-6 overflow-hidden">
                          <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <div className="flex gap-4">
                            <span className="flex items-center gap-1"><Clock size={12}/> {new Date(s.startDate).toLocaleDateString()}</span>
                            <span>-</span>
                            <span>{new Date(s.endDate).toLocaleDateString()}</span>
                          </div>
                          <ChevronRight className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {view === 'board' && (
            <div className="flex gap-8 overflow-x-auto pb-10 h-[calc(100vh-220px)]">
              {['Backlog', 'To Do', 'In Progress', 'Review', 'Done'].map(column => (
                <div key={column} className="w-80 flex-shrink-0 flex flex-col">
                  <div className="flex items-center justify-between mb-6 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-black text-slate-600 uppercase text-[10px] tracking-[0.2em]">{column}</h3>
                    <span className="bg-slate-50 text-slate-400 text-[10px] px-2.5 py-1 rounded-lg font-black">{tasks.filter(t => t.status === column).length}</span>
                  </div>
                  <div className="flex-1 bg-slate-100/30 rounded-[2.5rem] p-4 space-y-4 overflow-y-auto border-2 border-dashed border-slate-200/50">
                    {tasks.filter(t => t.status === column).map(task => (
                      <div 
                        key={task._id} 
                        onClick={() => updateTaskStatus(task._id, task.status, 'forward')}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          updateTaskStatus(task._id, task.status, 'backward');
                        }}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden select-none"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase ${task.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-500'}`}>{task.priority}</span>
                          <button 
                            onClick={(e) => handleDeleteTask(task._id, e)}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm mb-6 group-hover:text-indigo-600 transition-colors leading-relaxed">{task.title}</h4>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 bg-slate-50 rounded-full flex items-center justify-center text-[9px] font-black text-slate-400 border border-slate-100 uppercase">{task.assignee?.username?.[0] || 'U'}</div>
                             <span className="text-[10px] font-bold text-slate-400">{task.assignee?.username || 'Unassigned'}</span>
                          </div>
                          <span className="text-[10px] font-black text-slate-300">{task.storyPoints} PTS</span>
                        </div>
                        <div className="absolute bottom-1 right-3 text-[7px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase">L: Next | R: Back</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === 'backlog' && (
             <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <tr>
                      <th className="px-10 py-6">Requirement</th>
                      <th className="px-10 py-6">Severity</th>
                      <th className="px-10 py-6">Phase</th>
                      <th className="px-10 py-6">Owner</th>
                      <th className="px-10 py-6 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {tasks.map(task => (
                     <tr key={task._id} className="hover:bg-indigo-50/30 transition-all group">
                       <td className="px-10 py-8">
                         <p className="font-black text-slate-800 text-sm group-hover:text-indigo-600 mb-1">{task.title}</p>
                         <p className="text-xs text-slate-400 font-medium line-clamp-1">{task.description}</p>
                       </td>
                       <td className="px-10 py-8">
                         <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${task.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{task.priority}</span>
                       </td>
                       <td className="px-10 py-8"><span className="text-xs font-black text-slate-500 uppercase">{task.status}</span></td>
                       <td className="px-10 py-8">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-xs font-black text-indigo-400 border-2 border-white shadow-sm">{task.assignee?.username?.[0].toUpperCase() || 'U'}</div>
                            <span className="text-xs font-bold text-slate-500">{task.assignee?.username || 'None'}</span>
                         </div>
                       </td>
                       <td className="px-10 py-8 text-right">
                         <div className="flex items-center justify-end gap-4">
                            <span className="font-black text-slate-800 text-lg">{task.storyPoints}</span>
                            <button 
                                onClick={(e) => handleDeleteTask(task._id, e)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                         </div>
                       </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
          )}
        </div>

        {/* Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-10 py-8 bg-indigo-600 flex items-center justify-between text-white">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">New Mission</h3>
                  <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1">Define task parameters</p>
                </div>
                <button onClick={() => setShowTaskModal(false)} className="hover:bg-white/20 p-3 rounded-full transition-all"><X size={24} /></button>
              </div>
              <form onSubmit={handleCreateTask} className="p-10 space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Task Title</label>
                  <input type="text" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-800 transition-all" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Assignee</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm" value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})}>
                      <option value="">Unassigned</option>
                      {availableUsers.map(u => (
                        <option key={u._id} value={u._id}>{u.username}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Active Sprint</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm" value={newTask.sprintId} onChange={e => setNewTask({...newTask, sprintId: e.target.value})}>
                      <option value="">Backlog Only</option>
                      {sprints.filter(s => s.status !== 'Completed').map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Priority</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                      <option>Low</option><option>Medium</option><option>High</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Story Points</label>
                    <input type="number" min="1" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm" value={newTask.storyPoints} onChange={e => setNewTask({...newTask, storyPoints: parseInt(e.target.value)})} />
                  </div>
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-indigo-100 transition-all transform active:scale-95 uppercase tracking-[0.2em] text-xs">Deploy Task</button>
              </form>
            </div>
          </div>
        )}

        {/* Sprint Modal */}
        {showSprintModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-10 py-8 bg-slate-800 flex items-center justify-between text-white">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Initialize Sprint</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Set the roadmap</p>
                </div>
                <button onClick={() => setShowSprintModal(false)} className="hover:bg-white/20 p-3 rounded-full transition-all"><X size={24} /></button>
              </div>
              <form onSubmit={handleCreateSprint} className="p-10 space-y-6">
                <input type="text" placeholder="Sprint Name (e.g. Sprint 24.1)" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-800" value={newSprint.name} onChange={e => setNewSprint({...newSprint, name: e.target.value})} />
                <textarea placeholder="Sprint Goal..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-medium text-sm min-h-[100px]" value={newSprint.goal} onChange={e => setNewSprint({...newSprint, goal: e.target.value})}></textarea>
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
                <button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-5 rounded-3xl shadow-xl transition-all transform active:scale-95 uppercase tracking-[0.2em] text-xs">Activate Sprint Cycle</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;