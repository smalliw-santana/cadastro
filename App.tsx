
import React, { useState } from 'react';
import { ViewState, SystemUser } from './types';
import { Login } from './components/Login';
import { RegisterUser } from './components/RegisterUser';
import { Dashboard } from './components/Dashboard';
import { UsersList } from './components/UsersList';
import { Reports } from './components/Reports';
import { DatabaseSettings } from './components/DatabaseSettings';
import { ResourceRegister } from './components/ResourceRegister';
import { SystemUsersManagement } from './components/SystemUsersManagement';
import { LayoutDashboard, UserPlus, LogOut, Menu, Database, ClipboardList, Settings, Layers, Building, Briefcase, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  // Now storing the full user object instead of just boolean
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!currentUser) {
    return <Login onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
        ${currentView === view 
          ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }
      `}
    >
      <Icon className="w-5 h-5" />
      <span className={`font-medium ${!isSidebarOpen && 'hidden md:hidden'}`}>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden print:block print:h-auto print:overflow-visible">
      {/* Sidebar */}
      <aside 
        className={`
          bg-slate-900 text-white transition-all duration-300 flex flex-col z-20 overflow-y-auto custom-scrollbar print:hidden
          ${isSidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        <div className="p-6 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
            <span className="font-bold text-white text-lg">K</span>
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-xl tracking-tight animate-[fadeIn_0.2s]">System</span>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="pb-2">
             <p className={`px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'hidden'}`}>Principal</p>
             <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Dashboard Geral" />
             <NavItem view="REGISTER" icon={UserPlus} label="Novo Cadastro" />
             <NavItem view="USERS_LIST" icon={Database} label="Base de Dados" />
             <NavItem view="REPORTS" icon={ClipboardList} label="Relatórios" />
          </div>

          <div className="pt-2 border-t border-slate-800">
             <p className={`px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4 ${!isSidebarOpen && 'hidden'}`}>Cadastros Auxiliares</p>
             <NavItem view="REGISTER_FILIAL" icon={Building} label="Cadastrar Filial" />
             <NavItem view="REGISTER_DEPARTAMENTO" icon={Layers} label="Cadastrar Depto." />
             <NavItem view="REGISTER_SETOR" icon={Briefcase} label="Cadastrar Setor" />
          </div>

          <div className="pt-2 border-t border-slate-800 mt-2">
             <p className={`px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4 ${!isSidebarOpen && 'hidden'}`}>Sistema</p>
             <NavItem view="MANAGE_ACCESS" icon={ShieldCheck} label="Usuários de Acesso" />
             <NavItem view="DB_SETTINGS" icon={Settings} label="Configuração BD" />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <button 
             onClick={() => setCurrentUser(null)}
             className={`
               w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all
               ${!isSidebarOpen && 'justify-center'}
             `}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative print:block print:h-auto print:overflow-visible print:w-full print:static">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0 print:hidden">
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
           >
             <Menu className="w-6 h-6" />
           </button>

           <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-bold text-slate-800">{currentUser.nome}</p>
               <p className="text-xs text-slate-500 capitalize">{currentUser.role === 'ADMIN' ? 'Administrador' : 'Operador'} do Sistema</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-indigo-50 shadow-sm overflow-hidden flex items-center justify-center">
                <span className="font-bold text-indigo-600 text-lg">{currentUser.nome.charAt(0)}</span>
             </div>
           </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50 print:overflow-visible print:bg-white print:h-auto print:block">
          {currentView === 'DASHBOARD' && <Dashboard />}
          {currentView === 'REGISTER' && <RegisterUser />}
          {currentView === 'USERS_LIST' && <UsersList onNavigateToRegister={() => setCurrentView('REGISTER')} />}
          {currentView === 'REPORTS' && <Reports />}
          {currentView === 'DB_SETTINGS' && <DatabaseSettings />}
          {currentView === 'REGISTER_FILIAL' && <ResourceRegister type="FILIAL" />}
          {currentView === 'REGISTER_DEPARTAMENTO' && <ResourceRegister type="DEPARTAMENTO" />}
          {currentView === 'REGISTER_SETOR' && <ResourceRegister type="SETOR" />}
          {currentView === 'MANAGE_ACCESS' && <SystemUsersManagement />}
        </div>
      </main>
    </div>
  );
};

export default App;