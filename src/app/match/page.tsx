'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoveNotification from '@/components/LoveNotification';
import { Heart, Sparkles, Target, Star, MessageCircle, Share2 } from 'lucide-react';

interface MatchData {
  matchName: string;
  compatibility: number;
  message: string;
  sharedInterests: string[];
}

function MatchContent() {
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [showNotification, setShowNotification] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchMatchData = async () => {
      const savedUsername = localStorage.getItem('cupid_username');
      if (!savedUsername) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch(`/api/match/check?username=${encodeURIComponent(savedUsername)}`);
        const data = await response.json();

        if (data.success && data.matchFound) {
          setMatchData({
            matchName: data.matchName,
            compatibility: data.compatibility || 85,
            message: data.message || "Vous avez un match !",
            sharedInterests: data.sharedInterests && data.sharedInterests.length > 0
              ? data.sharedInterests
              : ["Mystère..."]
          });
        }
      } catch (error) {
        console.error('Error fetching match data:', error);
      }
    };

    fetchMatchData();
  }, [router]);

  if (!matchData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-bounce mb-4">
            <Heart className="w-16 h-16 text-pink-500 fill-pink-500 mx-auto" />
          </div>
          <p className="text-rose-700 text-xl">Cupidon prépare la rencontre...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {showNotification && (
        <LoveNotification
          matchName={matchData.matchName}
          compatibility={matchData.compatibility}
          onClose={() => setShowNotification(false)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-dancing font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600 mb-6">
            ❤️ Félicitations ! ❤️
          </h1>
          <p className="text-2xl text-rose-800 font-light">
            {matchData.message}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-pink-50 rounded-3xl p-8 md:p-12 shadow-2xl mb-12 border border-pink-200">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="w-8 h-8 text-pink-600" />
                  <h2 className="text-3xl font-bold text-rose-900">
                    Votre compatibilité
                  </h2>
                </div>

                <div className="relative">
                  <div className="text-center">
                    <div className="inline-block relative">
                      <div className="w-48 h-48 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center">
                        <span className="text-5xl font-bold text-white">
                          {matchData.compatibility}%
                        </span>
                      </div>
                      <div className="absolute -top-4 -right-4">
                        <Sparkles className="w-10 h-10 text-yellow-400 animate-spin-slow" />
                      </div>
                    </div>
                    <p className="mt-6 text-lg text-rose-700">
                      Score exceptionnel ! Cupidon a visé juste.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-rose-800 mb-6 flex items-center">
                  <Star className="w-6 h-6 text-pink-500 mr-3" />
                  Vos points communs
                </h3>
                <div className="space-y-3">
                  {matchData.sharedInterests.map((interest, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 bg-white/50 p-4 rounded-xl"
                    >
                      <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                      <span className="text-rose-800">{interest}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl p-8">
                <h3 className="text-2xl font-semibold text-rose-800 mb-6">
                  Message de Cupidon
                </h3>
                <div className="space-y-4">
                  <p className="text-rose-700 text-lg leading-relaxed">
                    Parfois, l&apos;amour frappe quand on s&apos;y attend le moins.
                    <span className="font-bold text-pink-600"> {matchData.matchName} </span>
                    et toi partagez une connexion rare que peu de personnes expérimentent.
                  </p>
                  <p className="text-rose-700 text-lg leading-relaxed">
                    Vos réponses révèlent une harmonie naturelle et des valeurs alignées.
                    L&apos;aventure ne fait que commencer...
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-4 rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-3">
                  <MessageCircle className="w-6 h-6" />
                  <span>Envoyer un message à {matchData.matchName}</span>
                </button>
                <button className="w-full bg-white text-rose-600 font-bold py-4 rounded-xl border-2 border-pink-300 hover:bg-pink-50 transition-all flex items-center justify-center space-x-3">
                  <Share2 className="w-6 h-6" />
                  <span>Partager cette bonne nouvelle</span>
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full text-rose-600 font-medium py-3 rounded-xl hover:text-rose-800 transition-colors"
                >
                  Retour à l'accueil
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-block bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-pink-200">
            <p className="text-2xl text-rose-900 font-dancing italic">
              &quot;Le plus grand bonheur que vous puissiez donner à quelqu&apos;un,
              c&apos;est de lui faire rencontrer son âme sœur.&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MatchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-bounce mb-4">
            <Heart className="w-16 h-16 text-pink-500 fill-pink-500 mx-auto" />
          </div>
          <p className="text-rose-700 text-xl">Chargement...</p>
        </div>
      </div>
    }>
      <MatchContent />
    </Suspense>
  );
}