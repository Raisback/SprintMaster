import React, { useState, useRef } from 'react';
import { User, Mail, Save, Camera, AlertCircle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';

const Profile = ({ user, token, setUser }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  
  // Image handling states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profileImage ? `http://localhost:5000${user.profileImage}` : null);
  const [status, setStatus] = useState({ type: '', msg: '' });
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setStatus({ type: 'error', msg: 'Image must be under 2MB' });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStatus({ type: '', msg: '' });
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile('DELETE'); // Signal to backend to remove photo
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Syncing profile...' });

    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      
      if (selectedFile === 'DELETE') {
        data.append('removeImage', 'true');
      } else if (selectedFile) {
        data.append('profileImage', selectedFile);
      }

      const res = await fetch(`http://localhost:5000/api/users/${user.id || user._id}`, {
        method: 'PUT',
        headers: { 
          'x-auth-token': token 
          // Browser sets Content-Type automatically for FormData
        },
        body: data
      });

      const updatedUserFromDb = await res.json();
      
      if (res.ok) {
        const updatedUser = { ...user, ...updatedUserFromDb };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setStatus({ type: 'success', msg: 'Identity updated successfully' });
        setSelectedFile(null); // Reset file state after success
        setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
      } else {
        setStatus({ type: 'error', msg: updatedUserFromDb.msg || 'Update failed' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Connection error' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1 mb-12">
        <h1 className="text-5xl font-black text-slate-800 tracking-tighter uppercase">Profile Settings</h1>
        <p className="text-slate-500 font-medium">Manage your identity and visual presence</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200 border border-slate-100 text-center sticky top-8">
            <div className="relative w-44 h-44 mx-auto mb-8 group cursor-pointer">
              
              {/* Main Container */}
              <div className="w-full h-full bg-slate-50 rounded-[2.8rem] overflow-hidden border-4 border-white shadow-xl relative transition-all duration-500 group-hover:shadow-indigo-100">
                
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="w-full h-full flex flex-col items-center justify-center text-slate-300 hover:text-indigo-400 hover:bg-indigo-50/50 transition-all duration-300"
                  >
                    <Camera size={48} strokeWidth={1.5} />
                    <p className="text-[8px] font-black uppercase tracking-widest mt-2">Upload Photo</p>
                  </div>
                )}
                
                {/* PREMIUM GHOST OVERLAY (Only shows if image exists) */}
                {previewUrl && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors border border-white/20"
                    >
                      <Camera size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                    </button>
                    
                    <button 
                      type="button"
                      onClick={handleRemovePhoto}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/40 text-red-200 rounded-full transition-colors border border-red-500/20"
                    >
                      <Trash2 size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Remove</span>
                    </button>
                  </div>
                )}
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>

            <h3 className="text-xl font-black text-slate-800 truncate">{formData.username}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">{user?.role}</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-200 border border-slate-100">
            {status.msg && (
              <div className={`mb-8 p-5 rounded-2xl flex items-center gap-3 font-bold text-sm animate-in zoom-in duration-300 ${
                status.type === 'error' ? 'bg-red-50 text-red-600' : 
                status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
              }`}>
                {status.type === 'loading' ? <Loader2 size={20} className="animate-spin" /> : 
                 status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                {status.msg}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 group-focus-within:text-indigo-600 transition-colors">Username Identity</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-14 pr-6 font-bold text-slate-700 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3 group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 group-focus-within:text-indigo-600 transition-colors">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                      type="email"
                      required
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