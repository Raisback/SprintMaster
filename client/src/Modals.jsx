import React from 'react';
import { X } from 'lucide-react';

export const TaskModal = ({ setShowTaskModal, newTask, setNewTask, availableUsers, sprints, handleSave, isEditing }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
    <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-12 relative border border-slate-100">
      <button onClick={() => setShowTaskModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition-colors">
        <X size={24} />
      </button>
      <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 uppercase">
        {isEditing ? 'Modify Requirement' : 'Create New Requirement'}
      </h2>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Title</label>
          <input type="text" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm" placeholder="Define the feature..." value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Description</label>
          <textarea className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm h-32 resize-none" placeholder="Provide context..." value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}></textarea>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Assignee</label>
            <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-xs" value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})}>
              <option value="">Unassigned</option>
              {availableUsers.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sprint Context</label>
            <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-xs" value={newTask.sprintId} onChange={e => setNewTask({...newTask, sprintId: e.target.value})}>
              <option value="">Backlog Only</option>
              {sprints.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]">
          {isEditing ? 'Commit Changes' : 'Deploy Task'}
        </button>
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
      <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 uppercase">Initialize Cycle</h2>
      <form onSubmit={createSprint} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cycle Name</label>
          <input type="text" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm" placeholder="e.g. Sprint 24: Core Refactor" value={newSprint.name} onChange={e => setNewSprint({...newSprint, name: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Strategic Goal</label>
          <textarea className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm h-24 resize-none" placeholder="What is the definition of success?" value={newSprint.goal} onChange={e => setNewSprint({...newSprint, goal: e.target.value})}></textarea>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input type="date" className="px-6 py-4 bg-slate-50 rounded-2xl font-bold text-xs" value={newSprint.startDate} onChange={e => setNewSprint({...newSprint, startDate: e.target.value})} />
          <input type="date" className="px-6 py-4 bg-slate-50 rounded-2xl font-bold text-xs" value={newSprint.endDate} onChange={e => setNewSprint({...newSprint, endDate: e.target.value})} />
        </div>
        <button type="submit" className="w-full py-6 bg-slate-800 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all active:scale-[0.98]">
          Authorize Cycle
        </button>
      </form>
    </div>
  </div>
);