
import React, { useState, useEffect } from 'react';
import { SystemUser, User } from '../types.ts';
import { dbService } from '../services/dbService.ts';
import { Input } from './Input.tsx';
import { Select } from './Select.tsx';
import { Save, AlertCircle, CheckCircle2, ShieldAlert, User as UserIcon } from 'lucide-react';
import { Spinner } from './Spinner.tsx';

interface RegisterUserProps {
    currentUser?: SystemUser;
}

export const RegisterUser: React.FC<RegisterUserProps> = ({ currentUser }) => {
    const userRole = currentUser?.role || 'CONVIDADO';
    const [formData, setFormData] = useState({
        matricula: '',
        nomeCompleto: '',
        filial: '',
        login: '',
        senha: '',
        funcao: '',
        setor: '',
        codigoVenda: '',
        segmento: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [existingUser, setExistingUser] = useState<User | null>(null);

    // Dynamic Options States
    const [options, setOptions] = useState({
        filiais: [] as string[],
        funcoes: [] as string[],
        setores: [] as string[]
    });

    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ matricula?: string }>({});

    useEffect(() => {
        // Load dynamic options from DB
        const loadOptions = async () => {
            setOptions({
                filiais: await dbService.getFiliais(),
                funcoes: await dbService.getFuncoes(),
                setores: await dbService.getSetores()
            });
        };
        loadOptions();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Apply Uppercase constraints immediately
        let finalValue = value;
        if (['nomeCompleto', 'login'].includes(name)) {
            finalValue = value.toUpperCase();
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));

        if (name === 'matricula') {
            setFieldErrors(prev => ({ ...prev, matricula: undefined }));
            setExistingUser(null);
        }

        if (feedback) setFeedback(null);
    };

    const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'matricula' && value) {
            const user = await dbService.checkMatriculaExists(value);
            if (user) {
                setExistingUser(user);
                setFieldErrors(prev => ({ ...prev, matricula: `A matrícula ${value} já está cadastrada.` }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const requiredFields = ['matricula', 'nomeCompleto', 'filial', 'login', 'senha', 'funcao', 'setor'];
        if (requiredFields.some(field => !formData[field as keyof typeof formData])) {
            setFeedback({ type: 'error', message: 'Por favor, preencha todos os campos obrigatórios.' });
            return;
        }

        const matriculaExists = await dbService.checkMatriculaExists(formData.matricula);
        if (matriculaExists) {
            setExistingUser(matriculaExists);
            setFieldErrors(prev => ({ ...prev, matricula: `A matrícula ${formData.matricula} já está cadastrada.` }));
            setFeedback({ type: 'error', message: 'Corrija os erros do formulário antes de salvar.' });
            return;
        }

        if (fieldErrors.matricula) {
            setFeedback({ type: 'error', message: 'Corrija os erros do formulário antes de salvar.' });
            return;
        }

        setIsSaving(true);
        // Simulate API delay
        setTimeout(async () => {
            const result = await dbService.addUser({
                ...formData
            });

            if (result.success) {
                if (currentUser) {
                    await dbService.addLog({
                        userName: currentUser.nome,
                        action: 'CREATE',
                        resource: 'Usuário (Colaborador)',
                        details: `Usuário ${formData.login} cadastrado.`
                    });
                }
                setFeedback({ type: 'success', message: result.message });
                setExistingUser(null);
                setFormData({
                    matricula: '',
                    nomeCompleto: '',
                    filial: '',
                    login: '',
                    senha: '',
                    funcao: '',
                    setor: '',
                    codigoVenda: '',
                    segmento: ''
                });
            } else {
                setFeedback({ type: 'error', message: result.message });
            }
            setIsSaving(false);
        }, 1000);
    };

    if (userRole !== 'ADMIN') {
        return (
            <div className="flex h-full items-center justify-center p-6 animate-[fadeIn_0.3s]">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Acesso Restrito</h2>
                    <p className="text-slate-500">
                        Seu nível de acesso (CONVIDADO) não permite realizar novos cadastros. Solicite permissão ao administrador.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-primary-900 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Novo Colaborador</h2>
                        <p className="text-primary-100 text-sm mt-1">Preencha os dados abaixo para cadastrar um novo usuário no sistema.</p>
                    </div>
                    <div className="hidden sm:block text-right">
                        <p className="text-primary-200 text-xs uppercase tracking-wider">Data do Cadastro</p>
                        <p className="text-white font-mono">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    {existingUser && (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4 animate-[fadeIn_0.3s_ease-out]">
                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600 shrink-0">
                                <UserIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-amber-800 font-bold text-sm mb-1">Matrícula já cadastrada</h3>
                                <p className="text-amber-700 text-sm mb-2">Os dados abaixo pertencem ao colaborador que já utiliza esta matrícula:</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-amber-900/80">
                                    <p><span className="font-semibold">Nome:</span> {existingUser.nomeCompleto}</p>
                                    <p><span className="font-semibold">Filial:</span> {existingUser.filial}</p>
                                    <p><span className="font-semibold">Setor:</span> {existingUser.setor}</p>
                                    <p><span className="font-semibold">Função:</span> {existingUser.funcao}</p>
                                    <p><span className="font-semibold">Segmento:</span> {existingUser.segmento || 'SUPERMERCADO'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* ID and Branch Row */}
                        <div className="col-span-1">
                            <Input
                                label="Matrícula"
                                name="matricula"
                                type="text"
                                /* placeholder="1001"*/
                                value={formData.matricula}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={fieldErrors.matricula}
                                required
                                disabled={isSaving}
                                autoFocus
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
                                disabled={isSaving}
                            />
                        </div>

                        {/* Name Row */}
                        <div className="col-span-1 md:col-span-2">
                            <Input
                                label="Nome Completo"
                                name="nomeCompleto"
                                type="text"
                                /*placeholder="NOME DO FUNCIONÁRIO"*/
                                value={formData.nomeCompleto}
                                onChange={handleChange}
                                required
                                disabled={isSaving}
                            />
                        </div>

                        {/* Login Info */}
                        <div className="col-span-1">
                            <Input
                                label="Login"
                                name="login"
                                type="text"
                                /*placeholder="USUARIO"*/
                                value={formData.login}
                                onChange={handleChange}
                                required
                                disabled={isSaving}
                            />
                        </div>
                        <div className="col-span-1">
                            <Input
                                label="Senha"
                                name="senha"
                                type="text"
                                /*placeholder="********"*/
                                value={formData.senha}
                                onChange={handleChange}
                                required
                                disabled={isSaving}
                            />
                        </div>

                        {/* Job Info */}
                        <div className="col-span-1">
                            <Select
                                label="Setor"
                                name="setor"
                                value={formData.setor}
                                onChange={handleChange}
                                options={options.setores}
                                required
                                disabled={isSaving}
                            />
                        </div>
                        <div className="col-span-1">
                            <Select
                                label="Função"
                                name="funcao"
                                value={formData.funcao}
                                onChange={handleChange}
                                options={options.funcoes}
                                required
                                disabled={isSaving}
                            />
                        </div>
                        <div className="col-span-1">
                            <Select
                                label="Segmento"
                                name="segmento"
                                value={formData.segmento}
                                onChange={handleChange}
                                options={['SUPERMERCADO', 'MAGAZAN', 'FARMACIA', 'HOME CENTER', 'PET SHOP', 'NUTRILIDER', 'OTICA', 'OUTROS']}
                                required
                                disabled={isSaving}
                            />
                        </div>
                        {/* Sales Info */}
                        <div className="col-span-1">
                            <Input
                                label="Código de Venda"
                                name="codigoVenda"
                                type="text"
                                /*placeholder="Ex: 00000-1"*/
                                value={formData.codigoVenda}
                                onChange={handleChange}
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    {/* Feedback Message */}
                    {feedback && (
                        <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span className="font-medium">{feedback.message}</span>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-xl hover:bg-primary-700 active:scale-95 transition-all shadow-lg shadow-primary-500/30 font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <Spinner size="sm" variant="white" /> : <Save className="w-5 h-5" />}
                            {isSaving ? 'Salvando...' : 'Salvar Cadastro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
