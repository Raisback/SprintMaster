import React, { useState } from 'react';
import { Trash2, CheckSquare } from 'lucide-react';

const Board = ({ tasks, selectedSprintId, moveTaskToStatus, deleteTask, canDeleteTasks, openEditModal }) => {
  const [activeColumn, setActiveColumn] = useState(null);
  const [dragCounter, setDragCounter] = useState({});
  const statuses = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];

  // Filter tasks by selected sprint
  const filteredTasks = tasks.filter(task => {
    if (selectedSprintId === 'all') return true;
    const taskSprintId = task.sprintId?._id || task.sprintId;
    return taskSprintId === selectedSprintId;
  });

  // NEW: Function to get count for a specific status
  const getTaskCount = (status) => {
    return filteredTasks.filter(t => t.status === status).length;
  };

  const handleDragEnter = (e, status) => {
    e.preventDefault();
    setDragCounter(prev => ({ ...prev, [status]: (prev[status] || 0) + 1 }));
    setActiveColumn(status);
  };

  const handleDragLeave = (e, status) => {
    const newCount = (dragCounter[status] || 0) - 1;
    setDragCounter(prev => ({ ...prev, [status]: newCount }));
    if (newCount <= 0) {
      setActiveColumn(null);
    }
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    setActiveColumn(null);
    setDragCounter({});
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      moveTaskToStatus(taskId, status);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {statuses.map(status => (
        <div 
          key={status} 
          className={`space-y-6 transition-all duration-200 rounded-3xl p-2 min-h-[600px] ${
            activeColumn === status ? 'bg-indigo-50/50 ring-2 ring-indigo-200 ring-dashed' : ''
          }`} 
          onDragOver={(e) => e.preventDefault()} 
          onDragEnter={(e) => handleDragEnter(e, status)}
          onDragLeave={(e) => handleDragLeave(e, status)}
          onDrop={(e) => handleDrop(e, status)}
        >
          {/* Header with Task Count Badge */}
          <div className="px-2 pointer-events-none flex items-center justify-between">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status === 'Done' ? 'bg-emerald-400' : 'bg-indigo-400'}`}></span>
              {status}
            </h3>
            <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-lg">
              {getTaskCount(status)}
            </span>
          </div>
          
          <div className="space-y-4 pointer-events-none">
            {filteredTasks.filter(t => t.status === status).map(task => {
              const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
              const totalSubtasks = task.subtasks?.length || 0;

              return (
                <div 
                  key={task._id} 
                  draggable 
                  className="pointer-events-auto group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer relative"
                  onDragStart={(e) => {
                    e.dataTransfer.setData("taskId", task._id);
                    e.currentTarget.style.opacity = '0.4';
                  }}
                  onDragEnd={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onClick={() => openEditModal(task)}
                >
                  {canDeleteTasks && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }} 
                      className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <div className="mb-4">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${task.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                      {task.priority}
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-slate-800 mb-2">{task.title}</h4>
                  
                  {totalSubtasks > 0 && (
                    <div className="flex items-center gap-2 mb-4 bg-slate-50 p-2 rounded-xl">
                      <CheckSquare size={12} className={completedSubtasks === totalSubtasks ? "text-emerald-500" : "text-slate-400"} />
                      <span className="text-[10px] font-black text-slate-500 uppercase">{completedSubtasks}/{totalSubtasks} DoD Ticked</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                     <span className="text-[9px] font-black text-slate-400 uppercase">{task.assignee?.username || 'Unassigned'}</span>
                     <span className="text-[10px] font-black text-slate-800 bg-slate-50 px-2 py-1 rounded-lg">{task.storyPoints} SP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Board;