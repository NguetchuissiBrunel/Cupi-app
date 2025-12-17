'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuestionCard from '@/components/QuestionCard';
import LoadingHearts from '@/components/LoadingHearts';
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react';

const QUESTIONS = [
  {
    id: 1,
    question: "Ton niveau d'énergie sociale ?",
    options: [
      "100% Casanier (Netflix & Chill)",
      "Plutôt calme (Dîner intime)",
      "Équilibré (Sorties régulières)",
      "Très sociable (Toujours dehors)",
      "Fêtard invétéré (La nuit m'appartient)"
    ]
  },
  {
    id: 2,
    question: "Ta vision du week-end parfait ?",
    options: [
      "Détente absolue et grasse mat'",
      "Balade tranquille et lecture",
      "Activités culturelles et découvertes",
      "Sport et aventure en plein air",
      "Adrénaline et sensations fortes"
    ]
  },
  {
    id: 3,
    question: "Ta priorité actuelle ?",
    options: [
      "Stabilité et confort avant tout",
      "Fonder une famille rapidement",
      "Équilibre vie pro / vie perso",
      "Explorer et voyager",
      "Carrière et ambition démesurée"
    ]
  },
  {
    id: 4,
    question: "Comment gères-tu les dépenses ?",
    options: [
      "Très économe (Écureuil)",
      "Raisonnable et réfléchi",
      "Équilibré (Plaisirs calculés)",
      "Généreux (J'aime faire plaisir)",
      "Dépensier (On ne vit qu'une fois)"
    ]
  },
  {
    id: 5,
    question: "Ton style de communication ?",
    options: [
      "Réservé (J'observe beaucoup)",
      "Doux et diplomate",
      "Direct et honnête",
      "Expressif et émotif",
      "Bavard et sans filtre"
    ]
  }
];

export default function QuestionsPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const savedUsername = localStorage.getItem('cupid_username');
    if (!savedUsername) {
      router.push('/');
    } else {
      setUsername(savedUsername);
    }
  }, [router]);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.length !== QUESTIONS.length || answers.some(a => a === undefined)) {
      alert('Veuillez répondre à toutes les questions !');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          answers,
          questions: QUESTIONS.map(q => q.question)
        }),
      });

      const data = await response.json();

      if (data.matchFound) {
        router.push(`/match?matchId=${data.matchId}`);
      } else {
        router.push('/waiting');
      }
    } catch (error) {
      console.error('Error:', error);
      router.push('/waiting');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-rose-600 hover:text-rose-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-semibold text-rose-800">
                Salut, {username} ! ✨
              </h2>
              <span className="text-pink-600 font-medium">
                {currentQuestion + 1}/{QUESTIONS.length}
              </span>
            </div>
            <div className="h-3 bg-pink-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <QuestionCard
          question={QUESTIONS[currentQuestion]}
          selectedAnswer={answers[currentQuestion]}
          onSelect={handleAnswer}
          questionNumber={currentQuestion + 1}
        />

        <div className="mt-12 flex justify-between items-center">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-white/80 border border-pink-300 text-pink-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Précédent</span>
          </button>

          {currentQuestion === QUESTIONS.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-3 px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold hover:from-pink-600 hover:to-rose-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingHearts size="sm" />
                  <span>Recherche de l'âme sœur...</span>
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 fill-white" />
                  <span>Trouver mon âme sœur !</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              disabled={answers[currentQuestion] === undefined}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-rose-700 transition-all"
            >
              <span>Suivant</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="mt-12 flex justify-center space-x-3">
          {QUESTIONS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentQuestion
                  ? 'bg-rose-500 scale-125'
                  : answers[index] !== undefined
                    ? 'bg-pink-400'
                    : 'bg-pink-200'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}