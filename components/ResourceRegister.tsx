
import React, { useState, useEffect } from 'react';
import { SystemUser } from '../types.ts';
import { dbService } from '../services/dbService.ts';
import { Plus, Trash2, List, Save, Building, Briefcase, Layers, CheckCircle2, AlertCircle, X, AlertTriangle } from 'lucide-react';
import { Input } from './Input.tsx';
import { Spinner } from './Spinner.tsx';
import { ConfirmModal } from './ConfirmModal.tsx';

interface ResourceRegisterProps {
  type: 'FILIAL' | 'FUNCAO' | 'SETOR';
  currentUser?: SystemUser;
}

export const ResourceRegister: React.FC<ResourceRegisterProps> = ({ type, currentUser }) => {
  const userRole = currentUser?.role || 'CONVIDADO';
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [successItemName, setSuccessItemName] = useState('');
  
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
    FUNCAO: {
      title: 'Gerenciar Funções',
      label: 'Nova Função',
      icon: Layers,
      description: 'Cadastre as funções na empresa.',
      get: dbService.getFuncoes,
      add: dbService.addFuncao,
      remove: dbService.deleteFuncao
    },
    SETOR: {
      title: 'Gerenciar Setores',
      label: 'Novo Setor',
      icon: Briefcase,
      description: 'Defina os setores da empresa.',
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

  const loadItems = async () => {
    setItems(await config.get());
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const success = await config.add(newItem);
    if (success) {
      setSuccessItemName(newItem.trim().toUpperCase());
      if (currentUser) {
          await dbService.addLog({
              userName: currentUser.nome,
              action: 'CREATE',
              resource: type,
              details: `Cadastrou ${type.toLowerCase()}: ${newItem.trim().toUpperCase()}`
          });
      }
      setNewItem('');
      setShowSaveSuccess(true);
      loadItems();
      
      setTimeout(() => {
          setShowSaveSuccess(false);
          setFeedback({ type: 'success', message: 'Item cadastrado com sucesso!' });
      }, 5000);
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
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsProcessing(true);
    
    // Simulate a small delay for better UX
    setTimeout(async () => {
        const success = await config.remove(itemToDelete);
        
        if (success) {
            setSuccessItemName(itemToDelete);
            if (currentUser) {
                await dbService.addLog({
                    userName: currentUser.nome,
                    action: 'DELETE',
                    resource: type,
                    details: `Excluiu ${type.toLowerCase()}: ${itemToDelete}`
                });
            }
            
            setIsDeleteModalOpen(false);
            setShowDeleteSuccess(true);
            loadItems();

            setTimeout(() => {
                setShowDeleteSuccess(false);
                setFeedback({ type: 'success', message: 'Item removido com sucesso.' });
                setItemToDelete(null);
            }, 5000);
        } else {
            setFeedback({ type: 'error', message: 'Erro ao remover item. Tente recarregar a página.' });
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
        
        setIsProcessing(false);
    }, 500);
  };

  const Icon = config.icon;

  return (
    <div className="p-6 space-y-6 animate-[fadeIn_0.4s_ease-out]">
        <style>{`
            @keyframes popIn {
                0% { transform: scale(0.9); opacity: 0; }
                50% { transform: scale(1.05); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
            .animate-pop-in {
                animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            @keyframes fadeSlideUp {
                0% { transform: translateY(20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
            .animate-fade-slide-up {
                animation: fadeSlideUp 0.5s ease-out forwards;
            }
        `}</style>

        {/* Deletion Success Animation Overlay */}
        {showDeleteSuccess && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
                <div className="flex flex-col items-center text-center p-8 animate-pop-in">
                    <div className="w-24 h-24 mb-6 rounded-full bg-red-600 flex items-center justify-center shadow-2xl shadow-red-600/40">
                        <Trash2 className="w-12 h-12 text-white animate-bounce" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Registro Excluído
                    </h2>
                    <p className="text-red-100 text-lg animate-fade-slide-up [animation-delay:0.2s]">
                        O item <span className="font-bold">{successItemName}</span> foi removido.
                    </p>
                    <div className="mt-8 flex gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-ping [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-ping [animation-delay:0.4s]"></div>
                    </div>
                </div>
            </div>
        )}

        {/* Save Success Animation Overlay */}
        {showSaveSuccess && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
                <div className="flex flex-col items-center text-center p-8 animate-pop-in">
                    <div className="w-24 h-24 mb-6 rounded-full bg-green-600 flex items-center justify-center shadow-2xl shadow-green-600/40">
                        <CheckCircle2 className="w-12 h-12 text-white animate-bounce" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Cadastro Realizado
                    </h2>
                    <p className="text-green-100 text-lg animate-fade-slide-up [animation-delay:0.2s]">
                        O item <span className="font-bold">{successItemName}</span> foi salvo com sucesso.
                    </p>
                    <div className="mt-8 flex gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-ping [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-ping [animation-delay:0.4s]"></div>
                    </div>
                </div>
            </div>
        )}

        {/* Feedback Toast */}
        {feedback && (
            <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-[slideIn_0.3s_ease-out] ${
                feedback.type === 'success' ? 'bg-white dark:bg-dark-800 border-green-200 text-green-700' : 'bg-white dark:bg-dark-800 border-red-200 text-red-700 dark:text-red-400'
            }`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500"/> : <AlertCircle className="w-5 h-5 text-red-500"/>}
                <span className="font-medium">{feedback.message}</span>
                <button onClick={() => setFeedback(null)} className="ml-2 text-slate-400 hover:text-slate-600 dark:text-slate-300"><X className="w-4 h-4"/></button>
            </div>
        )}

      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-slate-100 dark:border-dark-700 overflow-hidden">
        
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
               <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-dark-700 pb-2">
                  <Plus className="w-5 h-5 text-primary-500" />
                  Cadastrar Novo
               </h3>
               
               <form onSubmit={handleAdd} className="bg-slate-50 dark:bg-dark-900 p-6 rounded-xl border border-slate-200 dark:border-dark-600">
                  <Input 
                     label={`Nome do ${type === 'FILIAL' ? 'Filial' : type === 'SETOR' ? 'Setor' : 'Função'}`}
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
             <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-dark-700 pb-2">
                <List className="w-5 h-5 text-slate-500" />
                Registros Atuais ({items.length})
             </h3>

             <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {items.length > 0 ? items.map((item) => (
                   <div key={item} className="flex justify-between items-center p-3 bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-600 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all group">
                      <span className="font-medium text-slate-700 dark:text-slate-200 pl-2">{item}</span>
                      
                      {/* Delete Button - ONLY FOR ADMIN */}
                      {userRole === 'ADMIN' && (
                          <button 
                            type="button"
                            onClick={(e) => requestDelete(e, item)}
                            className="p-2 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
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
       <ConfirmModal
            isOpen={isDeleteModalOpen}
            title="Confirmar Exclusão"
            message={`Tem certeza que deseja excluir o item "${itemToDelete}"? Esta ação não pode ser desfeita.`}
            confirmText="Sim, Excluir"
            onConfirm={confirmDelete}
            onCancel={() => setIsDeleteModalOpen(false)}
            isProcessing={isProcessing}
            icon={Trash2}
            variant="danger"
        />
    </div>
  );
};
