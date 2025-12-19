import React from 'react';
import { ClipboardList, Trash2 } from 'lucide-react';

const Backlog = ({ tasks, deleteTask, canDeleteTasks }) => {
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
          {tasks.map(task => (
            <tr key={task._id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    task.status === 'Done' ? 'bg-emerald-400' : 'bg-slate-300'
                  }`}></div>
                  <div>
                    <p className="font-black text-sm text-slate-800">{task.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.status}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${
                  task.priority === 'High' ? 'bg-red-50 text-red-500' :
                  task.priority === 'Medium' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                }`}>
                  {task.priority}
                </span>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center font-black text-[10px] text-slate-500 border border-slate-200">
                    {task.assignee?.username.substring(0, 2).toUpperCase() || '??'}
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
                    <button onClick={() => deleteTask(task._id)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-xl transition-all">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tasks.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-slate-300">
          <ClipboardList size={48} className="mb-4 opacity-20" />
          <p className="font-black text-[10px] uppercase tracking-[0.3em]">Backlog is currently clear</p>
        </div>
      )}
    </div>
  );
};

export default Backlog;