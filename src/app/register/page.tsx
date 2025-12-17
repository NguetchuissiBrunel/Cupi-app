'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Mail, Lock, User, Upload, ArrowRight, Camera } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        age: '',
        gender: 'male',
        preferences: 'female',
        bio: '',
        image: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    age: parseInt(formData.age)
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erreur d&apos;inscription');
            }

            // Auto login redirects to login page for now
            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-2xl w-full max-w-2xl border border-pink-200">
                <div className="text-center mb-10">
                    <Heart className="w-12 h-12 text-pink-500 fill-pink-500 mx-auto mb-4 animate-pulse" />
                    <h1 className="text-4xl font-dancing font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600">
                        Créer ton profil
                    </h1>
                    <p className="text-rose-600 mt-2">L'amour commence ici</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            {/* Photo Upload */}
                            <div className="flex flex-col items-center">
                                <div className="relative group cursor-pointer w-32 h-32">
                                    <div className={`w-full h-full rounded-full border-4 border-pink-200 overflow-hidden flex items-center justify-center bg-pink-50 transition-all ${!formData.image ? 'hover:border-pink-400' : ''}`}>
                                        {formData.image ? (
                                            <img src={formData.image} alt="Profil" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="w-10 h-10 text-pink-300" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <div className="absolute bottom-0 right-0 bg-pink-500 rounded-full p-2 text-white shadow-lg group-hover:bg-rose-600 transition-colors">
                                        <Upload className="w-4 h-4" />
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500 mt-2">Ta meilleure photo</span>
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-rose-800">Pseudo</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-pink-100 focus:border-pink-400 outline-none"
                                        placeholder="Ton surnom"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-rose-800">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-pink-100 focus:border-pink-400 outline-none"
                                        placeholder="email@exemple.com"
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
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-pink-100 focus:border-pink-400 outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-rose-800">Âge</label>
                                <input
                                    type="number"
                                    required
                                    min="18"
                                    max="99"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-pink-100 focus:border-pink-400 outline-none"
                                    placeholder="18+"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-rose-800">Je suis</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-pink-100 focus:border-pink-400 outline-none bg-white"
                                    >
                                        <option value="male">Homme</option>
                                        <option value="female">Femme</option>
                                        <option value="other">Autre</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-rose-800">Je cherche</label>
                                    <select
                                        value={formData.preferences}
                                        onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-pink-100 focus:border-pink-400 outline-none bg-white"
                                    >
                                        <option value="female">Femme</option>
                                        <option value="male">Homme</option>
                                        <option value="everyone">Tout le monde</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-rose-800">Ma Bio (dis-nous tout !)</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-pink-100 focus:border-pink-400 outline-none h-32 resize-none"
                                    placeholder="J'aime les promenades sur la plage et..."
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-6 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-4 rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-70"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Création du profil...</span>
                        ) : (
                            <>
                                <span>S'inscrire</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-600">
                        Déjà inscrit ?{' '}
                        <Link href="/login" className="text-pink-600 font-semibold hover:text-rose-700">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
