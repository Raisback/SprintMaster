import React, { useState } from 'react';
import { Trash2, CheckSquare } from 'lucide-react';

const Board = ({ tasks, selectedSprintId, moveTaskToStatus, deleteTask, canDeleteTasks, openEditModal }) => {
  const [activeColumn, setActiveColumn] = useState(null);
  const [dragCounter, setDragCounter] = useState({});
  const statuses = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];

  const filteredTasks = tasks.filter(task => {
    if (selectedSprintId === 'all') return true;
    const taskSprintId = task.sprintId?._id || task.sprintId;
    return taskSprintId === selectedSprintId;
  });

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
    // FIX: Changed overflow-hidden to overflow-x-auto to prevent clipping and allow scrolling on small screens
    <div className="flex flex-col lg:flex-row min-h-screen bg-white rounded-3xl border border-slate-200 overflow-x-auto">
      {statuses.map((status, index) => (
        <div 
          key={status} 
          className={`flex-1 flex flex-col min-w-[280px] transition-all duration-300 
            ${index !== statuses.length - 1 ? 'border-r border-slate-100' : ''} 
            ${activeColumn === status ? 'bg-indigo-50/30' : 'bg-slate-50/30'}`} 
          onDragOver={(e) => e.preventDefault()} 
          onDragEnter={(e) => handleDragEnter(e, status)}
          onDragLeave={(e) => handleDragLeave(e, status)}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${status === 'Done' ? 'bg-emerald-400' : 'bg-indigo-400'}`}></span>
                {status}
              </h3>
              <span className="bg-white border border-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                {getTaskCount(status)}
              </span>
            </div>
          </div>
          
          {/* FIX: Added px-4 (horizontal padding) to ensure card shadows aren't cut off by borders */}
          <div className="p-4 px-5 space-y-4 flex-1 pointer-events-none">
            {filteredTasks.filter(t => t.status === status).map(task => {
              const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
              const totalSubtasks = task.subtasks?.length || 0;

              return (
                <div 
                  key={task._id} 
                  draggable 
                  className="pointer-events-auto group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-grab active:cursor-grabbing relative"
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
                      className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  
                  <div className="mb-3 flex justify-between items-start">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${task.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      {task.priority}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-sm text-slate-800 mb-3 leading-tight truncate">{task.title}</h4>
                  
                  {totalSubtasks > 0 && (
                    <div className="flex items-center gap-2 mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <CheckSquare size={12} className={completedSubtasks === totalSubtasks ? "text-emerald-500" : "text-slate-400"} />
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{completedSubtasks}/{totalSubtasks} Subtasks</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                     <span className="text-[9px] font-bold text-slate-400 uppercase">{task.assignee?.username || 'Unassigned'}</span>
                     <span className="text-[10px] font-black text-slate-700">{task.storyPoints} SP</span>
                  </div>
                </div>
              );
            })}
            
            {getTaskCount(status) === 0 && (
              <div className="border-2 border-dashed border-slate-100 rounded-2xl h-24 flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Empty</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Board;