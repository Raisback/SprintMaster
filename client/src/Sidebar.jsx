import React, { useState } from 'react';
import { 
  Layout, 
  Trello, 
  LogOut, 
  ClipboardList, 
  User as UserIcon, 
  ShieldCheck,
  ChevronsLeft 
} from 'lucide-react';

const Sidebar = ({ user, view, setView, handleLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`bg-[#0f172a] flex flex-col sticky top-0 h-screen transition-all duration-300 ease-in-out z-20 shadow-2xl ${isCollapsed ? 'w-24' : 'w-80'}`}>
      <div onClick={() => isCollapsed && setIsCollapsed(false)} className={`flex items-center p-6 mb-10 cursor-pointer group ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-4">
          <div className={`flex-shrink-0 w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 ring-4 ring-indigo-500/10 transition-transform ${isCollapsed ? 'group-hover:scale-110' : ''}`}>
            <Trello size={32} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h2 className="font-black text-2xl tracking-tighter text-white leading-none mb-1">SprintMaster</h2>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-indigo-400" />
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{user?.role}</p>
              </div>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button onClick={(e) => { e.stopPropagation(); setIsCollapsed(true); }} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <ChevronsLeft size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-2.5 px-5">
        {[
          { id: 'dashboard', icon: Layout, label: 'Dashboard' },
          { id: 'board', icon: Trello, label: 'Active Board' },
          { id: 'backlog', icon: ClipboardList, label: 'Backlog' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center rounded-2xl font-bold text-[11px] uppercase tracking-[0.12em] transition-all group ${isCollapsed ? 'justify-center py-5' : 'gap-4 px-6 py-4'} ${view === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <item.icon size={20} />
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="mt-auto p-5 space-y-4 border-t border-white/5">
        {!isCollapsed && (
          <button 
            onClick={() => setView('profile')}
            className={`w-full text-left bg-white/5 hover:bg-white/10 rounded-2xl p-4 border border-white/5 transition-all group ${view === 'profile' ? 'ring-2 ring-indigo-500 bg-indigo-600/10' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-white/10 transition-colors ${view === 'profile' ? 'bg-indigo-600' : ''}`}>
                <UserIcon size={16} className="text-white" />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-[11px] text-white truncate uppercase tracking-wider">{user?.username}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Edit Account</p>
              </div>
            </div>
          </button>
        )}
        <button onClick={handleLogout} className="w-full flex items-center justify-center bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-500 rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest">
          <LogOut size={18} />
          {!isCollapsed && <span className="ml-3">Terminate</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;