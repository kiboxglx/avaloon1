import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Lock, Mail, Loader } from 'lucide-react';
import AvaloonLogo from './AvaloonLogo';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage('Conta criada com sucesso! Verifique seu e-mail para confirmar (se necessário) ou faça login.');
                setIsSignUp(false);
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
            // Login successful (or signup successful), App.jsx will handle state if session is created
        } catch (error) {
            console.error('Error in auth:', error);
            setError(error.message || 'Falha na autenticação. Verifique suas credenciais.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10 animate-fade-in-up">
                <div className="flex justify-center mb-8">
                    <AvaloonLogo className="h-20" />
                </div>

                <h2 className="text-2xl font-bold text-center mb-2 text-white">
                    {isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}
                </h2>
                <p className="text-zinc-400 text-center mb-8">
                    {isSignUp ? 'Preencha os dados para se cadastrar' : 'Entre para acessar o painel'}
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-200 p-3 rounded-lg mb-6 text-sm text-center">
                        {message}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-zinc-900/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder-zinc-600"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1.5">Senha</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-zinc-900/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder-zinc-600"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-secondary hover:bg-secondary/90 text-white py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(255,87,34,0.3)] hover:shadow-[0_0_30px_rgba(255,87,34,0.5)] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader className="animate-spin" size={22} />
                        ) : (
                            isSignUp ? 'Cadastrar' : 'Entrar'
                        )}
                    </button>

                    <div className="text-center mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                                setMessage('');
                            }}
                            className="text-zinc-400 hover:text-white text-sm transition-colors"
                        >
                            {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem conta? Cadastre-se'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
