import React, { useState } from 'react';
import { ViewState } from './types';
import { Login } from './components/Login';
import { RegisterUser } from './components/RegisterUser';
import { Dashboard } from './components/Dashboard';
import { LayoutDashboard, UserPlus, LogOut, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
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
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`
          bg-slate-900 text-white transition-all duration-300 flex flex-col z-20
          ${isSidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
            <span className="font-bold text-white text-lg">K</span>
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-xl tracking-tight animate-[fadeIn_0.2s]">System</span>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Dashboard Geral" />
          <NavItem view="REGISTER" icon={UserPlus} label="Novo Cadastro" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
             onClick={() => setIsAuthenticated(false)}
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
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
           >
             <Menu className="w-6 h-6" />
           </button>

           <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-bold text-slate-800">ADMINISTRADOR SISTEMA</p>
               <p className="text-xs text-slate-500">Matriz - TI</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
               <img src="https://picsum.photos/200" alt="Profile" className="w-full h-full object-cover" />
             </div>
           </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50">
          {currentView === 'DASHBOARD' && <Dashboard />}
          {currentView === 'REGISTER' && <RegisterUser />}
        </div>
      </main>
    </div>
  );
};

export default App;