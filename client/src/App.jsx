import React, { useState, useEffect, useCallback } from 'react';
import { 
  Layout, Trello, LogOut, Plus, ClipboardList, Calendar, 
  ChevronRight, AlertCircle, X, Trash2, Clock, Target, Users,
  CheckCircle2, Loader2, User as UserIcon
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

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { 'x-auth-token': token };
      const [tRes, sRes, uRes] = await Promise.all([
        fetch(`${API_BASE_URL}/tasks`, { headers }),
        fetch(`${API_BASE_URL}/sprints`, { headers }),
        fetch(`${API_BASE_URL}/users`, { headers })
      ]);

      if (tRes.ok) setTasks(await tRes.json());
      if (sRes.ok) setSprints(await sRes.json());
      if (uRes.ok) setAvailableUsers(await uRes.json());
    } catch (err) {
      setError("Failed to sync data with server.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const updateTaskStatus = async (taskId, currentStatus) => {
    const statuses = ['To Do', 'In Progress', 'Review', 'Done'];
    const idx = statuses.indexOf(currentStatus);
    if (idx === -1) return;
    const nextStatus = statuses[(idx + 1) % statuses.length];
    
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const deleteTask = async (taskId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const deleteSprint = async (sprintId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this sprint? Associated tasks will move to the Backlog.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/sprints/${sprintId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
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

  if (!token) return <div className="p-20 text-center font-bold">Session expired. Please log in.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r fixed h-full flex flex-col z-20">
        <div className="p-8 flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
            <Trello size={24} />
          </div>
          <span className="font-black text-slate-800 text-xl tracking-tighter uppercase">SprintMaster</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'dashboard', icon: Layout, label: 'Dashboard' },
            { id: 'board', icon: ClipboardList, label: 'Active Board' },
            { id: 'backlog', icon: Plus, label: 'Backlog' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                view === item.id 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              <item.icon size={22} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-rose-500 hover:bg-rose-50 transition-all">
            <LogOut size={22} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">{view}</h2>
            <p className="text-slate-400 font-medium">Manage your agile workflow and team velocity.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setShowSprintModal(true)} className="bg-white border-2 border-slate-100 text-slate-800 px-8 py-3 rounded-2xl font-black shadow-sm hover:border-indigo-200 transition-all">
              + Add Sprint
            </button>
            <button onClick={() => setShowTaskModal(true)} className="bg-slate-800 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-slate-200 hover:bg-slate-900 transition-all">
              + Add Task
            </button>
          </div>
        </header>

        {loading && <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>}

        {view === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sprints.map(sprint => (
              <div key={sprint._id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm relative group hover:shadow-2xl hover:border-indigo-100 transition-all">
                <button onClick={(e) => deleteSprint(sprint._id, e)} className="absolute top-8 right-8 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={20} />
                </button>
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl"><Target size={24}/></div>
                  <div>
                    <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">{sprint.name}</h3>
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase">{sprint.status}</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed line-clamp-2 font-medium">{sprint.goal || 'No objective defined for this sprint yet.'}</p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <div className="flex items-center gap-2"><Clock size={14}/> {new Date(sprint.endDate).toLocaleDateString()}</div>
                   <div className="flex items-center gap-2"><Users size={14}/> Team Active</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'board' && (
          <div className="flex gap-8 overflow-x-auto pb-10">
            {['To Do', 'In Progress', 'Review', 'Done'].map(col => (
              <div key={col} className="w-80 flex-shrink-0">
                <div className="flex items-center justify-between mb-6 px-4">
                   <h3 className="font-black text-[11px] text-slate-400 uppercase tracking-[0.2em]">{col}</h3>
                   <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                     {tasks.filter(t => t.status === col && t.sprintId).length}
                   </span>
                </div>
                <div className="bg-slate-100/40 rounded-[2.5rem] p-3 min-h-[600px] space-y-4 border-2 border-dashed border-slate-200/50">
                  {tasks.filter(t => t.status === col && t.sprintId).map(task => (
                    <div key={task._id} onClick={() => updateTaskStatus(task._id, task.status)} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer group hover:border-indigo-400 hover:shadow-xl transition-all active:scale-95">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                          task.priority === 'High' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'
                        }`}>{task.priority}</span>
                        <button onClick={(e) => deleteTask(task._id, e)} className="text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mb-4 leading-relaxed">{task.title}</h4>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-slate-400">
                          <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center"><UserIcon size={12}/></div>
                          <span className="text-[10px] font-bold uppercase">{task.assignee?.username || 'Open'}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-300">{task.storyPoints} PTS</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'backlog' && (
          <div className="bg-white rounded-[3rem] border-2 border-slate-50 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-10 py-8">Task Title</th>
                  <th className="px-10 py-8">Priority</th>
                  <th className="px-10 py-8">Points</th>
                  <th className="px-10 py-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tasks.filter(t => !t.sprintId).map(task => (
                  <tr key={task._id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="font-black text-slate-800">{task.title}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{task.priority} • Unassigned</div>
                    </td>
                    <td className="px-10 py-8">
                       <span className="text-[10px] font-black bg-slate-100 px-3 py-1.5 rounded-full uppercase text-slate-500">{task.priority}</span>
                    </td>
                    <td className="px-10 py-8 font-black text-slate-300">{task.storyPoints}</td>
                    <td className="px-10 py-8 text-right">
                      <button onClick={(e) => deleteTask(task._id, e)} className="text-slate-200 hover:text-rose-500 p-2 transition-all"><Trash2 size={20}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODALS (Full Logic Restored) */}
      {showSprintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border-2 border-indigo-100">
             <div className="p-10 bg-indigo-600 text-white flex justify-between items-center">
                <h3 className="font-black uppercase tracking-[0.2em] text-xl">New Sprint</h3>
                <button onClick={() => setShowSprintModal(false)} className="hover:rotate-90 transition-all"><X size={28}/></button>
             </div>
             <form onSubmit={handleCreateSprint} className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sprint Name</label>
                  <input placeholder="e.g. Q1 Development Phase" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold" value={newSprint.name} onChange={e => setNewSprint({...newSprint, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sprint Goal</label>
                  <textarea placeholder="What are we achieving?" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold h-32" value={newSprint.goal} onChange={e => setNewSprint({...newSprint, goal: e.target.value})}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Start Date</label>
                    <input type="date" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs" value={newSprint.startDate} onChange={e => setNewSprint({...newSprint, startDate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">End Date</label>
                    <input type="date" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs" value={newSprint.endDate} onChange={e => setNewSprint({...newSprint, endDate: e.target.value})} />
                  </div>
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-3xl shadow-xl transition-all transform active:scale-95 uppercase tracking-widest text-xs">Start Sprint</button>
             </form>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border-2 border-indigo-100">
             <div className="p-10 bg-slate-800 text-white flex justify-between items-center">
                <h3 className="font-black uppercase tracking-[0.2em] text-xl">Create Task</h3>
                <button onClick={() => setShowTaskModal(false)} className="hover:rotate-90 transition-all"><X size={28}/></button>
             </div>
             <form onSubmit={handleCreateTask} className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Task Title</label>
                  <input placeholder="Fix the navigation bugs..." required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Assign To</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none" value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})}>
                      <option value="">Unassigned</option>
                      {availableUsers.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Priority</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Blocker">Blocker</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Assign to Sprint (Optional)</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none" value={newTask.sprintId} onChange={e => setNewTask({...newTask, sprintId: e.target.value})}>
                    <option value="">Send to Backlog</option>
                    {sprints.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-5 rounded-3xl shadow-xl transition-all transform active:scale-95 uppercase tracking-widest text-xs">Confirm Task</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;