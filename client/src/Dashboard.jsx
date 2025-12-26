import React from 'react';
import { ClipboardList, Target, Clock, Users, Trash2, Play, CheckCircle, TrendingUp, ArrowUpRight } from 'lucide-react';

const Dashboard = ({ tasks, sprints, availableUsers, calculateSprintProgress, canDeleteSprints, deleteSprint, updateSprintStatus }) => {
  const activeSprint = sprints.find(s => s.status === 'active');

  return (
    <div className="grid grid-cols-12 gap-5 animate-in fade-in duration-500">
      {/* Active Sprint Hero - Gradient Glassmorphism */}
      {activeSprint && (
        <div className="col-span-12 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-[2rem] p-7 text-white mb-2 relative overflow-hidden shadow-xl shadow-indigo-100/50 group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-white/20 rounded-md backdrop-blur-md">
                   <TrendingUp size={12} className="text-white" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-100">Live Cycle Insight</span>
              </div>
              <h2 className="text-3xl font-black tracking-tighter mb-2 leading-none flex items-center gap-3">
                {activeSprint.name}
                <ArrowUpRight size={20} className="text-white/40" />
              </h2>
              <p className="text-indigo-50 font-medium text-xs italic opacity-80 max-w-sm leading-snug">
                "{activeSprint.goal || 'Focused development cycle'}"
              </p>
            </div>
            
            <div className="flex gap-8 border-l border-white/10 pl-8">
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200 mb-1">Current Velocity</p>
                <div className="text-3xl font-black tracking-tighter tabular-nums">{calculateSprintProgress(activeSprint._id)}%</div>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200 mb-1">Timebox</p>
                <div className="text-3xl font-black tracking-tighter tabular-nums">
                  {Math.max(0, Math.ceil((new Date(activeSprint.endDate) - new Date()) / (1000 * 60 * 60 * 24)))}d
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid - Floating Cards */}
      <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Backlog', value: tasks.length, icon: ClipboardList, color: 'indigo' },
          { label: 'Burned Points', value: tasks.filter(t => t.status === 'Done').reduce((acc, t) => acc + t.storyPoints, 0), icon: Target, color: 'emerald' },
          { label: 'Total Cycles', value: sprints.length, icon: Clock, color: 'amber' },
          { label: 'Collaborators', value: availableUsers.length, icon: Users, color: 'blue' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group">
            <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Roadmap - List Style with Glass Indicators */}
      <div className="col-span-12 lg:col-span-8 bg-white rounded-[2rem] p-7 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <ClipboardList size={120} />
        </div>
        <h3 className="text-xs font-black tracking-widest uppercase text-slate-800 mb-6 flex items-center gap-2">
          <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
          Strategic Roadmap
        </h3>
        <div className="space-y-3">
          {sprints.map(sprint => (
            <div key={sprint._id} className="group p-4 bg-slate-50/50 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-100 hover:shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <h4 className="font-black text-[13px] text-slate-700">{sprint.name}</h4>
                  <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${
                    sprint.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    sprint.status === 'completed' ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}>{sprint.status || 'planned'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {sprint.status !== 'active' && sprint.status !== 'completed' && (
                    <button onClick={() => updateSprintStatus(sprint._id, 'active')} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all hover:scale-105 active:scale-95">
                      <Play size={10} fill="currentColor" />
                    </button>
                  )}
                  {sprint.status === 'active' && (
                    <button onClick={() => updateSprintStatus(sprint._id, 'completed')} className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-black transition-all">
                      Finalize Cycle
                    </button>
                  )}
                  {canDeleteSprints && (
                    <button onClick={() => deleteSprint(sprint._id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={12} /></button>
                  )}
                </div>
              </div>
              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(79,70,229,0.4)]" style={{ width: `${calculateSprintProgress(sprint._id)}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Sidebar - Midnight Navy Premium */}
      <div className="col-span-12 lg:col-span-4 bg-[#0f172a] rounded-[2rem] p-7 text-white shadow-2xl relative overflow-hidden">
        {/* Abstract Background pattern */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl"></div>
        
        <h3 className="text-xs font-black tracking-widest uppercase mb-6 text-indigo-400 flex items-center gap-2">
          <Users size={14} />
          Collaborators
        </h3>
        
        <div className="space-y-3 relative z-10">
          {availableUsers.map(u => (
            <div key={u._id} className="flex items-center justify-between p-3 bg-white/[0.03] hover:bg-white/[0.08] rounded-xl border border-white/[0.05] transition-all group cursor-default">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {u.profileImage ? (
                      <img 
                        src={`http://localhost:5000${u.profileImage}`} 
                        alt={u.username}
                        className="w-9 h-9 rounded-lg object-cover shadow-lg group-hover:rotate-6 transition-transform"
                        onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + u.username; }}
                      />
                    ) : (
                      <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-lg flex items-center justify-center font-black text-[10px] uppercase shadow-lg group-hover:rotate-6 transition-transform">
                        {u.username.substring(0, 2)}
                      </div>
                    )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0f172a] rounded-full"></div>
                </div>
                <div>
                  <p className="font-black text-xs tracking-tight group-hover:text-indigo-300 transition-colors">{u.username}</p>
                  <p className="text-white/40 font-bold text-[8px] uppercase tracking-widest">{u.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;