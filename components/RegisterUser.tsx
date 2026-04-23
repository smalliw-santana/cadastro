
import React, { useState, useEffect } from 'react';
import { SystemUser, User } from '../types.ts';
import { dbService } from '../services/dbService.ts';
import { Input } from './Input.tsx';
import { Select } from './Select.tsx';
import { Save, AlertCircle, CheckCircle2, ShieldAlert, User as UserIcon, X } from 'lucide-react';
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
        segmento: '',
        usuarioColetor: ''
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
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

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

        setFormData(prev => {
            const newData = { ...prev, [name]: finalValue };
            
            if (name === 'matricula') {
                newData.login = `M${finalValue}`.toUpperCase();
            }
            
            // Generate password suggestion based on name and matricula
            if (name === 'matricula' || name === 'nomeCompleto') {
                const mat = newData.matricula || '';
                const nome = newData.nomeCompleto || '';
                
                if (mat && nome.trim()) {
                    const words = nome.trim().split(/\s+/).filter(Boolean);
                    if (words.length > 0) {
                        const firstChar = words[0][0]?.toUpperCase() || '';
                        const lastChar = words.length > 1 ? words[words.length - 1][0]?.toUpperCase() || '' : '';
                        const suffixOptions = mat.length >= 3 ? mat.slice(-3) : mat;
                        
                        newData.senha = `${firstChar}${suffixOptions}${lastChar}`;
                    }
                }
            }
            
            return newData;
        });

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
                
                setShowSuccessAnimation(true);
                setTimeout(() => {
                    setShowSuccessAnimation(false);
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
                        segmento: '',
                        usuarioColetor: ''
                    });
                }, 5000);
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
        <div className="max-w-4xl mx-auto p-6 animate-[fadeIn_0.3s_ease-out] relative">
            {feedback && (
                <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-[slideIn_0.3s_ease-out] ${
                    feedback.type === 'success' ? 'bg-white border-green-200 text-green-700' : 'bg-white border-red-200 text-red-700'
                }`}>
                    {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500"/> : <AlertCircle className="w-5 h-5 text-red-500"/>}
                    <span className="font-medium">{feedback.message}</span>
                    <button onClick={() => setFeedback(null)} className="ml-2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
                </div>
            )}

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

            {/* Success Animation Overlay */}
            {showSuccessAnimation && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex flex-col items-center text-center p-8 animate-pop-in">
                        <div className="w-24 h-24 mb-6 rounded-full bg-green-600 flex items-center justify-center shadow-2xl shadow-green-600/40">
                            <CheckCircle2 className="w-12 h-12 text-white animate-bounce" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                            Cadastro Realizado
                        </h2>
                        <p className="text-green-100 text-lg animate-fade-slide-up [animation-delay:0.2s]">
                            O colaborador <span className="font-bold">{formData.nomeCompleto}</span> foi cadastrado com sucesso.
                        </p>
                        <div className="mt-8 flex gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping [animation-delay:0.2s]"></div>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping [animation-delay:0.4s]"></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-professional-red p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Novo Colaborador</h2>
                        <p className="text-white/70 text-sm mt-1">Preencha os dados abaixo para cadastrar um novo usuário no sistema.</p>
                    </div>
                    <div className="hidden sm:block text-right">
                        <p className="text-white/50 text-xs uppercase tracking-wider">Data do Cadastro</p>
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
                        <div className="col-span-1">
                            <Select
                                label="Usuário de Coletor"
                                name="usuarioColetor"
                                value={formData.usuarioColetor}
                                onChange={handleChange}
                                options={['SIM', 'NÃO']}
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
