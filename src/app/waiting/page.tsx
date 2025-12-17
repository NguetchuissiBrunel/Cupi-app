'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingHearts from '@/components/LoadingHearts';
import { Heart, Search, Clock, Users } from 'lucide-react';

export default function WaitingPage() {
  const [username, setUsername] = useState('');
  const [checkCount, setCheckCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const savedUsername = localStorage.getItem('cupid_username');
    if (!savedUsername) {
      router.push('/');
      return;
    }
    setUsername(savedUsername);

    // Poll for match
    const interval = setInterval(async () => {
      setCheckCount(prev => prev + 1);

      try {
        const response = await fetch(`/api/match/check?username=${encodeURIComponent(savedUsername)}`);
        const data = await response.json();

        if (data.success && data.matchFound) {
          router.push(`/match?matchId=${data.matchId}&username=${encodeURIComponent(savedUsername)}`);
        }
      } catch (error) {
        console.error('Error checking match:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-12">
        <div className="text-center space-y-6">
          <div className="relative">
            <Heart className="w-24 h-24 text-pink-500 mx-auto heart-beat fill-pink-500" />
            <div className="absolute inset-0 animate-ping">
              <Heart className="w-24 h-24 text-pink-500 opacity-50" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-dancing font-bold text-rose-800">
            Patience, {username}...
          </h1>

          <p className="text-xl text-rose-600">
            Cupidon cherche ton âme sœur parmi les cœurs disponibles
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-pink-200">
          <div className="space-y-8">
            <div className="flex items-center justify-center space-x-4">
              <LoadingHearts size="lg" />
              <span className="text-2xl text-rose-700 font-semibold">
                Recherche en cours...
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-pink-50/50 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="font-semibold text-rose-800 mb-2">Scan des profils</h3>
                <p className="text-rose-600 text-sm">
                  Analyse des compatibilités
                </p>
              </div>

              <div className="text-center p-6 bg-pink-50/50 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="font-semibold text-rose-800 mb-2">12 cœurs disponibles</h3>
                <p className="text-rose-600 text-sm">
                  Personnes en attente de match
                </p>
              </div>

              <div className="text-center p-6 bg-pink-50/50 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="font-semibold text-rose-800 mb-2">{checkCount} vérifications</h3>
                <p className="text-rose-600 text-sm">
                  Prochaine vérification dans 3s
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-pink-200">
              <div className="max-w-md mx-auto">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200">
                        Progression
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-pink-600">
                        {Math.min(100, checkCount * 25)}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-pink-100">
                    <div
                      style={{ width: `${Math.min(100, checkCount * 25)}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-rose-600 italic">
            &quot;Les plus belles rencontres sont celles qu&apos;on ne force pas...&quot;
          </p>
        </div>
      </div>
    </div>
  );
}