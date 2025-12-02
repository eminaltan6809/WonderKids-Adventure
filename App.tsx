import React, { useState } from 'react';
import { GameScreen, Character } from './types';
import { VeoStudio } from './components/VeoStudio';
import { MagicPainter } from './components/MagicPainter';
import { LiveBuddy } from './components/LiveBuddy';
import { LogicPuzzles } from './components/LogicPuzzles';
import { Play, Palette, Video, Mic, Puzzle, User, Map as MapIcon } from 'lucide-react';

const CHARACTERS: Character[] = [
    { id: '1', name: 'Explorer', avatar: '🤠', color: 'bg-orange-400' },
    { id: '2', name: 'Robot', avatar: '🤖', color: 'bg-blue-400' },
    { id: '3', name: 'Fairy', avatar: '🧚', color: 'bg-pink-400' },
    { id: '4', name: 'Lion', avatar: '🦁', color: 'bg-yellow-500' },
];

const App: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>(GameScreen.HOME);
  const [character, setCharacter] = useState<Character | null>(null);

  const navigate = (s: GameScreen) => setScreen(s);

  // --- SCREENS ---

  if (screen === GameScreen.HOME) {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-sky-300 to-sky-100 relative overflow-hidden">
              {/* Background Clouds */}
              <div className="absolute top-10 left-10 text-[10rem] opacity-20 animate-pulse-slow">☁️</div>
              <div className="absolute bottom-20 right-10 text-[8rem] opacity-20 animate-bounce-slow">☁️</div>
              
              <div className="z-10 text-center flex flex-col items-center gap-12">
                  <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-[0_8px_0_rgba(0,0,0,0.2)] tracking-wider transform -rotate-6">
                      Wonder<br/>World
                  </h1>
                  
                  <button 
                    onClick={() => navigate(GameScreen.CHARACTER_SELECT)}
                    className="group relative"
                  >
                      <div className="absolute inset-0 bg-green-600 rounded-full translate-y-4 group-active:translate-y-0 transition-transform"></div>
                      <div className="relative bg-kid-green hover:bg-green-400 text-white w-48 h-48 rounded-full flex items-center justify-center border-8 border-white shadow-2xl group-active:translate-y-4 transition-transform">
                          <Play size={80} fill="currentColor" className="ml-2" />
                      </div>
                  </button>
              </div>
          </div>
      )
  }

  if (screen === GameScreen.CHARACTER_SELECT) {
      return (
          <div className="h-full flex flex-col items-center bg-sky-100 p-6">
              <h2 className="text-4xl font-black text-kid-blue mb-8 mt-4 bg-white px-8 py-4 rounded-full shadow-lg transform -rotate-2">
                  Who are you?
              </h2>
              <div className="grid grid-cols-2 gap-6 w-full max-w-md flex-1 content-center">
                  {CHARACTERS.map(char => (
                      <button
                        key={char.id}
                        onClick={() => { setCharacter(char); navigate(GameScreen.MAP); }}
                        className={`${char.color} aspect-square rounded-[2rem] flex flex-col items-center justify-center shadow-[0_10px_0_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95 active:shadow-none active:translate-y-[10px] transition-all border-8 border-white/50`}
                      >
                          <span className="text-[5rem] drop-shadow-md">{char.avatar}</span>
                      </button>
                  ))}
              </div>
          </div>
      )
  }

  // Common Layout for Map
  if (screen === GameScreen.MAP) {
      return (
          <div className="h-full bg-[#8bc34a] relative overflow-hidden font-sans">
              {/* Ground Pattern */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-100 via-transparent to-transparent" style={{backgroundSize: '50px 50px'}}></div>
              
              {/* Avatar Badge */}
              <div className="absolute top-6 left-6 z-20">
                   <button onClick={() => navigate(GameScreen.CHARACTER_SELECT)} className="bg-white p-2 rounded-full border-4 border-kid-blue shadow-lg hover:scale-110 transition-transform">
                        <span className="text-4xl">{character?.avatar}</span>
                   </button>
              </div>

              {/* Path / River */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex: 0}}>
                   <path d="M -100 200 C 200 100, 600 300, 1200 100" stroke="#4ade80" strokeWidth="120" fill="none" className="opacity-50" />
                   <path d="M -100 600 C 300 500, 500 800, 1200 500" stroke="#a3e635" strokeWidth="150" fill="none" className="opacity-40" />
              </svg>

              <div className="absolute inset-0 flex flex-wrap items-center justify-center content-center gap-6 md:gap-12 p-4">
                  
                  {/* Veo Studio - Red Cinema */}
                  <button onClick={() => navigate(GameScreen.VEO_STUDIO)} className="group relative w-40 h-40 md:w-48 md:h-48">
                      <div className="absolute inset-0 bg-red-700 rounded-[2rem] translate-y-3 group-active:translate-y-0 transition-transform"></div>
                      <div className="relative w-full h-full bg-kid-red rounded-[2rem] border-4 border-white flex items-center justify-center shadow-xl group-active:translate-y-3 transition-transform">
                          <Video size={64} className="text-white drop-shadow-md" />
                      </div>
                  </button>

                  {/* Magic Painter - Purple Art */}
                  <button onClick={() => navigate(GameScreen.MAGIC_PAINTER)} className="group relative w-40 h-40 md:w-48 md:h-48">
                      <div className="absolute inset-0 bg-purple-700 rounded-[2rem] translate-y-3 group-active:translate-y-0 transition-transform"></div>
                      <div className="relative w-full h-full bg-kid-purple rounded-[2rem] border-4 border-white flex items-center justify-center shadow-xl group-active:translate-y-3 transition-transform">
                          <Palette size={64} className="text-white drop-shadow-md" />
                      </div>
                  </button>

                   {/* Live Buddy - Blue Talk */}
                   <button onClick={() => navigate(GameScreen.LIVE_TALK)} className="group relative w-40 h-40 md:w-48 md:h-48 animate-pulse-slow">
                      <div className="absolute inset-0 bg-blue-700 rounded-[2rem] translate-y-3 group-active:translate-y-0 transition-transform"></div>
                      <div className="relative w-full h-full bg-kid-blue rounded-[2rem] border-4 border-white flex items-center justify-center shadow-xl group-active:translate-y-3 transition-transform">
                          <div className="absolute -top-4 -right-4 text-4xl">✨</div>
                          <Mic size={64} className="text-white drop-shadow-md" />
                      </div>
                  </button>

                   {/* Logic Puzzles - Yellow Brain */}
                   <button onClick={() => navigate(GameScreen.LOGIC_PUZZLES)} className="group relative w-40 h-40 md:w-48 md:h-48">
                      <div className="absolute inset-0 bg-yellow-600 rounded-[2rem] translate-y-3 group-active:translate-y-0 transition-transform"></div>
                      <div className="relative w-full h-full bg-kid-yellow rounded-[2rem] border-4 border-white flex items-center justify-center shadow-xl group-active:translate-y-3 transition-transform">
                          <Puzzle size={64} className="text-white drop-shadow-md" />
                      </div>
                  </button>

              </div>
          </div>
      );
  }

  // --- SUB SCREENS ---
  
  if (screen === GameScreen.VEO_STUDIO) {
      return <VeoStudio onBack={() => navigate(GameScreen.MAP)} />;
  }

  if (screen === GameScreen.MAGIC_PAINTER) {
      return <MagicPainter onBack={() => navigate(GameScreen.MAP)} />;
  }

  if (screen === GameScreen.LIVE_TALK) {
      return <LiveBuddy onBack={() => navigate(GameScreen.MAP)} />;
  }

  if (screen === GameScreen.LOGIC_PUZZLES) {
      return <LogicPuzzles onBack={() => navigate(GameScreen.MAP)} />;
  }

  return <div>Loading...</div>;
};

export default App;