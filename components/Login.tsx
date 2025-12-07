
import React, { useState } from 'react';
import { dbService } from '../services/dbService';
import { SystemUser } from '../types';
import { User, Lock } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: SystemUser) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate network delay for realism
    setTimeout(() => {
      // Use the new Authentication method against System Users DB
      const user = dbService.authenticateSystemUser(login, password);

      if (user) {
        onLoginSuccess(user);
      } else {
        setError('Acesso negado. Verifique suas credenciais.');
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 font-sans">
      
      {/* Main Container Card */}
      <div className="relative bg-white rounded-[20px] shadow-[0_15px_40px_rgba(0,0,0,0.15)] overflow-hidden w-full max-w-[900px] h-auto min-h-[550px] flex flex-col md:flex-row">
        
        {/* Left Panel (Colored) - "Welcome Back" */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            {/* Decorative circles in background */}
            <div className="absolute top-[-50px] left-[-50px] w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
            <div className="absolute bottom-[-20px] right-[-20px] w-40 h-40 rounded-full bg-white/10 blur-xl"></div>

            <h2 className="text-3xl font-bold mb-4 tracking-tight">Bem-vindo de Volta!</h2>
            <p className="text-indigo-100 text-sm leading-relaxed mb-8 max-w-[240px]">
                Para manter-se conectado conosco, por favor faça login com suas informações pessoais.
            </p>
            
            <div className="mt-4">
                <button className="border-2 border-white text-white rounded-full px-10 py-2.5 font-semibold text-xs tracking-wider uppercase hover:bg-white hover:text-indigo-600 transition-all duration-300">
                   
                </button>
            </div>
        </div>

        {/* Right Panel (White) - Form */}
        <div className="w-full md:w-3/5 bg-white flex flex-col items-center justify-center p-8 md:p-12">
            
            <div className="w-full max-w-xs">
                <h1 className="text-3xl font-bold text-indigo-600 mb-2 tracking-tight text-center">Acesse o Sistema</h1>
                <p className="text-slate-400 text-sm mb-8 text-center">Insira suas credenciais para continuar</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    {/* Input User */}
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <User className="w-5 h-5" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Usuário"
                            value={login}
                            onChange={(e) => setLogin(e.target.value.toUpperCase())}
                            required
                            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 pl-12 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm"
                        />
                    </div>

                    {/* Input Password */}
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Lock className="w-5 h-5" />
                        </div>
                        <input 
                            type="password" 
                            placeholder="Senha" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 pl-12 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex justify-end">
                        <a href="#" className="text-xs text-slate-400 hover:text-indigo-600 transition-colors">
                        </a>
                    </div>

                    {error && (
                        <div className="text-xs text-red-500 bg-red-50 p-3 rounded-lg text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="mt-2 bg-indigo-600 text-white rounded-full px-12 py-3.5 font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed block w-full"
                    >
                        {loading ? 'Autenticando...' : 'ENTRAR'}
                    </button>

                </form>
            </div>

        </div>

      </div>
      
      {/* Footer Copy */}
      <div className="absolute bottom-4 text-slate-400 text-xs">
         © {new Date().getFullYear()} K-System Enterprise
      </div>
    </div>
  );
};
