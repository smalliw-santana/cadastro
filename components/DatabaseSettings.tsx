import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import { Select } from './Select';
import { Database, Server, Save, Activity, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export const DatabaseSettings: React.FC = () => {
  const [config, setConfig] = useState({
    type: '',
    host: '',
    port: '',
    database: '',
    user: '',
    password: ''
  });

  const [status, setStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>('DISCONNECTED');
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  // Load saved config on mount
  useEffect(() => {
    const saved = localStorage.getItem('k_system_db_config');
    if (saved) {
      setConfig(JSON.parse(saved));
      // Optionally simulate that we are already connected if config exists
      setStatus('CONNECTED');
      setLastCheck(new Date().toLocaleTimeString());
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
    if (status === 'CONNECTED' || status === 'ERROR') {
        setStatus('DISCONNECTED'); // Reset status on change
    }
  };

  const handleTestConnection = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config.type || !config.host || !config.user) {
        setStatus('ERROR');
        return;
    }

    setStatus('CONNECTING');

    // Simulate network request
    setTimeout(() => {
        // Simple mock validation logic
        if (config.host.includes('.') || config.host === 'localhost') {
            setStatus('CONNECTED');
            setLastCheck(new Date().toLocaleTimeString());
            localStorage.setItem('k_system_db_config', JSON.stringify(config));
        } else {
            setStatus('ERROR');
        }
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6 animate-[fadeIn_0.4s_ease-out]">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Server className="w-6 h-6 text-primary-400"/>
                        Configuração de Conexão
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Gerencie a conexão com o banco de dados externo.</p>
                </div>
                <div className="hidden sm:flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                    <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Status Atual</p>
                        <p className={`text-sm font-bold flex items-center justify-end gap-1.5 ${
                            status === 'CONNECTED' ? 'text-green-400' : 
                            status === 'CONNECTING' ? 'text-yellow-400' : 
                            status === 'ERROR' ? 'text-red-400' : 'text-slate-500'
                        }`}>
                            {status === 'CONNECTED' && <CheckCircle2 className="w-4 h-4" />}
                            {status === 'ERROR' && <XCircle className="w-4 h-4" />}
                            {status === 'CONNECTING' && <RefreshCw className="w-4 h-4 animate-spin" />}
                            {status === 'DISCONNECTED' && <Activity className="w-4 h-4" />}
                            {status === 'CONNECTED' ? 'CONECTADO' : 
                             status === 'CONNECTING' ? 'CONECTANDO...' : 
                             status === 'ERROR' ? 'FALHA NA CONEXÃO' : 'DESCONECTADO'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <form onSubmit={handleTestConnection}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="col-span-1 md:col-span-2">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 border-b border-slate-100 pb-2">
                                Parâmetros do Servidor
                            </h3>
                        </div>

                        <div className="col-span-1">
                            <Select 
                                label="Tipo de Banco de Dados"
                                name="type"
                                options={['MySQL', 'PostgreSQL', 'Oracle', 'SQL Server', 'MariaDB']}
                                value={config.type}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-span-1">
                            <Input 
                                label="Nome da Base (Database)"
                                name="database"
                                placeholder="ex: k_system_prod"
                                value={config.database}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-span-1 md:col-span-1">
                            <Input 
                                label="Host / IP"
                                name="host"
                                placeholder="ex: 192.168.1.50"
                                value={config.host}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-span-1 md:col-span-1">
                            <Input 
                                label="Porta"
                                name="port"
                                placeholder="ex: 3306"
                                value={config.port}
                                onChange={handleChange}
                                type="number"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2 mt-2">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 border-b border-slate-100 pb-2">
                                Credenciais de Acesso
                            </h3>
                        </div>

                        <div className="col-span-1">
                            <Input 
                                label="Usuário"
                                name="user"
                                placeholder="root"
                                value={config.user}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-span-1">
                            <Input 
                                label="Senha"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={config.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        <div className="text-xs text-slate-400">
                            {lastCheck && <span>Última verificação: {lastCheck}</span>}
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button" 
                                onClick={() => {
                                    setConfig({ type: '', host: '', port: '', database: '', user: '', password: '' });
                                    setStatus('DISCONNECTED');
                                    localStorage.removeItem('k_system_db_config');
                                }}
                                className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Limpar
                            </button>
                            <button 
                                type="submit"
                                disabled={status === 'CONNECTING'}
                                className={`
                                    flex items-center gap-2 px-8 py-2.5 bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-95
                                    ${status === 'CONNECTING' ? 'opacity-70 cursor-not-allowed' : ''}
                                `}
                            >
                                {status === 'CONNECTING' ? (
                                    <>Verificando...</>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Salvar e Conectar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        {/* Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex items-start gap-4">
                <Database className="w-8 h-8 text-blue-500 shrink-0" />
                <div>
                    <h4 className="font-bold text-blue-900 mb-1">Modo Híbrido</h4>
                    <p className="text-sm text-blue-700 leading-relaxed">
                        O sistema operará em modo offline (Local Storage) caso a conexão com o servidor falhe.
                    </p>
                </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex items-start gap-4 md:col-span-2">
                <Server className="w-8 h-8 text-slate-400 shrink-0" />
                <div>
                    <h4 className="font-bold text-slate-800 mb-1">Requisitos de Rede</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Certifique-se que o IP deste terminal está liberado no Firewall do servidor de banco de dados.
                        Conexões via SSL são recomendadas para ambientes de produção.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};