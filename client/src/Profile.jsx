import React, { useState } from 'react';
import { User, Mail, Shield, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

const Profile = ({ user, token, setUser }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Syncing profile...' });

    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id || user._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        const updatedUser = { ...user, username: data.username, email: data.email };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setStatus({ type: 'success', msg: 'Identity updated successfully' });
        setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
      } else {
        setStatus({ type: 'error', msg: data.msg || 'Update failed' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Connection error' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Card: Identity */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-center border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/20 to-transparent opacity-50"></div>
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl mb-4 ring-4 ring-white/5">
                <User size={40} className="text-white" />
              </div>
              <h3 className="text-white font-black text-xl tracking-tight">{user?.username}</h3>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{user?.role}</p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Account Security</h4>
            <div className="flex items-center gap-3 text-slate-600">
              <Shield size={16} className="text-emerald-500" />
              <span className="text-xs font-bold">Verified Professional</span>
            </div>
          </div>
        </div>

        {/* Right Card: Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl relative">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Profile Settings</h2>
              <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Update your workspace credentials</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-8">
              {status.msg && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-bounce ${
                  status.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {status.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16} />}
                  {status.msg}
                </div>
              )}

              <div className="grid grid-cols-1 gap-8">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block group-focus-within:text-indigo-600 transition-colors">Username</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-14 pr-6 font-bold text-slate-700 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block group-focus-within:text-indigo-600 transition-colors">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-14 pr-6 font-bold text-slate-700 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={status.type === 'loading'}
                  className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.25em] transition-all active:scale-[0.97] shadow-2xl shadow-indigo-200 disabled:opacity-50"
                >
                  <Save size={18} />
                  {status.type === 'loading' ? 'Processing...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;