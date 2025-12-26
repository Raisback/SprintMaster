import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, MessageSquare, Send } from 'lucide-react';

export const TaskModal = ({ setShowTaskModal, newTask, setNewTask, availableUsers, sprints, handleSave, isEditing }) => {
  const [commentText, setCommentText] = useState('');

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

  const postComment = async () => {
    // 1. Validation check with logging
    if (!commentText.trim()) {
      console.warn("Comment text is empty.");
      return;
    }
    
    if (!newTask._id) {
      console.error("Task ID is missing. You cannot comment on a task before saving it.");
      alert("Please save the requirement first before posting comments.");
      return;
    }
    
    try {
      console.log("Attempting to post comment to task:", newTask._id);
      
      const res = await fetch(`http://localhost:5000/api/tasks/${newTask._id}/comments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'x-auth-token': localStorage.getItem('token') 
        },
        body: JSON.stringify({ text: commentText })
      });

      if (res.ok) {
        const updatedComments = await res.json();
        // Update the task state with the new list of comments
        setNewTask({ ...newTask, comments: updatedComments }); 
        setCommentText(''); 
        console.log("Comment posted successfully!");
      } else {
        const errorData = await res.json();
        console.error("Server error when posting comment:", errorData);
        alert(`Error: ${errorData.msg || 'Failed to post comment'}`);
      }
    } catch (err) {
      console.error("Network or Fetch error:", err);
      alert("Could not connect to the server.");
    }
  };

const deleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${newTask._id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 
          'x-auth-token': localStorage.getItem('token') 
        }
      });

      if (res.ok) {
        const updatedComments = await res.json();
        setNewTask({ ...newTask, comments: updatedComments });
      } else {
        const data = await res.json();
        alert(data.msg || "Failed to delete comment");
      }
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-12 relative border border-slate-100 max-h-[90vh] overflow-y-auto">
        <button onClick={() => setShowTaskModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition-colors">
          <X size={24} />
        </button>
        
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 uppercase">
          {isEditing ? 'Refine Requirement' : 'New Requirement'}
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Core Identity & Subtasks */}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Core Identity</label>
              <input 
                type="text" 
                required 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-indigo-500 transition-all" 
                placeholder="Feature Title" 
                value={newTask.title || ''} 
                onChange={e => setNewTask({...newTask, title: e.target.value})} 
              />
              <textarea 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm h-32 resize-none focus:border-indigo-500 transition-all" 
                placeholder="Description..." 
                value={newTask.description || ''} 
                onChange={e => setNewTask({...newTask, description: e.target.value})}
              ></textarea>
              
              <div className="grid grid-cols-2 gap-4">
                <select className="px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none" value={newTask.assignee || ''} onChange={e => setNewTask({...newTask, assignee: e.target.value})}>
                  <option value="">Owner</option>
                  {availableUsers.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                </select>
                <select className="px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none" value={newTask.sprintId || ''} onChange={e => setNewTask({...newTask, sprintId: e.target.value})}>
                  <option value="">Backlog</option>
                  {sprints.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Definition of Done</label>
                <button type="button" onClick={addSubtask} className="text-indigo-600 hover:text-indigo-700 font-black text-[10px] uppercase flex items-center gap-1">
                  <Plus size={12} /> Add Step
                </button>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {newTask.subtasks?.map((st, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <button type="button" onClick={() => toggleSubtask(i)}>
                      <CheckCircle2 size={18} className={st.completed ? "text-emerald-500" : "text-slate-300"} />
                    </button>
                    <input type="text" className="bg-transparent outline-none text-xs font-bold w-full" value={st.text} placeholder="Task step..." onChange={e => updateSubtask(i, e.target.value)} />
                    <button type="button" onClick={() => removeSubtask(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all active:scale-[0.98]">
              {isEditing ? 'Update Requirement' : 'Commit Requirement'}
            </button>
          </form>

          {/* Right Column: Discussion System */}
          <div className="flex flex-col border-l border-slate-100 pl-8 h-full">
            <div className="flex items-center gap-2 mb-6 ml-2">
              <MessageSquare size={16} className="text-indigo-500" />
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Discussion</label>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-4 mb-6 custom-scrollbar min-h-[300px] max-h-[500px]">
              {isEditing ? (
                newTask.comments && newTask.comments.length > 0 ? (
                  newTask.comments.map((c) => (
                    <div key={c._id || Math.random()} className="group">
                      <div className="flex justify-between items-center mb-1 px-1">
                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter">
                          {c.author?.username || 'System User'}
                        </span>
                        <span className="text-[8px] text-slate-300 font-bold">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Just now'}
                        </span>
                        <button 
                          onClick={() => deleteComment(c._id)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl group-hover:bg-slate-100 transition-colors">
                        <p className="text-xs font-bold text-slate-600 leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 opacity-50">
                    <MessageSquare size={32} strokeWidth={1} />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No signals yet</p>
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 opacity-50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-center">Save the task first to enable discussion</p>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="relative mt-auto">
                <input 
                  type="text" 
                  className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-inner" 
                  placeholder="Post a comment..." 
                  value={commentText} 
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && postComment()}
                />
                <button 
                  type="button" 
                  onClick={postComment} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg active:scale-90"
                >
                  <Send size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SprintModal = ({ setShowSprintModal, newSprint, setNewSprint, createSprint }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
    <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-12 relative border border-slate-100">
      <button onClick={() => setShowSprintModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition-colors">
        <X size={24} />
      </button>
      <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 uppercase text-center">Init Cycle</h2>
      <form onSubmit={createSprint} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Identity</label>
          <input type="text" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-indigo-500 transition-all" placeholder="Sprint Name" value={newSprint.name} onChange={e => setNewSprint({...newSprint, name: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Objective</label>
          <textarea className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm h-24 resize-none focus:border-indigo-500 transition-all" placeholder="Sprint Goal" value={newSprint.goal} onChange={e => setNewSprint({...newSprint, goal: e.target.value})}></textarea>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Start</label>
            <input type="date" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none focus:border-indigo-500 transition-all" value={newSprint.startDate} onChange={e => setNewSprint({...newSprint, startDate: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">End</label>
            <input type="date" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none focus:border-indigo-500 transition-all" value={newSprint.endDate} onChange={e => setNewSprint({...newSprint, endDate: e.target.value})} />
          </div>
        </div>
        <button type="submit" className="w-full py-6 bg-slate-800 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl active:scale-[0.98]">
          Authorize Cycle
        </button>
      </form>
    </div>
  </div>
);