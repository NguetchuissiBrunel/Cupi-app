'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erreur de connexion');
            }

            localStorage.setItem('cupid_username', data.user.username);
            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-rose-100">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl w-full max-w-md border border-pink-200">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-block relative mb-4 group">
                        <Heart className="w-16 h-16 text-pink-500 fill-pink-500 transform group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 animate-ping opacity-0 group-hover:opacity-30">
                            <Heart className="w-16 h-16 text-pink-500 fill-pink-500" />
                        </div>
                    </Link>
                    <h1 className="text-4xl font-dancing font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600">
                        Bon retour
                    </h1>
                    <p className="text-rose-600 mt-2">Connecte-toi à ton cœur</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-rose-800">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400 w-5 h-5" />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-pink-100 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
                                placeholder="ton@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-rose-800">Mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400 w-5 h-5" />
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-pink-100 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-4 rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Connexion...</span>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                <span>Se connecter</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-600">
                        Pas encore de compte ?{' '}
                        <Link href="/register" className="text-pink-600 font-semibold hover:text-rose-700 flex items-center justify-center inline-flex transition-colors">
                            Créer un profil
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
