import React from 'react';
import { Trello, AlertCircle } from 'lucide-react';

const Auth = ({ isRegistering, setIsRegistering, authForm, setAuthForm, handleLogin, handleRegister, error, setError }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-100">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6 transform -rotate-6">
            <Trello size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">SprintMaster</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-2">v2.0 Performance Suite</p>
        </div>

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          {isRegistering && (
            <>
              <input 
                type="text" 
                placeholder="Username" 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                value={authForm.username}
                onChange={e => setAuthForm({...authForm, username: e.target.value})}
              />
              <select 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                value={authForm.role}
                onChange={e => setAuthForm({...authForm, role: e.target.value})}
              >
                <option value="Developer">Developer</option>
                <option value="ScrumMaster">ScrumMaster</option>
                <option value="ProductOwner">ProductOwner</option>
              </select>
            </>
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
            value={authForm.email}
            onChange={e => setAuthForm({...authForm, email: e.target.value})}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
            value={authForm.password}
            onChange={e => setAuthForm({...authForm, password: e.target.value})}
          />
          
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-indigo-100 transition-all transform active:scale-95 uppercase tracking-widest text-sm">
            {isRegistering ? 'Create Account' : 'Enter Workspace'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-500 rounded-2xl flex items-center gap-3 border border-red-100 animate-bounce">
            <AlertCircle size={18} />
            <p className="text-xs font-black uppercase tracking-wider">{error}</p>
          </div>
        )}

        <button 
          onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
          className="w-full mt-8 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
        >
          {isRegistering ? 'Already have an account? Login' : 'New here? Request Access'}
        </button>
      </div>
    </div>
  );
};

export default Auth;