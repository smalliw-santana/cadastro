
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, SystemUser } from './types.ts';
import { Login } from './components/Login.tsx';
import { RegisterUser } from './components/RegisterUser.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { UsersList } from './components/UsersList.tsx';
import { Reports } from './components/Reports.tsx';
import { DatabaseSettings } from './components/DatabaseSettings.tsx';
import { ResourceRegister } from './components/ResourceRegister.tsx';
import { SystemUsersManagement } from './components/SystemUsersManagement.tsx';
import { Logo } from './components/Logo.tsx';
import { LayoutDashboard, UserPlus, LogOut, Menu, Database, ClipboardList, Settings, Layers, Building, Briefcase, ShieldCheck, User } from 'lucide-react';

// 15 Minutes in milliseconds
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; 

const App: React.FC = () => {
  // Now storing the full user object instead of just boolean
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- AUTO LOGOUT LOGIC ---
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const handleLogout = () => {
      // Optional: You could save a flag in localStorage to show a "Session Expired" message on the login screen
      setCurrentUser(null);
    };

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
    };

    // Events to track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    // Attach listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Start initial timer
    resetTimer();

    // Cleanup listeners and timer on unmount or logout
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [currentUser]);
  // -------------------------

  if (!currentUser) {
    return <Login onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 relative overflow-hidden group
        ${currentView === view 
          ? 'bg-primary-600/10 text-primary-200 shadow-inner' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }
      `}
    >
      {/* Active Indicator Line */}
      {currentView === view && (
         <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-full"></div>
      )}
      
      <Icon className={`w-5 h-5 transition-colors ${currentView === view ? 'text-primary-400' : 'group-hover:text-white'}`} />
      <span className={`font-medium tracking-wide ${!isSidebarOpen && 'hidden md:hidden'}`}>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden print:block print:h-auto print:overflow-visible">
      {/* Sidebar - Changed to Dark Slate for a more premium enterprise look */}
      <aside 
        className={`
          bg-slate-900 text-white transition-all duration-300 flex flex-col z-20 overflow-y-auto custom-scrollbar print:hidden shadow-2xl
          ${isSidebarOpen ? 'w-72' : 'w-20'}
        `}
      >
        <div className="p-6 flex items-center gap-3 shrink-0 bg-slate-950/30">
          <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-xl shadow-lg shadow-primary-900/20">
            <Logo className="w-6 h-6" variant="white" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col animate-[fadeIn_0.3s]">
                <span className="font-bold text-lg tracking-tight leading-none">K-System</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="pb-2">
             <p className={`px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-1 ${!isSidebarOpen && 'hidden'}`}>Principal</p>
             <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Dashboard Geral" />
             
             {/* REGISTER is visible in menu ONLY for ADMIN, but we secure the component too */}
             {currentUser.role === 'ADMIN' && (
                <NavItem view="REGISTER" icon={UserPlus} label="Novo Cadastro" />
             )}
             
             <NavItem view="USERS_LIST" icon={Database} label="Base de Dados" />
             <NavItem view="REPORTS" icon={ClipboardList} label="Relatórios" />
          </div>

          {/* Auxiliary Registers - Visible in menu ONLY for ADMIN, but we secure components too */}
          {currentUser.role === 'ADMIN' && (
            <div className="pt-4 mt-2 border-t border-slate-800">
                <p className={`px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ${!isSidebarOpen && 'hidden'}`}>Cadastros Auxiliares</p>
                <NavItem view="REGISTER_FILIAL" icon={Building} label="Cadastrar Filial" />
                <NavItem view="REGISTER_DEPARTAMENTO" icon={Layers} label="Cadastrar Depto." />
                <NavItem view="REGISTER_SETOR" icon={Briefcase} label="Cadastrar Setor" />
            </div>
          )}

          {/* System Settings - Visible in menu ONLY for ADMIN, but we secure components too */}
          {currentUser.role === 'ADMIN' && (
            <div className="pt-4 mt-2 border-t border-slate-800">
               <p className={`px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ${!isSidebarOpen && 'hidden'}`}>Sistema</p>
               <NavItem view="MANAGE_ACCESS" icon={ShieldCheck} label="Usuários de Acesso" />
               <NavItem view="DB_SETTINGS" icon={Settings} label="Configuração BD" />
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0 bg-slate-950/20">
          {/* User Profile Section in Sidebar */}
          <div className={`flex items-center gap-3 mb-5 ${!isSidebarOpen ? 'justify-center' : 'px-2'}`}>
              <div className="relative shrink-0">
                  {/* Harmonic Icon Replacement */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center shadow-md group">
                      <User className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
                  </div>
                  
                  {/* Status Dot on Avatar (Visible when collapsed too) */}
                  <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-slate-900 rounded-full ${currentUser.role === 'ADMIN' ? 'bg-green-500' : 'bg-slate-500'}`}></div>
              </div>
              
              {isSidebarOpen && (
                  <div className="flex flex-col overflow-hidden animate-[fadeIn_0.3s]">
                      <span className="text-sm font-bold text-white truncate">{currentUser.nome}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                          {/* Visual Icon Indicator next to Role Name */}
                          {currentUser.role === 'ADMIN' ? (
                              <ShieldCheck className="w-3 h-3 text-green-500" />
                          ) : (
                              <User className="w-3 h-3 text-slate-400" />
                          )}
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                              {currentUser.role}
                          </span>
                      </div>
                  </div>
              )}
          </div>

          <button 
             onClick={() => setCurrentUser(null)}
             className={`
               w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 group
               ${!isSidebarOpen && 'justify-center'}
             `}
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            {isSidebarOpen && <span className="font-medium">Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative print:block print:h-auto print:overflow-visible print:w-full print:static bg-slate-50/50">
        {/* Top Header with Glassmorphism */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 z-10 shrink-0 print:hidden sticky top-0 transition-all">
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="p-2.5 hover:bg-white rounded-xl text-slate-500 hover:text-primary-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all active:scale-95"
           >
             <Menu className="w-6 h-6" />
           </button>
           
           {/* User Profile Info Removed from Header */}
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50 print:overflow-visible print:bg-white print:h-auto print:block scroll-smooth">
          <div className="max-w-7xl mx-auto w-full min-h-full flex flex-col">
            {currentView === 'DASHBOARD' && <Dashboard />}
            {currentView === 'REGISTER' && <RegisterUser userRole={currentUser.role} />}
            {currentView === 'USERS_LIST' && <UsersList onNavigateToRegister={() => setCurrentView('REGISTER')} userRole={currentUser.role} />}
            {currentView === 'REPORTS' && <Reports />}
            {currentView === 'DB_SETTINGS' && <DatabaseSettings userRole={currentUser.role} />}
            {currentView === 'REGISTER_FILIAL' && <ResourceRegister type="FILIAL" userRole={currentUser.role} />}
            {currentView === 'REGISTER_DEPARTAMENTO' && <ResourceRegister type="DEPARTAMENTO" userRole={currentUser.role} />}
            {currentView === 'REGISTER_SETOR' && <ResourceRegister type="SETOR" userRole={currentUser.role} />}
            {currentView === 'MANAGE_ACCESS' && <SystemUsersManagement userRole={currentUser.role} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
