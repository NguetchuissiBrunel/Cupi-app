'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Send, ArrowLeft, Phone, Video, Search, MessageCircle, UserPlus } from 'lucide-react';
import { createRoot } from 'react-dom/client';

interface Message {
    _id: string;
    sender: string;
    receiver: string;
    content: string;
    createdAt: string;
}

interface MatchPreview {
    username: string;
    lastMessage?: string;
    timestamp?: string;
    avatar?: string;
    unreadCount?: number;
    isOnline?: boolean;
    lastSeen?: Date;
}

// Separate component for VideoCall to avoid import cycles if any (though currently it's fine)
import VideoCall from '@/components/VideoCall';

function ChatContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialMatchName = searchParams.get('matchName');

    const [currentMatch, setCurrentMatch] = useState<string | null>(initialMatchName);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState('');
    const [matches, setMatches] = useState<MatchPreview[]>([]);

    // Call States
    const [isInCall, setIsInCall] = useState(false);
    const [isIncomingCall, setIsIncomingCall] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- METHODS DEFINED BEFORE USE ---

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const sendHeartbeat = useCallback(async (username: string) => {
        try {
            await fetch('/api/users/presence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
        } catch (e) { console.error(e); }
    }, []);

    const fetchMatches = useCallback(async (username: string) => {
        try {
            const res = await fetch(`/api/matches?username=${username}`);
            const data = await res.json();
            if (data.success) {
                setMatches(data.matches);
            }
        } catch (error) {
            console.error('Error fetching matches:', error);
        }
    }, []);

    const fetchMessages = useCallback(async (user1: string, user2: string) => {
        try {
            const res = await fetch(`/api/messages?user1=${user1}&user2=${user2}`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || !currentMatch) return;

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: currentUser,
                    receiver: currentMatch,
                    content: newMessage
                })
            });

            const data = await res.json();
            if (data.success) {
                setMessages(prev => [...prev, data.message]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const startCall = (video: boolean) => {
        setIsIncomingCall(false);
        setIsInCall(true);
    };

    // --- EFFECTS ---

    // 1. Initial Setup & Heartbeat
    useEffect(() => {
        const username = localStorage.getItem('cupid_username');
        if (!username) {
            router.push('/login');
            return;
        }
        setCurrentUser(username);

        // Initial fetch
        fetchMatches(username);

        // Heartbeat & Polling
        const heartbeatInterval = setInterval(() => sendHeartbeat(username), 30000); // 30s
        const matchesInterval = setInterval(() => fetchMatches(username), 5000); // 5s

        // Initial heartbeat
        sendHeartbeat(username);

        return () => {
            clearInterval(heartbeatInterval);
            clearInterval(matchesInterval);
        };
    }, [router, fetchMatches, sendHeartbeat]);

    // 2. Incoming Call Detection & Messages
    useEffect(() => {
        if (!currentUser) return;

        const signalInterval = setInterval(async () => {
            if (isInCall) return; // Don't poll for invites if already in call

            try {
                const res = await fetch(`/api/calls/signal?username=${currentUser}`);
                const data = await res.json();

                if (data.signals) {
                    const invite = data.signals.find((s: any) => s.type === 'invite');
                    if (invite) {
                        setCurrentMatch(invite.sender);
                        setIsIncomingCall(true);
                        setIsInCall(true);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }, 2000);

        return () => clearInterval(signalInterval);
    }, [currentUser, isInCall]);

    // 3. Message Polling
    useEffect(() => {
        if (currentMatch && currentUser) {
            fetchMessages(currentUser, currentMatch);
            const interval = setInterval(() => fetchMessages(currentUser, currentMatch), 3000);
            return () => clearInterval(interval);
        }
    }, [currentMatch, currentUser, fetchMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);


    // --- VIEW RENDERING ---

    // List View
    if (!currentMatch) {
        return (
            <div className="bg-gray-50 min-h-screen pb-20">
                {/* Header */}
                <div className="bg-white p-4 sticky top-0 border-b border-gray-100 z-10 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
                    <button
                        onClick={() => router.push('/discover')}
                        className="flex items-center space-x-1 text-rose-500 font-semibold text-sm bg-rose-50 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Découvrir</span>
                    </button>
                </div>

                <div className="p-4 space-y-2">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Rechercher une conversation"
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-pink-200 transaction-all"
                        />
                    </div>

                    {matches.map((match) => (
                        <div
                            key={match.username}
                            onClick={() => setCurrentMatch(match.username)}
                            className="bg-white p-4 rounded-2xl flex items-center space-x-4 shadow-sm active:scale-98 transition-transform cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 overflow-hidden flex items-center justify-center text-white font-bold text-lg relative">
                                {match.avatar ? (
                                    <img src={match.avatar} alt={match.username} className="w-full h-full object-cover" />
                                ) : (
                                    match.username[0]
                                )}
                                {/* Online Status Dot in List */}
                                <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${match.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-gray-900 truncate">{match.username}</h3>
                                    <span className="text-xs text-gray-500">{match.timestamp}</span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{match.lastMessage}</p>
                            </div>
                            {match.unreadCount ? (
                                <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-medium">{match.unreadCount}</span>
                                </div>
                            ) : null}
                        </div>
                    ))}

                    {matches.length === 0 && (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-8 h-8 text-pink-400" />
                            </div>
                            <p className="text-gray-500 mb-2">Aucune conversation.</p>
                            <button onClick={() => router.push('/discover')} className="text-pink-500 font-medium hover:underline">Trouver des amis</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Conversation View
    const activeMatch = matches.find(m => m.username === currentMatch);
    const isOnline = activeMatch?.isOnline || false;

    return (
        <div className="flex flex-col h-screen bg-gray-50 pb-20 md:pb-0">
            {isInCall && currentMatch && (
                <VideoCall
                    currentUser={currentUser}
                    targetUser={currentMatch}
                    onEndCall={() => setIsInCall(false)}
                    initialIsIncoming={isIncomingCall}
                />
            )}

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10 sticky top-0">
                <div className="flex items-center space-x-3">
                    <button onClick={() => setCurrentMatch(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold">
                            {currentMatch?.[0]}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-800">{currentMatch}</h2>
                        <p className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                            {isOnline ? 'En ligne' : 'Hors ligne'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => startCall(false)}
                        className="p-2 hover:bg-pink-50 rounded-full transition-colors text-pink-600"
                    >
                        <Phone className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => startCall(true)}
                        className="p-2 hover:bg-pink-50 rounded-full transition-colors text-pink-600"
                    >
                        <Video className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png')]">
                {messages.map((msg) => {
                    const isMe = msg.sender === currentUser;
                    return (
                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-sm ${isMe ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
                                <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/80' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 md:static">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center space-x-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrivez un message..."
                        className="flex-1 bg-gray-100 border-0 rounded-full px-6 py-3 focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all outline-none"
                    />
                    <button type="submit" disabled={!newMessage.trim()} className="p-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        <Send className="w-5 h-5 ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-pink-500">Chargement...</div>}>
            <ChatContent />
        </Suspense>
    );
}
