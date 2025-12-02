import React, { useState, useEffect } from 'react';
import { generateTTS } from '../services/geminiService';
import { Volume2, Star, Trophy, ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { PuzzleQuestion } from '../types';

// BİLSEM Style Visual Logic
// 1. Pattern: Sequence of shapes/colors
// 2. Encryption (Visual): Symbol mapping
// 3. Shadow/Silhouette Matching
const LEVELS: PuzzleQuestion[] = [
  {
    id: '1',
    type: 'pattern',
    questionText: "What comes next in the pattern?",
    questionImage: "🍎 🍌 🍎 🍌 ❓", 
    options: ["🍌", "🍎", "🍇", "🍊"],
    correctIndex: 1 // Apple
  },
  {
    id: '2',
    type: 'shadow',
    questionText: "Which one is the shadow of the lion?",
    questionImage: "🦁",
    options: ["🐱", "🐻", "⚫", "🦁"], // In a real app, '⚫' would be a silhouette image. Using emoji for concept.
    correctIndex: 3 // Matching itself for now as "find the same" for simplicity in this demo, or imagine options are shadows
  },
  {
    id: '3',
    type: 'encryption',
    questionText: "If Star is One, and Moon is Two. What is Star Moon?",
    questionImage: "⭐️ = 1 | 🌙 = 2 | ⭐️ 🌙 = ?",
    options: ["1 2", "2 1", "1 1", "2 2"],
    correctIndex: 0
  },
  {
    id: '4',
    type: 'pattern',
    questionText: "Find the odd one out.",
    questionImage: "🐶 🐶 🐱 🐶",
    options: ["🐶", "🐱", "🐭", "🐰"],
    correctIndex: 1
  }
];

export const LogicPuzzles: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const question = LEVELS[currentLevel];

  // Auto-play TTS when level changes
  useEffect(() => {
    playInstructions();
  }, [currentLevel]);

  const playInstructions = async () => {
      try {
        const audioBuffer = await generateTTS(question.questionText);
        const ctx = new AudioContext();
        const buffer = await ctx.decodeAudioData(audioBuffer);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      } catch (e) {
          console.error(e);
      }
  };

  const handleAnswer = (index: number) => {
    if (feedback) return; // Prevent double clicks

    if (index === question.correctIndex) {
        setFeedback('correct');
        // Play success sound (simulated)
        setTimeout(() => {
            setFeedback(null);
            if (currentLevel < LEVELS.length - 1) {
                setScore(score + 1);
                setCurrentLevel(currentLevel + 1);
            } else {
                setScore(score + 1);
                setShowWin(true);
            }
        }, 1500);
    } else {
        setFeedback('wrong');
        setTimeout(() => setFeedback(null), 1000);
    }
  };

  if (showWin) {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-yellow-100 p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/confetti.png')] opacity-20"></div>
              <Trophy size={160} className="text-yellow-500 mb-8 animate-bounce" fill="#FCD34D" />
              <h1 className="text-6xl font-black text-kid-purple mb-4 text-center">YOU WON!</h1>
              <div className="flex gap-2 mb-12">
                   {[...Array(3)].map((_, i) => <Star key={i} size={48} fill="#FCD34D" className="animate-spin-slow" />)}
              </div>
              <button onClick={onBack} className="bg-kid-green text-white text-3xl font-bold py-6 px-12 rounded-full shadow-xl border-b-8 border-green-700 active:translate-y-2 active:border-b-0 transition-all">
                  Play Again 🔄
              </button>
          </div>
      )
  }

  return (
    <div className="h-full flex flex-col p-4 bg-sky-50">
       <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="bg-white p-4 rounded-full shadow-lg border-4 border-gray-300 text-gray-500 active:scale-90">
           <ArrowLeft size={32} strokeWidth={3} />
        </button>
        <div className="flex gap-2 bg-white px-4 py-2 rounded-full shadow-sm border-2 border-gray-100">
            {[...Array(LEVELS.length)].map((_, i) => (
                <Star key={i} size={24} fill={i < currentLevel ? "#FCD34D" : "#E5E7EB"} stroke={i < currentLevel ? "#F59E0B" : "#9CA3AF"} />
            ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start gap-8 mt-4">
          
          {/* Question Card */}
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-2xl text-center border-b-8 border-r-8 border-kid-blue/20 shadow-xl relative transform hover:scale-[1.02] transition-transform">
              <button 
                onClick={playInstructions} 
                className="absolute top-4 right-4 bg-kid-yellow p-3 rounded-full shadow-md text-white hover:scale-110 active:scale-90 transition-transform"
              >
                  <Volume2 size={32} />
              </button>
              
              <div className="text-6xl md:text-8xl py-8 font-mono tracking-widest leading-relaxed">
                  {question.questionImage}
              </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-6 w-full max-w-2xl flex-1">
              {question.options.map((opt, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`
                        relative bg-white border-4 text-6xl rounded-3xl shadow-lg transition-all 
                        flex items-center justify-center
                        ${feedback === 'correct' && idx === question.correctIndex ? 'border-green-500 bg-green-50 scale-105' : ''}
                        ${feedback === 'wrong' && idx !== question.correctIndex ? 'opacity-50' : 'hover:scale-105 hover:border-kid-purple active:scale-95 border-gray-200'}
                    `}
                  >
                      {opt}
                      {feedback === 'correct' && idx === question.correctIndex && (
                          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-2xl">
                              <Check size={64} className="text-green-600 animate-bounce" strokeWidth={4} />
                          </div>
                      )}
                       {feedback === 'wrong' && idx !== question.correctIndex && ( // Currently clicking wrong doesn't highlight specifically, just fades
                           <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-2xl">
                               <X size={64} className="text-red-600" strokeWidth={4} />
                           </div>
                       )}
                  </button>
              ))}
          </div>

      </div>
    </div>
  );
};