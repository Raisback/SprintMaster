import React from 'react';
import { ClipboardList, Target, Clock, Users, Calendar, Trash2, Play, CheckCircle } from 'lucide-react';

const Dashboard = ({ tasks, sprints, availableUsers, calculateSprintProgress, canDeleteSprints, deleteSprint, updateSprintStatus }) => {
  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Stats Cards */}
      <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Tasks', value: tasks.length, icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Velocity', value: tasks.filter(t => t.status === 'Done').reduce((acc, t) => acc + t.storyPoints, 0), icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'Active Sprints', value: sprints.filter(s => s.status === 'active').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
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
        <h3 className="text-xl font-black tracking-tighter uppercase text-slate-800 mb-10">Strategic Roadmaps</h3>
        <div className="space-y-6">
          {sprints.map(sprint => (
            <div key={sprint._id} className="group p-8 bg-slate-50 hover:bg-indigo-50 rounded-[2rem] transition-all border border-transparent hover:border-indigo-100 relative">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-black text-lg text-slate-800">{sprint.name}</h4>
                    <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                      sprint.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 
                      sprint.status === 'completed' ? 'bg-slate-200 text-slate-500' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {sprint.status || 'planned'}
                    </span>
                  </div>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{sprint.goal || 'No goal defined'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Transition Controls */}
                  {sprint.status !== 'active' && sprint.status !== 'completed' && (
                    <button onClick={() => updateSprintStatus(sprint._id, 'active')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition-colors">
                      <Play size={12} fill="currentColor" /> Start Sprint
                    </button>
                  )}
                  {sprint.status === 'active' && (
                    <button onClick={() => updateSprintStatus(sprint._id, 'completed')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 transition-colors">
                      <CheckCircle size={12} /> Complete
                    </button>
                  )}
                  {/* Delete Option */}
                  {canDeleteSprints && (
                    <button onClick={() => deleteSprint(sprint._id)} className="p-2 hover:bg-red-500 hover:text-white text-slate-300 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="w-full h-3 bg-white rounded-full overflow-hidden p-0.5 border border-slate-100">
                <div 
                  className="h-full bg-indigo-600 rounded-full shadow-lg transition-all duration-1000"
                  style={{ width: `${calculateSprintProgress(sprint._id)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agile Collective Sidebar */}
      <div className="col-span-12 lg:col-span-4 bg-slate-900 rounded-[3rem] p-10 text-white">
        <h3 className="text-xl font-black tracking-tighter uppercase mb-10">Agile Collective</h3>
        <div className="space-y-6">
          {availableUsers.map(u => (
            <div key={u._id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-black text-xs uppercase">
                  {u.username.substring(0, 2)}
                </div>
                <div>
                  <p className="font-black text-sm">{u.username}</p>
                  <p className="text-indigo-400 font-bold text-[9px] uppercase tracking-widest">{u.role}</p>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${u.role === 'ScrumMaster' ? 'bg-indigo-400' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'}`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;