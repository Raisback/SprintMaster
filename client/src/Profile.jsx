import React, { useState, useRef } from 'react';
import { User, Mail, Save, Camera, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const Profile = ({ user, token, setUser }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  
  // States for Image Handling
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profileImage ? `http://localhost:5000${user.profileImage}` : null);
  const [status, setStatus] = useState({ type: '', msg: '' });
  
  const fileInputRef = useRef(null);

  // Handle local image selection and preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setStatus({ type: 'error', msg: 'Image size must be less than 2MB' });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Creates a temporary local URL for preview
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Syncing profile...' });

    try {
      // Use FormData to allow file transmission
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      
      if (selectedFile) {
        data.append('profileImage', selectedFile);
      }

      const res = await fetch(`http://localhost:5000/api/users/${user.id || user._id}`, {
        method: 'PUT',
        headers: { 
          'x-auth-token': token 
          // Note: Content-Type is NOT set manually; browser sets it for FormData
        },
        body: data
      });

      const updatedUserFromDb = await res.json();
      
      if (res.ok) {
        // Sync local storage and global app state
        const updatedUser = { ...user, ...updatedUserFromDb };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setStatus({ type: 'success', msg: 'Identity updated successfully' });
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
        {/* Avatar Selection Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200 border border-slate-100 text-center sticky top-8">
            <div className="relative w-40 h-40 mx-auto mb-8 group">
              {/* Image Preview Container */}
              <div className="w-full h-full bg-slate-100 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl relative">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                    <User size={64} />
                  </div>
                )}
                
                {/* Dark overlay on hover */}
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <p className="text-white text-[10px] font-black uppercase tracking-widest">Change Photo</p>
                </div>
              </div>

              {/* Upload Action Button */}
              <button 
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute -bottom-2 -right-2 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-90 z-10"
              >
                <Camera size={20} />
              </button>

              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>

            <h3 className="text-xl font-black text-slate-800 truncate">{formData.username}</h3>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-2 bg-indigo-50 py-1 px-3 rounded-full inline-block">
              {user?.role}
            </p>
          </div>
        </div>

        {/* Info Update Card */}
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
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 group-focus-within:text-indigo-600 transition-colors">Username</label>
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