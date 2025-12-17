'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, UserCheck, ArrowLeft, Loader, MessageCircle } from 'lucide-react';

interface UserResult {
    username: string;
    image?: string;
    age?: number;
    bio?: string;
    isFollowing?: boolean;
}

export default function DiscoverPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState('');

    useEffect(() => {
        const u = localStorage.getItem('cupid_username');
        if (!u) {
            router.push('/login');
            return;
        }
        setCurrentUser(u);
        // Fetch default users immediately
        fetchUsers('', u);
    }, [router]);

    const fetchUsers = async (searchQuery: string, current: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/users/search?query=${searchQuery}&currentUser=${current}`);
            const data = await res.json();
            setResults(data.users || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers(query, currentUser);
    };

    const startChat = async (targetUsername: string, isFollowing: boolean) => {
        if (!isFollowing) {
            await toggleFollow(targetUsername);
        }
        router.push(`/chat?matchName=${targetUsername}`);
    };

    const toggleFollow = async (targetUsername: string) => {
        try {
            const res = await fetch('/api/users/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentUser, targetUsername })
            });
            const data = await res.json();

            if (data.success) {
                // Update local state
                setResults(results.map(u =>
                    u.username === targetUsername
                        ? { ...u, isFollowing: !u.isFollowing }
                        : u
                ));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-20">
            <div className="max-w-md mx-auto">
                <div className="flex items-center mb-6">
                    <button onClick={() => router.push('/chat')} className="mr-4 text-gray-600">
                        <ArrowLeft />
                    </button>
                    <h1 className="text-2xl font-bold text-rose-800">Découvrir</h1>
                </div>

                <form onSubmit={handleSearch} className="relative mb-8">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Chercher un pseudo..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-400 outline-none"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    {query && (
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-rose-500 text-white px-3 py-1 rounded-lg text-sm"
                        >
                            Go
                        </button>
                    )}
                </form>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader className="animate-spin text-pink-500" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {results.map(u => (
                            <div key={u.username} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                        {u.image ? (
                                            <img src={u.image} alt={u.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-r from-pink-300 to-rose-300 flex items-center justify-center text-white font-bold">
                                                {u.username[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{u.username}</h3>
                                        <p className="text-xs text-gray-500">{u.age ? `${u.age} ans` : ''} {u.bio?.substring(0, 20)}...</p>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => startChat(u.username, !!u.isFollowing)}
                                        className="p-2 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100"
                                        title="Message"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => toggleFollow(u.username)}
                                        className={`p-2 rounded-full transition-all ${u.isFollowing
                                            ? 'bg-gray-100 text-gray-600'
                                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                            }`}
                                    >
                                        {u.isFollowing ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {results.length === 0 && !loading && (
                            <p className="text-center text-gray-500">Aucun utilisateur trouvé.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
