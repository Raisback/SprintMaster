import React from 'react';
import { Trash2 } from 'lucide-react';

const Board = ({ tasks, selectedSprintId, moveTaskToStatus, deleteTask, canDeleteTasks, openEditModal }) => {
  const statuses = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];

  const filteredTasks = tasks.filter(task => {
    if (selectedSprintId === 'all') return true;
    const taskSprintId = task.sprintId?._id || task.sprintId;
    return taskSprintId === selectedSprintId;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {statuses.map(status => (
        <div 
          key={status} 
          className="space-y-6"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => moveTaskToStatus(e.dataTransfer.getData("taskId"), status)}
        >
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                status === 'Backlog' ? 'bg-slate-300' :
                status === 'To Do' ? 'bg-indigo-400' :
                status === 'In Progress' ? 'bg-amber-400' :
                status === 'Review' ? 'bg-purple-400' : 'bg-emerald-400'
              }`}></span>
              {status}
            </h3>
          </div>
          
          <div className="space-y-4 min-h-[500px]">
            {filteredTasks.filter(t => t.status === status).map(task => (
              <div 
                key={task._id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("taskId", task._id)}
                onClick={() => openEditModal(task)}
                className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer relative"
              >
                {canDeleteTasks && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }}
                    className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div className="flex gap-2 mb-4 text-[8px] font-black uppercase tracking-widest">
                  <span className={`px-2 py-1 rounded-lg ${task.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    {task.priority}
                  </span>
                </div>
                <h4 className="font-black text-sm text-slate-800 mb-2 leading-tight">{task.title}</h4>
                <p className="text-slate-400 text-[10px] line-clamp-2 mb-4 uppercase font-bold tracking-wide">{task.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <span className="text-[9px] font-black text-slate-400 uppercase">{task.assignee?.username || 'Unassigned'}</span>
                   <span className="text-[10px] font-black text-slate-800 bg-slate-50 px-2 py-1 rounded-lg">{task.storyPoints} SP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Board;