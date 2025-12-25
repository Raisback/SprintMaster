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

  // Configuration for navigation items
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: Layout },
    { id: 'board', label: 'Active Board', icon: Trello },
    { id: 'backlog', label: 'Product Backlog', icon: ClipboardList },
  ];

  return (
    <aside className={`bg-[#0f172a] flex flex-col sticky top-0 h-screen transition-all duration-300 ease-in-out z-20 shadow-2xl ${isCollapsed ? 'w-24' : 'w-80'}`}>
      {/* Brand Header */}
      <div 
        onClick={() => isCollapsed && setIsCollapsed(false)} 
        className={`flex items-center p-6 mb-10 cursor-pointer group ${isCollapsed ? 'justify-center' : 'justify-between'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`flex-shrink-0 w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 ring-4 ring-indigo-500/10 transition-transform ${isCollapsed ? 'group-hover:scale-110' : ''}`}>
            <Trello size={32} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h2 className="font-black text-2xl tracking-tighter text-white leading-none mb-1">SprintMaster</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Engine Online</span>
              </div>
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsCollapsed(true); }}
            className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors"
          >
            <ChevronsLeft size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group relative
              ${view === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
          >
            <item.icon size={22} className={view === item.id ? 'text-white' : 'group-hover:text-indigo-400'} />
            {!isCollapsed && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
            {view === item.id && !isCollapsed && (
              <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </nav>

      {/* User & Actions Section */}
      <div className="mt-auto p-5 space-y-4 border-t border-white/5">
        <button 
          onClick={() => setView('profile')}
          className={`w-full text-left bg-white/5 hover:bg-white/10 rounded-2xl p-4 border border-white/5 transition-all group 
            ${view === 'profile' ? 'ring-2 ring-indigo-500 bg-indigo-600/10' : ''}
            ${isCollapsed ? 'flex justify-center' : ''}`}
        >
          <div className="flex items-center gap-3">
            {/* Avatar Container */}
            <div className={`w-10 h-10 overflow-hidden rounded-xl border border-white/10 flex items-center justify-center transition-colors flex-shrink-0
              ${view === 'profile' ? 'bg-indigo-600' : 'bg-slate-800'}`}
            >
              {user?.profileImage ? (
                <img 
                  src={`http://localhost:5000${user.profileImage}`} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = ''; e.target.classList.add('hidden'); }} // Fallback if image fails to load
                />
              ) : (
                <UserIcon size={16} className="text-white" />
              )}
            </div>
            
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="font-bold text-[11px] text-white truncate uppercase tracking-wider">
                  {user?.username || 'Anonymous'}
                </p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                  {user?.role || 'User'}
                </p>
              </div>
            )}
          </div>
        </button>

        <button 
          onClick={handleLogout} 
          className={`w-full flex items-center bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-500 rounded-2xl p-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all
            ${isCollapsed ? 'justify-center' : 'justify-center gap-3'}`}
        >
          <LogOut size={16} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;