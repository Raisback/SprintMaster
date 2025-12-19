import React from 'react';
import { Layout, Trello, LogOut, ClipboardList, User as UserIcon, ShieldCheck } from 'lucide-react';

const Sidebar = ({ user, view, setView, handleLogout }) => {
  return (
    <aside className="w-80 bg-white border-r border-slate-100 flex flex-col p-8 sticky top-0 h-screen">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
          <Trello size={24} className="text-white" />
        </div>
        <div>
          <h2 className="font-black text-xl tracking-tighter">SprintMaster</h2>
          <div className="flex items-center gap-1">
            <ShieldCheck size={10} className="text-indigo-500" />
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-3">
        {[
          { id: 'dashboard', icon: Layout, label: 'Dashboard' },
          { id: 'board', icon: Trello, label: 'Active Board' },
          { id: 'backlog', icon: ClipboardList, label: 'Backlog' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all ${
              view === item.id 
              ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-2' 
              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
              <UserIcon size={14} className="text-slate-600" />
            </div>
            <p className="font-black text-xs text-slate-600 truncate">{user?.username}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
        >
          <LogOut size={16} />
          Terminate Session
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;