
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService.ts';
import { SystemUser } from '../types.ts';
import { User, Lock, ArrowRight } from 'lucide-react';
import { Spinner } from './Spinner.tsx';
import { Logo } from './Logo.tsx';

interface LoginProps {
  onLoginSuccess: (user: SystemUser) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);

  useEffect(() => {
    dbService.getSystemUsers().then(setSystemUsers);
  }, []);

  const matchedUser = systemUsers.find(u => u.login.toUpperCase() === login.toUpperCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate network delay for realism
    setTimeout(async () => {
      // Use the new Authentication method against System Users DB
      const user = await dbService.authenticateSystemUser(login, password);

      if (user) {
        await dbService.addLog({
            userName: user.nome,
            action: 'LOGIN',
            resource: 'Sistema',
            details: 'Login realizado com sucesso.'
        });
        
        setLoginSuccess(true);
        setTimeout(() => {
          onLoginSuccess(user);
        }, 3500);
      } else {
        // Detailed feedback logic
        const systemUsers = await dbService.getSystemUsers();
        const userExists = systemUsers.some(u => u.login.toUpperCase() === login);

        if (userExists) {
            setError('Senha incorreta. Por favor, tente novamente.');
        } else {
            setError('Usuário não encontrado no sistema.');
        }
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 font-sans relative overflow-hidden">
      
      <style>{`
        @keyframes welcomePop {
            0% { transform: scale(0.9); opacity: 0; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-welcome-pop {
            animation: welcomePop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes slideUpFade {
            0% { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up-fade {
            animation: slideUpFade 0.5s ease-out 0.2s forwards;
            opacity: 0;
        }
      `}</style>

      {/* Success Animation Overlay */}
      {loginSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-900/90 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
            <div className="flex flex-col items-center text-center p-8 animate-welcome-pop">
                <div className="w-32 h-32 mb-8 rounded-full border-4 border-white/30 p-1 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-xl flex items-center justify-center">
                    {matchedUser?.avatarUrl ? (
                        <img 
                            src={matchedUser.avatarUrl} 
                            alt="Avatar" 
                            className="w-full h-full object-cover rounded-full"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <User className="w-16 h-16 text-white" />
                    )}
                </div>
                <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
                    Acesso Autorizado
                </h2>
                <p className="text-primary-100 text-xl animate-slide-up-fade">
                    Bem-vindo de volta, <span className="font-bold">{matchedUser?.nome.split(' ')[0]}</span>.
                </p>
                <div className="mt-8 flex gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
      )}

      {/* Background ambient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-300/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-slate-400/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Container Card */}
      <div className="relative bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden w-full max-w-[1000px] h-auto min-h-[600px] flex flex-col md:flex-row border border-white/50 backdrop-blur-xl">
        
        {/* Left Panel (Colored - Enterprise Theme) */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-red-900 to-red-800 text-white flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
            
            {/* Mesh Gradient Effect */}
            <div className="absolute inset-0 opacity-30 mix-blend-overlay">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-primary-500 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-red-500 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
                 <div className="mb-10 p-8 bg-white/5 rounded-[30px] backdrop-blur-md border border-white/10 shadow-2xl shadow-black/20 group hover:scale-105 transition-transform duration-500 ease-out">
                    <Logo className="w-20 h-20 drop-shadow-lg" variant="white" />
                 </div>
                 
                 <h2 className="text-3xl font-bold tracking-tight mb-2">Bem-vindo</h2>
                 <p className="text-slate-300 text-sm max-w-[240px] leading-relaxed">
                    Acesse o painel corporativo.
                 </p>
            </div>

            <div className="absolute bottom-8 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Versão 2.5.0
            </div>
        </div>

        {/* Right Panel (White) - Form */}
        <div className="w-full md:w-7/12 bg-white flex flex-col items-center justify-center p-8 md:p-16 relative">
            
            <div className="w-full max-w-sm">
                <div className="mb-10 text-center md:text-left flex flex-col items-center md:items-start">
                    {matchedUser && (
                        <div className="w-24 h-24 mb-6 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-50 flex items-center justify-center transition-all duration-500 ease-out animate-[scaleIn_0.3s_ease-out]">
                            {matchedUser.avatarUrl ? (
                                <img 
                                    src={matchedUser.avatarUrl} 
                                    alt="Avatar do Usuário" 
                                    className="w-full h-full object-cover animate-[fadeIn_0.3s_ease-out]"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <User className="w-10 h-10 text-slate-300" />
                            )}
                        </div>
                    )}
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                        {matchedUser ? `Olá, ${matchedUser.nome.split(' ')[0]}` : 'Login Seguro'}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {matchedUser ? 'Digite sua senha para continuar.' : 'Entre com suas credenciais de administrador ou Convidado.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    {/* Input User */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">identificação</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors">
                                <User className="w-5 h-5" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="ID Corporativo"
                                value={login}
                                onChange={(e) => setLogin(e.target.value.toUpperCase())}
                                required
                                disabled={loading}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-12 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all shadow-sm disabled:opacity-50 hover:bg-white focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* Input Password */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Senha</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-12 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all shadow-sm disabled:opacity-50 hover:bg-white focus:bg-white"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-xs text-red-500 bg-red-50/50 p-4 rounded-xl text-center border border-red-100 animate-[shake_0.4s_ease-in-out] font-medium">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="mt-4 bg-primary-600 text-white rounded-xl px-12 py-4 font-bold text-xs uppercase tracking-widest hover:bg-primary-700 hover:shadow-glow hover:-translate-y-0.5 transform active:translate-y-0 active:shadow-none transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed w-full flex justify-center items-center gap-2 group"
                    >
                        {loading ? (
                            <>
                                <Spinner size="sm" variant="white" />
                                <span>Verificando...</span>
                            </>
                        ) : (
                            <>
                                <span>Acessar Painel</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                </form>
            </div>

            <div className="absolute bottom-6 text-slate-300 text-xs font-medium">
               Gestão de Acessos &copy; {new Date().getFullYear()}
            </div>

        </div>

      </div>
    </div>
  );
};
