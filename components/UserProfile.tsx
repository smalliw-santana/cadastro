
import React, { useState, useRef } from 'react';
import { SystemUser } from '../types.ts';
import { dbService } from '../services/dbService.ts';
import { User, Camera, Save, ShieldCheck, Key, Mail, UserCircle, AlertCircle } from 'lucide-react';
import { Input } from './Input.tsx';
import { Spinner } from './Spinner.tsx';

interface UserProfileProps {
    currentUser: SystemUser;
    onUpdate: (updatedUser: SystemUser) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ currentUser, onUpdate }) => {
    const [formData, setFormData] = useState({
        nome: currentUser.nome,
        login: currentUser.login,
        senha: '',
        avatarUrl: currentUser.avatarUrl || ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setFeedback(null);

        const result = await dbService.updateSystemUser(currentUser.id, {
            nome: formData.nome.toUpperCase(),
            login: formData.login.toUpperCase(),
            senha: formData.senha || undefined,
            avatarUrl: formData.avatarUrl,
            role: currentUser.role
        });

        if (result.success) {
            const updatedUser: SystemUser = {
                ...currentUser,
                nome: formData.nome.toUpperCase(),
                login: formData.login.toUpperCase(),
                avatarUrl: formData.avatarUrl
            };
            
            await dbService.addLog({
                userName: currentUser.nome,
                action: 'UPDATE',
                resource: 'Perfil',
                details: 'Atualizou dados do próprio perfil.'
            });

            onUpdate(updatedUser);
            setFeedback({ type: 'success', message: 'Perfil atualizado com sucesso!' });
            setFormData(prev => ({ ...prev, senha: '' }));
        } else {
            setFeedback({ type: 'error', message: result.message });
        }
        
        setIsSaving(false);
        setTimeout(() => setFeedback(null), 3000);
    };

    const PREDEFINED_AVATARS = [
        'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=f8fafc',
        'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack&backgroundColor=f8fafc',
        'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=f8fafc',
        'https://api.dicebear.com/7.x/adventurer/svg?seed=Max&backgroundColor=f8fafc',
        'https://api.dicebear.com/7.x/adventurer/svg?seed=Sam&backgroundColor=f8fafc'
    ];

    return (
        <div className="max-w-4xl mx-auto p-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-slate-100 dark:border-dark-700 overflow-hidden">
                <div className="bg-professional-red p-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 dark:bg-dark-800/20 rounded-xl">
                            <UserCircle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Meu Perfil</h2>
                            <p className="text-white/70 text-sm">Gerencie suas informações pessoais e de acesso.</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 dark:bg-dark-800/10 rounded-full border border-white/20">
                        <ShieldCheck className="w-4 h-4 text-white" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{currentUser.role}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Left: Avatar Management */}
                    <div className="md:col-span-1 flex flex-col items-center space-y-6">
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-3xl bg-slate-100 dark:bg-dark-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-dark-800 shadow-2xl ring-1 ring-slate-200 dark:ring-dark-600 group-hover:ring-primary-500 transition-all">
                                {formData.avatarUrl ? (
                                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                    <User className="w-16 h-16 text-slate-300" />
                                )}
                            </div>
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-3 -right-3 p-3 bg-primary-600 text-white rounded-2xl shadow-lg hover:bg-primary-700 active:scale-90 transition-all border-4 border-white dark:border-dark-800"
                                title="Alterar Foto"
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>

                        <div className="w-full space-y-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Modelos Rápidos</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {PREDEFINED_AVATARS.map((url, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, avatarUrl: url }))}
                                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${formData.avatarUrl === url ? 'border-primary-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                                    >
                                        <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover bg-slate-50 dark:bg-dark-900" referrerPolicy="no-referrer" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Form Fields */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <Input 
                                label="Nome Completo"
                                icon={User}
                                value={formData.nome}
                                onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value.toUpperCase() }))}
                                required
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Input 
                                    label="Login de Acesso"
                                    icon={Mail}
                                    value={formData.login}
                                    onChange={e => setFormData(prev => ({ ...prev, login: e.target.value.toUpperCase() }))}
                                    required
                                />
                                <Input 
                                    label="Nova Senha"
                                    icon={Key}
                                    type="password"
                                    value={formData.senha}
                                    onChange={e => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                                    placeholder="Deixe em branco para manter"
                                />
                            </div>
                        </div>

                        {feedback && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 animate-[fadeIn_0.3s] ${feedback.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800'}`}>
                                {feedback.type === 'success' ? <Save className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                <span className="font-medium">{feedback.message}</span>
                            </div>
                        )}

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-primary-600 text-white px-10 py-3.5 rounded-xl hover:bg-primary-700 active:scale-95 transition-all shadow-lg shadow-primary-500/30 font-bold disabled:opacity-70"
                            >
                                {isSaving ? <Spinner size="sm" variant="white" /> : <Save className="w-5 h-5" />}
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
