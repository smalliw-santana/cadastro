
import React, { useState, useEffect, useRef } from 'react';
import { dbService } from './services/dbService.ts';
import { ViewState, SystemUser } from './types.ts';
import { Login } from './components/Login.tsx';
import { RegisterUser } from './components/RegisterUser.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { UsersList } from './components/UsersList.tsx';
import { Reports } from './components/Reports.tsx';
import { DatabaseSettings } from './components/DatabaseSettings.tsx';
import { ResourceRegister } from './components/ResourceRegister.tsx';
import { SystemUsersManagement } from './components/SystemUsersManagement.tsx';
import { SystemLogs } from './components/SystemLogs.tsx';
import { UserProfile } from './components/UserProfile.tsx';
import { Logo } from './components/Logo.tsx';
import { LayoutDashboard, UserPlus, LogOut, Menu, Database, ClipboardList, Settings, Layers, Building, Briefcase, ShieldCheck, User, ScrollText, Maximize, Minimize, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  // Now storing the full user object instead of just boolean
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage or system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply theme class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  if (!currentUser) {
    return <Login onLoginSuccess={(user) => {
      setCurrentUser(user);
      setCurrentView('DASHBOARD');
    }} />;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 relative overflow-hidden group
        ${currentView === view 
          ? 'bg-primary-600/10 text-primary-200 shadow-inner' 
          : 'text-red-200 hover:bg-red-800 hover:text-white dark:hover:bg-red-900/40'
        }
      `}
    >
      {/* Active Indicator Line */}
      {currentView === view && (
         <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-full"></div>
      )}
      
      <Icon className={`w-5 h-5 transition-colors ${currentView === view ? 'text-primary-400' : 'group-hover:text-white'}`} />
      <span className={`font-medium tracking-wide ${!isSidebarOpen ? 'hidden md:hidden' : ''}`}>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-white dark:bg-dark-900 overflow-hidden print:block print:h-auto print:overflow-visible">
      {/* Sidebar - Changed to Red for a more premium enterprise look */}
      <aside 
        className={`
          bg-professional-red dark:bg-dark-800 text-white transition-all duration-300 flex flex-col z-20 overflow-y-auto custom-scrollbar print:hidden shadow-2xl border-r dark:border-dark-800
          ${isFullscreen ? 'w-0 hidden' : isSidebarOpen ? 'w-72' : 'w-20'}
        `}
      >
        <div className="p-6 flex items-center gap-3 shrink-0 bg-black/10 dark:bg-black/20">
          <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-xl shadow-lg shadow-primary-900/20">
            <Logo className="w-6 h-6" variant="white" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col animate-[fadeIn_0.3s]">
                <span className="font-bold text-lg tracking-tight leading-none text-white">Gestão de Acessos</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="pb-2">
             <p className={`px-4 text-[10px] font-bold text-red-300 dark:text-red-400 uppercase tracking-widest mb-3 mt-1 ${!isSidebarOpen ? 'hidden' : ''}`}>Principal</p>
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
            <div className="pt-4 mt-2 border-t border-red-800 dark:border-red-900/30">
                <p className={`px-4 text-[10px] font-bold text-red-300 dark:text-red-400 uppercase tracking-widest mb-3 ${!isSidebarOpen ? 'hidden' : ''}`}>Cadastros Auxiliares</p>
                <NavItem view="REGISTER_FILIAL" icon={Building} label="Cadastrar Filial" />
                <NavItem view="REGISTER_FUNCAO" icon={Layers} label="Cadastrar Função" />
                <NavItem view="REGISTER_SETOR" icon={Briefcase} label="Cadastrar Setor" />
            </div>
          )}

          {/* System Settings - Visible in menu ONLY for ADMIN, but we secure components too */}
          {currentUser.role === 'ADMIN' && (
            <div className="pt-4 mt-2 border-t border-red-800 dark:border-red-900/30">
               <p className={`px-4 text-[10px] font-bold text-red-300 dark:text-red-400 uppercase tracking-widest mb-3 ${!isSidebarOpen ? 'hidden' : ''}`}>Sistema</p>
               <NavItem view="MANAGE_ACCESS" icon={ShieldCheck} label="Usuários de Acesso" />
               <NavItem view="SYSTEM_LOGS" icon={ScrollText} label="Logs do Sistema" />
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-red-800 dark:border-red-900/50 shrink-0 bg-red-950/20 dark:bg-black/20">
          {/* User Profile Section in Sidebar */}
          <div 
            onClick={() => setCurrentView('PROFILE')}
            className={`flex items-center gap-3 mb-5 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all group ${!isSidebarOpen ? 'justify-center' : 'px-2'} ${currentView === 'PROFILE' ? 'bg-white/10 ring-1 ring-white/20 shadow-lg' : ''}`}
          >
              <div className="relative shrink-0">
                  {/* Harmonic Icon Replacement */}
                  {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt={currentUser.nome} className={`w-10 h-10 rounded-xl object-cover border shadow-md group-hover:opacity-90 transition-all ${currentView === 'PROFILE' ? 'border-white scale-105' : 'border-red-600 dark:border-red-800'}`} referrerPolicy="no-referrer" />
                  ) : (
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-red-700 to-red-800 dark:from-red-800 dark:to-red-900 border flex items-center justify-center shadow-md group transition-all ${currentView === 'PROFILE' ? 'border-white scale-105' : 'border-red-600 dark:border-red-800'}`}>
                          <User className="w-5 h-5 text-red-100 group-hover:text-white transition-colors" />
                      </div>
                  )}
                  
                  {/* Status Dot on Avatar (Visible when collapsed too) */}
                  <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-red-900 dark:border-dark-800 rounded-full ${currentUser.role === 'ADMIN' ? 'bg-green-500' : 'bg-slate-500'}`}></div>
              </div>
              
              {isSidebarOpen && (
                  <div className="flex flex-col overflow-hidden animate-[fadeIn_0.3s]">
                      <span className={`text-sm font-bold truncate transition-colors ${currentView === 'PROFILE' ? 'text-white' : 'text-white'}`}>{currentUser.nome}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                          {/* Visual Icon Indicator next to Role Name */}
                          {currentUser.role === 'ADMIN' ? (
                              <ShieldCheck className="w-3 h-3 text-green-500" />
                          ) : (
                              <User className="w-3 h-3 text-red-200" />
                          )}
                          <span className="text-[10px] text-red-200 font-medium uppercase tracking-wider">
                              {currentUser.role}
                          </span>
                      </div>
                  </div>
              )}
          </div>

          <button 
             onClick={async () => {
                 await dbService.addLog({
                     userId: currentUser.id,
                     userName: currentUser.nome,
                     action: 'LOGOUT',
                     details: 'Logout manual.'
                 });
                 setCurrentUser(null);
             }}
             className={`
               w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 dark:hover:bg-red-900/30 hover:text-red-300 transition-all duration-300 group
               ${!isSidebarOpen ? 'justify-center' : ''}
             `}
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            {isSidebarOpen && <span className="font-medium">Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative print:block print:h-auto print:overflow-visible print:w-full print:static bg-white dark:bg-dark-900">
        {/* Top Header with Glassmorphism */}
        <header className="h-20 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-dark-800/60 flex items-center justify-between px-8 z-10 shrink-0 print:hidden sticky top-0 transition-all">
           <div className="flex items-center gap-4">
             {!isFullscreen && (
                 <button 
                   onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                   className="p-2.5 hover:bg-slate-50 dark:hover:bg-dark-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-dark-700 transition-all active:scale-95"
                 >
                   <Menu className="w-6 h-6" />
                 </button>
             )}
           </div>
           
           <div className="flex items-center gap-2 md:gap-4">
               {/* Theme Toggle Button */}
               <button 
                 onClick={() => setIsDarkMode(!isDarkMode)}
                 className="p-2.5 hover:bg-slate-50 dark:hover:bg-dark-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-dark-700 transition-all active:scale-95"
                 title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
               >
                 {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
               </button>
               
               {/* Fullscreen Toggle Button */}
               <button 
                 onClick={() => setIsFullscreen(!isFullscreen)}
                 className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-dark-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-dark-700 transition-all active:scale-95"
                 title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
               >
                 {isFullscreen ? (
                   <>
                     <Minimize className="w-5 h-5" />
                     <span className="text-sm font-medium hidden sm:block">Sair da Tela Cheia</span>
                   </>
                 ) : (
                   <>
                     <Maximize className="w-5 h-5" />
                     <span className="text-sm font-medium hidden sm:block">Tela Cheia</span>
                   </>
                 )}
               </button>
           </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto bg-white dark:bg-dark-900 print:overflow-visible print:bg-white print:h-auto print:block scroll-smooth">
          <div key={currentView} className="w-full px-4 md:px-8 mx-auto min-h-full flex flex-col py-6 animate-slideUpFade">
            {currentView === 'DASHBOARD' && <Dashboard />}
            {currentView === 'REGISTER' && <RegisterUser currentUser={currentUser} />}
            {currentView === 'USERS_LIST' && <UsersList onNavigateToRegister={() => setCurrentView('REGISTER')} currentUser={currentUser} />}
            {currentView === 'REPORTS' && <Reports />}
            {currentView === 'DB_SETTINGS' && <DatabaseSettings userRole={currentUser.role} />}
            {currentView === 'REGISTER_FILIAL' && <ResourceRegister type="FILIAL" currentUser={currentUser} />}
            {currentView === 'REGISTER_FUNCAO' && <ResourceRegister type="FUNCAO" currentUser={currentUser} />}
            {currentView === 'REGISTER_SETOR' && <ResourceRegister type="SETOR" currentUser={currentUser} />}
            {currentView === 'MANAGE_ACCESS' && <SystemUsersManagement currentUser={currentUser} />}
            {currentView === 'SYSTEM_LOGS' && <SystemLogs />}
            {currentView === 'PROFILE' && <UserProfile currentUser={currentUser} onUpdate={(updated) => setCurrentUser(updated)} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
