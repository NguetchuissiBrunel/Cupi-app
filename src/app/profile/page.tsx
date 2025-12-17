'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Heart, MapPin, Briefcase } from 'lucide-react';

interface UserProfile {
    username: string;
    email: string;
    image?: string;
    bio?: string;
    age?: number;
    gender?: string;
    preferences?: string;
    status: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            const username = localStorage.getItem('cupid_username');
            if (!username) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch(`/api/profile/me?username=${username}`);
                const data = await res.json();

                if (data.success) {
                    setProfile({
                        ...data.user,
                        status: 'En ligne'
                    });
                } else {
                    // Fallback or error handling
                    console.error(data.error);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        fetchProfile();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('cupid_username');
        // Also call API to clear cookie
        document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        router.push('/login');
    };

    if (!profile) return <div className="p-8 text-center text-rose-600">Chargement du profil...</div>;

    return (
        <div className="min-h-screen p-4 pb-24 bg-gradient-to-br from-pink-50 to-rose-100">
            <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-pink-200">

                {/* Header / Cover */}
                <div className="h-32 bg-gradient-to-r from-pink-500 to-rose-600 relative">
                    <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                        <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-pink-100 flex items-center justify-center">
                            {profile.image ? (
                                <img src={profile.image} alt={profile.username} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-16 h-16 text-pink-300" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-20 pb-8 px-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center">
                        {profile.username}
                        <span className="ml-2 px-2 py-0.5 bg-pink-100 text-pink-600 text-xs rounded-full">
                            {profile.age} ans
                        </span>
                    </h1>
                    <p className="text-gray-500 mt-1">{profile.gender === 'male' ? 'Homme' : 'Femme'}</p>

                    <p className="mt-4 text-gray-700 italic">
                        "{profile.bio}"
                    </p>

                    <div className="mt-6 flex justify-center space-x-8 text-sm text-gray-600">
                        <div className="flex flex-col items-center">
                            <span className="font-bold text-gray-900">12</span>
                            <span>Matchs</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-bold text-gray-900">85%</span>
                            <span>Compatibilité</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-bold text-gray-900">342</span>
                            <span>Vues</span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="mt-8 w-full flex items-center justify-center space-x-2 py-3 px-4 border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Se déconnecter</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
