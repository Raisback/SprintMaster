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
  Loader2
} from 'lucide-react';

// --- CONFIGURATION ---
const API_BASE_URL = 'http://localhost:5000/api';

const App = () => {
  // --- STATE ---
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [view, setView] = useState('dashboard'); // 'dashboard', 'board', 'backlog'
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auth States
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  // --- DATA FETCHING ---
  // Memoized to fix dependency warning
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { 'x-auth-token': token };
      const [tasksRes, sprintsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/tasks`, { headers }),
        fetch(`${API_BASE_URL}/sprints`, { headers })
      ]);

      const tasksData = await tasksRes.json();
      const sprintsData = await sprintsRes.json();

      if (tasksRes.ok) setTasks(tasksData);
      if (sprintsRes.ok) setSprints(sprintsData);
    } catch (err) {
      setError("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // --- EFFECTS ---
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, fetchData]);

  // --- AUTH ACTIONS ---
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
        alert("Registration successful! Please login.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // --- UI COMPONENTS ---

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-3 rounded-xl">
              <Trello className="text-white w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 text-center mb-8">
            {isLogin ? 'Enter your credentials to manage your sprints' : 'Join SprintMaster to start your first project'}
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email" required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors mt-2">
              {isLogin ? 'Sign In' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-indigo-600 hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Trello size={20} />
          </div>
          <span className="font-bold text-slate-800 text-lg">SprintMaster</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Layout size={20} /> <span className="font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => setView('board')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${view === 'board' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <ClipboardList size={20} /> <span className="font-medium">Active Board</span>
          </button>
          <button 
            onClick={() => setView('backlog')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${view === 'backlog' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Plus size={20} /> <span className="font-medium">Product Backlog</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center text-slate-600 uppercase text-xs font-bold">
              {user?.username?.[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.username}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut size={18} /> <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {loading && (
          <div className="absolute top-4 right-8">
            <Loader2 className="animate-spin text-indigo-600" size={20} />
          </div>
        )}
        
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-slate-800 capitalize">{view}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Current Date: Jan 20, 2026</span>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          {view === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm mb-1">Total Tasks</p>
                <h3 className="text-3xl font-bold text-slate-800">{tasks.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm mb-1">Open Sprints</p>
                <h3 className="text-3xl font-bold text-slate-800">
                  {sprints.filter(s => s.status !== 'Completed').length}
                </h3>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm mb-1">Completed Items</p>
                <h3 className="text-3xl font-bold text-indigo-600">
                  {tasks.filter(t => t.status === 'Done').length}
                </h3>
              </div>

              {/* Sprints List */}
              <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-600" /> Sprints
                  </h3>
                  <button className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1">
                    Create Sprint <Plus size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {sprints.map(s => (
                    <div key={s._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div>
                        <p className="font-semibold text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.goal || 'No goal set'}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          s.status === 'Active' ? 'bg-green-100 text-green-700' : 
                          s.status === 'Completed' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {s.status}
                        </span>
                        <ChevronRight size={18} className="text-slate-300" />
                      </div>
                    </div>
                  ))}
                  {sprints.length === 0 && <p className="text-center text-slate-400 py-8">No sprints found.</p>}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6">Recent Tasks</h3>
                <div className="space-y-4">
                  {tasks.slice(0, 5).map(t => (
                    <div key={t._id} className="flex gap-3">
                      <div className="mt-1">
                        {t.status === 'Done' ? <CheckCircle2 className="text-green-500" size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 leading-tight">{t.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold">{t.status}</p>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && <p className="text-center text-slate-400 py-4 text-sm">No tasks yet.</p>}
                </div>
              </div>
            </div>
          )}

          {view === 'board' && (
            <div className="flex gap-6 h-full overflow-x-auto pb-4">
              {['To Do', 'In Progress', 'Review', 'Done'].map(column => (
                <div key={column} className="flex-shrink-0 w-80 flex flex-col">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-700">{column}</h3>
                      <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {tasks.filter(t => t.status === column).length}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-2xl p-3 space-y-3 overflow-y-auto">
                    {tasks.filter(t => t.status === column).map(task => (
                      <div key={task._id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            task.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{task.storyPoints} pts</span>
                        </div>
                        <h4 className="font-semibold text-slate-800 text-sm mb-2 group-hover:text-indigo-600">{task.title}</h4>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-1.5">
                             <UserIcon size={12} className="text-slate-400" />
                             <span className="text-[10px] text-slate-500">{task.assignee?.username || 'Unassigned'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === 'backlog' && (
             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Task</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assignee</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Points</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {tasks.map(task => (
                        <tr key={task._id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800 text-sm">{task.title}</p>
                            <p className="text-xs text-slate-400 truncate max-w-xs">{task.description}</p>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              task.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-xs text-slate-600 font-medium">{task.status}</span>
                          </td>
                          <td className="px-6 py-4 flex items-center gap-2">
                             <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                {task.assignee?.username?.[0].toUpperCase() || '?'}
                             </div>
                             <span className="text-xs text-slate-600">{task.assignee?.username || 'None'}</span>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-sm font-semibold text-slate-800">{task.storyPoints}</span>
                          </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;