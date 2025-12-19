import React from 'react';
import { X } from 'lucide-react';

export const TaskModal = ({ setShowTaskModal, newTask, setNewTask, availableUsers, sprints, createTask }) => (
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
);

export const SprintModal = ({ setShowSprintModal, newSprint, setNewSprint, createSprint }) => (
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
);