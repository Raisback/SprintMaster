import React from 'react';
import { ClipboardList, Trash2, CheckSquare } from 'lucide-react';

const Backlog = ({ tasks, deleteTask, canDeleteTasks, openEditModal }) => {
  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 overflow-x-auto shadow-sm">
      <table className="w-full text-left border-collapse min-w-[800px]">
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
          {tasks.map(task => {
            // Calculate DoD Progress
            const totalDoD = task.subtasks?.length || 0;
            const completedDoD = task.subtasks?.filter(s => s.completed).length || 0;

            return (
              <tr 
                key={task._id} 
                onClick={() => openEditModal(task)} // FIX: Enables the Update button/modal
                className="group hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${task.status === 'Done' ? 'bg-emerald-400' : 'bg-slate-300'}`}></div>
                    <div>
                      <p className="font-black text-sm text-slate-800">{task.title}</p>
                      {/* VISIBILITY: Show DoD status in the list */}
                      {totalDoD > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckSquare size={10} className="text-indigo-500" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            DoD: {completedDoD}/{totalDoD} Steps Done
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${
                    task.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                  }`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center font-black text-[10px] text-slate-500 border border-slate-200">
                      {task.assignee?.username?.substring(0, 2).toUpperCase() || '??'}
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
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }} 
                        className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-red-500 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Backlog;