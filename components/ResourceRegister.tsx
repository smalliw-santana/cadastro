
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Plus, Trash2, List, Save, Building, Briefcase, Layers } from 'lucide-react';
import { Input } from './Input';

interface ResourceRegisterProps {
  type: 'FILIAL' | 'DEPARTAMENTO' | 'SETOR';
}

export const ResourceRegister: React.FC<ResourceRegisterProps> = ({ type }) => {
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  
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
    } else {
      alert('Este item já existe!');
    }
  };

  const handleDelete = (item: string) => {
    if (confirm(`Deseja realmente excluir "${item}"?`)) {
      config.remove(item);
      loadItems();
    }
  };

  const Icon = config.icon;

  return (
    <div className="p-6 space-y-6 animate-[fadeIn_0.4s_ease-out]">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-lg">
             <Icon className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{config.title}</h2>
            <p className="text-slate-400 text-sm">{config.description}</p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left: Add Form */}
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

          {/* Right: List */}
          <div className="space-y-4">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <List className="w-5 h-5 text-slate-500" />
                Registros Atuais ({items.length})
             </h3>

             <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {items.length > 0 ? items.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all group">
                      <span className="font-medium text-slate-700 pl-2">{item}</span>
                      <button 
                        onClick={() => handleDelete(item)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Excluir"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
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
    </div>
  );
};
