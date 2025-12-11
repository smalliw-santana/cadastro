
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService.ts';
import { Plus, Trash2, List, Save, Building, Briefcase, Layers, CheckCircle2, AlertCircle, X, AlertTriangle } from 'lucide-react';
import { Input } from './Input.tsx';
import { Spinner } from './Spinner.tsx';

interface ResourceRegisterProps {
  type: 'FILIAL' | 'DEPARTAMENTO' | 'SETOR';
  userRole: 'ADMIN' | 'CONVIDADO';
}

export const ResourceRegister: React.FC<ResourceRegisterProps> = ({ type, userRole }) => {
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const config = {
    FILIAL: {
      title: 'Gerenciar Filiais',
      label: 'Nova Filial',
      icon: Building,
      description: 'Cadastre as unidades físicas da empresa.',
      get: dbService.getFiliais,
      add: dbService.addFilial,
      remove: dbService.deleteFilial
    },
    DEPARTAMENTO: {
      title: 'Gerenciar Departamentos',
      label: 'Novo Departamento',
      icon: Layers,
      description: 'Estruture as grandes áreas da organização.',
      get: dbService.getDepartamentos,
      add: dbService.addDepartamento,
      remove: dbService.deleteDepartamento
    },
    SETOR: {
      title: 'Gerenciar Setores',
      label: 'Novo Setor',
      icon: Briefcase,
      description: 'Defina as divisões de trabalho dentro dos departamentos.',
      get: dbService.getSetores,
      add: dbService.addSetor,
      remove: dbService.deleteSetor
    }
  }[type];

  useEffect(() => {
    loadItems();
    setFeedback(null);
    setNewItem('');
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  }, [type]);

  const loadItems = () => {
    setItems(config.get());
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const success = config.add(newItem);
    if (success) {
      setNewItem('');
      loadItems();
      setFeedback({ type: 'success', message: 'Item cadastrado com sucesso!' });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', message: 'Este item já existe na lista.' });
    }
  };

  // Open the custom delete modal
  const requestDelete = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    e.preventDefault();
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  // Execute the deletion
  const confirmDelete = () => {
    if (!itemToDelete) return;
    
    setIsProcessing(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
        const success = config.remove(itemToDelete);
        
        if (success) {
            loadItems();
            setFeedback({ type: 'success', message: 'Item removido com sucesso.' });
        } else {
            setFeedback({ type: 'error', message: 'Erro ao remover item. Tente recarregar a página.' });
        }
        
        setIsProcessing(false);
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        
        setTimeout(() => setFeedback(null), 3000);
    }, 500);
  };

  const Icon = config.icon;

  return (
    <div className="p-6 space-y-6 animate-[fadeIn_0.4s_ease-out]">
        {/* Feedback Toast */}
        {feedback && (
            <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-[slideIn_0.3s_ease-out] ${
                feedback.type === 'success' ? 'bg-white border-green-200 text-green-700' : 'bg-white border-red-200 text-red-700'
            }`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500"/> : <AlertCircle className="w-5 h-5 text-red-500"/>}
                <span className="font-medium">{feedback.message}</span>
                <button onClick={() => setFeedback(null)} className="ml-2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
            </div>
        )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-primary-900 p-6 flex items-center gap-4">
          <div className="p-3 bg-primary-800 rounded-lg">
             <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{config.title}</h2>
            <p className="text-primary-200 text-sm">
                {userRole === 'ADMIN' ? config.description : 'Visualização de registros do sistema.'}
            </p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left: Add Form - ONLY FOR ADMIN */}
          {userRole === 'ADMIN' && (
            <div className="space-y-6">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Plus className="w-5 h-5 text-primary-500" />
                  Cadastrar Novo
               </h3>
               
               <form onSubmit={handleAdd} className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <Input 
                     label={`Nome do ${type === 'FILIAL' ? 'Filial' : type === 'SETOR' ? 'Setor' : 'Departamento'}`}
                     value={newItem}
                     onChange={(e) => setNewItem(e.target.value.toUpperCase())}
                     placeholder="Digite o nome..."
                     fullWidth
                  />
                  <button 
                    type="submit"
                    disabled={!newItem.trim()}
                    className="w-full mt-2 flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
                  >
                    <Save className="w-4 h-4" />
                    Salvar Cadastro
                  </button>
               </form>
            </div>
          )}

          {/* Right: List - Full Width if Operator */}
          <div className={`space-y-4 ${userRole !== 'ADMIN' ? 'col-span-1 md:col-span-2' : ''}`}>
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <List className="w-5 h-5 text-slate-500" />
                Registros Atuais ({items.length})
             </h3>

             <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {items.length > 0 ? items.map((item) => (
                   <div key={item} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all group">
                      <span className="font-medium text-slate-700 pl-2">{item}</span>
                      
                      {/* Delete Button - ONLY FOR ADMIN */}
                      {userRole === 'ADMIN' && (
                          <button 
                            type="button"
                            onClick={(e) => requestDelete(e, item)}
                            className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                            title="Excluir"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                      )}
                   </div>
                )) : (
                  <div className="text-center py-8 text-slate-400">
                    Nenhum registro encontrado.
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>

       {/* Delete Confirmation Modal */}
       {isDeleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s]">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Confirmar Exclusão</h3>
                        <p className="text-slate-500 mb-6">
                            Tem certeza que deseja excluir o item <strong>"{itemToDelete}"</strong>?
                            <br/>
                            <span className="text-xs text-slate-400 mt-1 block">Esta ação não pode ser desfeita.</span>
                        </p>
                        
                        <div className="flex gap-3 justify-center">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isProcessing}
                                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmDelete}
                                disabled={isProcessing}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-500/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? <Spinner size="sm" variant="white" /> : <Trash2 className="w-4 h-4" />}
                                {isProcessing ? "Excluindo..." : "Sim, Excluir"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
