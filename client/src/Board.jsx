import React, { useState } from 'react';
import { Trash2, CheckSquare, MoreHorizontal, Layout } from 'lucide-react';

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
    if (newCount <= 0) setActiveColumn(null);
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    setActiveColumn(null);
    setDragCounter({});
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) moveTaskToStatus(taskId, status);
  };

  return (
    <div className="h-[calc(100vh-190px)] w-full overflow-x-auto pb-4 custom-scrollbar">
      <div className="flex gap-4 h-full min-w-max">
        {statuses.map((status) => (
          <div 
            key={status} 
            className={`flex-shrink-0 w-[300px] flex flex-col rounded-[2rem] transition-all duration-300 border h-full ${
              activeColumn === status 
              ? 'bg-indigo-50 border-indigo-200 ring-4 ring-indigo-500/5 shadow-inner' 
              : 'bg-slate-100/40 border-slate-100'
            }`} 
            onDragOver={(e) => e.preventDefault()} 
            onDragEnter={(e) => handleDragEnter(e, status)}
            onDragLeave={(e) => handleDragLeave(e, status)}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column Header - More Compact */}
            <div className="p-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${status === 'Done' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]'}`}></div>
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-600">{status}</h3>
              </div>
              <span className="bg-white border border-slate-200 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                {getTaskCount(status)}
              </span>
            </div>
            
            {/* Task Area - Tighter spacing */}
            <div className="px-3 pb-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar-thin">
              {filteredTasks.filter(t => t.status === status).map(task => {
                const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
                const totalSubtasks = task.subtasks?.length || 0;

                return (
                  <div 
                    key={task._id} 
                    draggable 
                    className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all cursor-grab active:cursor-grabbing group relative"
                    onDragStart={(e) => {
                      e.dataTransfer.setData("taskId", task._id);
                      e.currentTarget.style.opacity = '0.5';
                    }}
                    onDragEnd={(e) => e.currentTarget.style.opacity = '1'}
                    onClick={() => openEditModal(task)}
                  >
                    <div className="flex justify-between items-start mb-2.5">
                      <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                        task.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-500'
                      }`}>
                        {task.priority}
                      </span>
                      <button className="text-slate-300 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"><MoreHorizontal size={12}/></button>
                    </div>
                    
                    <h4 className="font-black text-[13px] text-slate-800 mb-3 leading-tight tracking-tight">
                      {task.title}
                    </h4>
                    
                    {totalSubtasks > 0 && (
                      <div className="bg-slate-50/50 rounded-xl p-2 mb-3 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                           <CheckSquare size={12} className={completedSubtasks === totalSubtasks ? "text-emerald-500" : "text-indigo-400"} />
                           <span className="text-[9px] font-black text-slate-400 uppercase">Task Progress</span>
                        </div>
                        <span className="text-[9px] font-black text-indigo-600">{completedSubtasks}/{totalSubtasks}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center font-black text-[8px] text-slate-500 uppercase border border-slate-200">
                            {task.assignee?.username?.substring(0, 2) || 'UN'}
                          </div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{task.assignee?.username || 'None'}</span>
                       </div>
                       <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 rounded-md border border-slate-100">
                         <span className="text-[10px] font-black text-slate-700">{task.storyPoints}</span>
                         <span className="text-[7px] font-black text-slate-400 uppercase">SP</span>
                       </div>
                    </div>

                    {canDeleteTasks && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }} 
                        className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-slate-200 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
              
              {/* Visible Empty State Placeholder */}
              {getTaskCount(status) === 0 && (
                <div className="border border-dashed border-slate-200 rounded-[1.5rem] h-24 flex flex-col items-center justify-center gap-1.5 opacity-30">
                  <Layout size={14} className="text-slate-400" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Awaiting Items</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;