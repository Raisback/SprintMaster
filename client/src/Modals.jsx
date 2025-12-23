import React from 'react';
import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const TaskModal = ({ setShowTaskModal, newTask, setNewTask, availableUsers, sprints, handleSave, isEditing }) => {
  
  const addSubtask = () => {
    setNewTask({ ...newTask, subtasks: [...(newTask.subtasks || []), { text: '', completed: false }] });
  };

  const updateSubtask = (index, value) => {
    const updated = [...newTask.subtasks];
    updated[index].text = value;
    setNewTask({ ...newTask, subtasks: updated });
  };

  const toggleSubtask = (index) => {
    const updated = [...newTask.subtasks];
    updated[index].completed = !updated[index].completed;
    setNewTask({ ...newTask, subtasks: updated });
  };

  const removeSubtask = (index) => {
    setNewTask({ ...newTask, subtasks: newTask.subtasks.filter((_, i) => i !== index) });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-12 relative border border-slate-100 max-h-[90vh] overflow-y-auto">
        <button onClick={() => setShowTaskModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><X size={24} /></button>
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 uppercase">{isEditing ? 'Refine Requirement' : 'New Requirement'}</h2>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Core Identity</label>
              <input type="text" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" placeholder="Feature Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              <textarea className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm h-32 resize-none" placeholder="Description..." value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}></textarea>
              
              <div className="grid grid-cols-2 gap-4">
                <select className="px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs" value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})}>
                  <option value="">Owner</option>
                  {availableUsers.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                </select>
                <select className="px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs" value={newTask.sprintId} onChange={e => setNewTask({...newTask, sprintId: e.target.value})}>
                  <option value="">Backlog</option>
                  {sprints.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Phase 5: Definition of Done (Subtasks) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Definition of Done</label>
                <button type="button" onClick={addSubtask} className="text-indigo-600 hover:text-indigo-700 font-black text-[10px] uppercase flex items-center gap-1">
                  <Plus size={12} /> Add Step
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {newTask.subtasks?.map((st, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <button type="button" onClick={() => toggleSubtask(i)}>
                      <CheckCircle2 size={18} className={st.completed ? "text-emerald-500" : "text-slate-300"} />
                    </button>
                    <input type="text" className="bg-transparent outline-none text-xs font-bold w-full" value={st.text} placeholder="Task step..." onChange={e => updateSubtask(i, e.target.value)} />
                    <button type="button" onClick={() => removeSubtask(i)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all">
            {isEditing ? 'Update Requirement' : 'Commit Requirement'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const SprintModal = ({ setShowSprintModal, newSprint, setNewSprint, createSprint }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
    <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-12 relative border border-slate-100">
      <button onClick={() => setShowSprintModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><X size={24} /></button>
      <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 uppercase">Init Cycle</h2>
      <form onSubmit={createSprint} className="space-y-6">
        <input type="text" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" placeholder="Sprint Name" value={newSprint.name} onChange={e => setNewSprint({...newSprint, name: e.target.value})} />
        <textarea className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm h-24 resize-none" placeholder="Goal" value={newSprint.goal} onChange={e => setNewSprint({...newSprint, goal: e.target.value})}></textarea>
        <div className="grid grid-cols-2 gap-4">
          <input type="date" className="px-6 py-4 bg-slate-50 rounded-2xl font-bold text-xs" value={newSprint.startDate} onChange={e => setNewSprint({...newSprint, startDate: e.target.value})} />
          <input type="date" className="px-6 py-4 bg-slate-50 rounded-2xl font-bold text-xs" value={newSprint.endDate} onChange={e => setNewSprint({...newSprint, endDate: e.target.value})} />
        </div>
        <button type="submit" className="w-full py-6 bg-slate-800 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-900 transition-all">Authorize Cycle</button>
      </form>
    </div>
  </div>
);