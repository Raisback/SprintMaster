import React from 'react';
import { Trash2 } from 'lucide-react';

const Board = ({ tasks, updateTaskStatus, moveTaskToStatus, deleteTask, canDeleteTasks }) => {
  const statuses = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];

  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const onDragOver = (e) => {
    e.preventDefault(); // Necessary to allow a drop
  };

  const onDrop = (e, targetStatus) => {
    const taskId = e.dataTransfer.getData("taskId");
    moveTaskToStatus(taskId, targetStatus);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {statuses.map(status => (
        <div 
          key={status} 
          className="space-y-6"
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, status)}
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
            <span className="bg-white border border-slate-100 text-slate-400 font-black text-[9px] px-2 py-1 rounded-lg">
              {tasks.filter(t => t.status === status).length}
            </span>
          </div>
          
          <div className="space-y-4 min-h-[500px]">
            {tasks.filter(t => t.status === status).map(task => (
              <div 
                key={task._id}
                draggable
                onDragStart={(e) => onDragStart(e, task._id)}
                onClick={() => updateTaskStatus(task._id, task.status, 1)}
                onContextMenu={(e) => { e.preventDefault(); updateTaskStatus(task._id, task.status, -1); }}
                className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative active:cursor-grabbing"
              >
                {canDeleteTasks && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }}
                    className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div className="flex gap-2 mb-4">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                    task.priority === 'High' ? 'bg-red-50 text-red-500' :
                    task.priority === 'Medium' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                  }`}>
                    {task.priority}
                  </span>
                  {task.sprintId && (
                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600">
                      {task.sprintId.name}
                    </span>
                  )}
                </div>
                <h4 className="font-black text-sm text-slate-800 leading-tight mb-2">{task.title}</h4>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide line-clamp-2 mb-4">{task.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center font-black text-[8px] text-slate-500">
                      {task.assignee?.username.substring(0, 1).toUpperCase() || '?'}
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase">{task.assignee?.username || 'Unassigned'}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-800 bg-slate-50 px-2 py-1 rounded-lg">
                    {task.storyPoints} SP
                  </span>
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