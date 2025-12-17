'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const savedUsername = localStorage.getItem('cupid_username');
    if (!savedUsername) {
      router.push('/login');
    }
    // If logged in, we stay here (Dashboard) or could redirect to /questions if not done
  }, [router]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/questions');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-12">
        <div className="text-center space-y-6">
          <div className="flex justify-center items-center space-x-4">
            <Heart className="w-16 h-16 text-pink-500 heart-beat fill-pink-500" />
            <h1 className="text-6xl md:text-7xl font-dancing font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600">
              Cupidon
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-rose-700 font-light">
            Laisse la flèche de l&apos;amour trouver ton âme sœur
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl glow border border-pink-200">
          <div className="space-y-6">
            <div className="bg-white/50 p-6 rounded-2xl border border-pink-100">
              <h2 className="text-2xl font-semibold text-rose-800 mb-2">Prêt à trouver l&apos;amour ?</h2>
              <p className="text-gray-600 mb-6">Réponds au questionnaire psychologique pour trouver ta moitié.</p>

              <button
                onClick={() => router.push('/questions')}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold py-4 px-8 rounded-2xl hover:from-pink-600 hover:to-rose-700 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-3 shadow-lg"
              >
                <span className="text-xl">Commencer le test</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/profile')}
                className="p-4 bg-white/60 hover:bg-white rounded-2xl transition-all text-center border border-pink-100"
              >
                <span className="block font-semibold text-rose-700">Mon Profil</span>
              </button>
              <button
                onClick={() => router.push('/chat')}
                className="p-4 bg-white/60 hover:bg-white rounded-2xl transition-all text-center border border-pink-100"
              >
                <span className="block font-semibold text-rose-700">Mes Messages</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 p-6 rounded-2xl text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-pink-600 font-bold text-xl">1</span>
            </div>
            <h3 className="font-semibold text-rose-800 mb-2">Réponds aux questions</h3>
            <p className="text-rose-600 text-sm">Partage ta personnalité</p>
          </div>

          <div className="bg-white/60 p-6 rounded-2xl text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-pink-600 font-bold text-xl">2</span>
            </div>
            <h3 className="font-semibold text-rose-800 mb-2">L&apos;algorithme magique</h3>
            <p className="text-rose-600 text-sm">Cupidon cherche ton match</p>
          </div>

          <div className="bg-white/60 p-6 rounded-2xl text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-pink-600 font-bold text-xl">3</span>
            </div>
            <h3 className="font-semibold text-rose-800 mb-2">Rencontre ton âme sœur</h3>
            <p className="text-rose-600 text-sm">Notification bruyante !</p>
          </div>
        </div>
      </div>
    </div>
  );
}