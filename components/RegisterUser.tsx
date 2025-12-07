
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Input } from './Input';
import { Select } from './Select';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterUser: React.FC = () => {
  const [formData, setFormData] = useState({
    matricula: '',
    nomeCompleto: '',
    filial: '',
    login: '',
    senha: '',
    departamento: '',
    setor: ''
  });

  // Dynamic Options States
  const [options, setOptions] = useState({
      filiais: [] as string[],
      departamentos: [] as string[],
      setores: [] as string[]
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ matricula?: string }>({});

  useEffect(() => {
    // Load dynamic options from DB
    setOptions({
        filiais: dbService.getFiliais(),
        departamentos: dbService.getDepartamentos(),
        setores: dbService.getSetores()
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Apply Uppercase constraints immediately
    let finalValue = value;
    if (['nomeCompleto', 'login'].includes(name)) {
        finalValue = value.toUpperCase();
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    
    // Clear field specific error when user starts typing again
    if (name === 'matricula') {
        setFieldErrors(prev => ({ ...prev, matricula: undefined }));
    }

    if (feedback) setFeedback(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (name === 'matricula' && value) {
          const exists = dbService.checkMatriculaExists(value);
          if (exists) {
              setFieldErrors(prev => ({ ...prev, matricula: `A matrícula ${value} já está cadastrada no sistema.` }));
          }
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Object.values(formData).some(x => x === '')) {
        setFeedback({ type: 'error', message: 'Por favor, preencha todos os campos.' });
        return;
    }

    if (fieldErrors.matricula) {
        setFeedback({ type: 'error', message: 'Corrija os erros do formulário antes de salvar.' });
        return;
    }

    const result = dbService.addUser({
        ...formData
    });

    if (result.success) {
        setFeedback({ type: 'success', message: result.message });
        setFormData({
            matricula: '',
            nomeCompleto: '',
            filial: '',
            login: '',
            senha: '',
            departamento: '',
            setor: ''
        });
    } else {
        setFeedback({ type: 'error', message: result.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-white">Novo Colaborador</h2>
                <p className="text-slate-400 text-sm mt-1">Preencha os dados abaixo para cadastrar um novo usuário no sistema.</p>
            </div>
            <div className="hidden sm:block text-right">
                <p className="text-slate-400 text-xs uppercase tracking-wider">Data do Cadastro</p>
                <p className="text-white font-mono">{new Date().toLocaleDateString()}</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* ID and Branch Row */}
                <div className="col-span-1">
                    <Input 
                        label="Matrícula"
                        name="matricula"
                        type="number"
                        placeholder="Ex: 1005"
                        value={formData.matricula}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={fieldErrors.matricula}
                        required
                    />
                </div>
                <div className="col-span-1">
                     <Select
                        label="Filial"
                        name="filial"
                        value={formData.filial}
                        onChange={handleChange}
                        options={options.filiais}
                        required
                    />
                </div>

                {/* Name Row */}
                <div className="col-span-1 md:col-span-2">
                    <Input 
                        label="Nome Completo (Automático Caixa Alta)"
                        name="nomeCompleto"
                        type="text"
                        placeholder="NOME DO FUNCIONÁRIO"
                        value={formData.nomeCompleto}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Login Info */}
                <div className="col-span-1">
                    <Input 
                        label="Login (Automático Caixa Alta)"
                        name="login"
                        type="text"
                        placeholder="USUARIO.LOGIN"
                        value={formData.login}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="col-span-1">
                    <Input 
                        label="Senha"
                        name="senha"
                        type="password"
                        placeholder="••••••••"
                        value={formData.senha}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Job Info */}
                <div className="col-span-1">
                    <Select
                        label="Departamento"
                        name="departamento"
                        value={formData.departamento}
                        onChange={handleChange}
                        options={options.departamentos}
                        required
                    />
                </div>
                <div className="col-span-1">
                     <Select
                        label="Setor"
                        name="setor"
                        value={formData.setor}
                        onChange={handleChange}
                        options={options.setores}
                        required
                    />
                </div>
            </div>

            {/* Feedback Message */}
            {feedback && (
                <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                    <span className="font-medium">{feedback.message}</span>
                </div>
            )}

            <div className="mt-8 flex justify-end">
                <button 
                    type="submit"
                    className="flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-xl hover:bg-primary-700 active:scale-95 transition-all shadow-lg shadow-primary-500/30 font-semibold"
                >
                    <Save className="w-5 h-5" />
                    Salvar Cadastro
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
