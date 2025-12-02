import React, { useState } from 'react';
import { generateVeoVideo } from '../services/geminiService';
import { Video, Upload, Play, Loader2, ArrowLeft, Clapperboard, Sparkles, Film, Download, Star, Zap, Flag } from 'lucide-react';

export const VeoStudio: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setVideoUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;
    setLoading(true);
    try {
        const base64 = selectedImage.split(',')[1];
        const url = await generateVeoVideo(base64);
        setVideoUrl(url);
    } catch (e) {
        console.error(e);
        alert("Oops! Magic failed.");
    } finally {
        setLoading(false);
    }
  };

  const handleSceneGenerate = async (scene: 'intro' | 'action' | 'finale') => {
      setLoading(true);
      setVideoUrl(null);
      setSelectedImage(null);
      
      let prompt = "";
      if (scene === 'intro') prompt = "Cinematic title shot of a magical floating island kingdom named WonderWorld, bright blue sky, disney style 3d render.";
      if (scene === 'action') prompt = "A cute robot racing a fast red car on a toy track, sparks flying, high speed, dynamic camera angle, 3d render.";
      if (scene === 'finale') prompt = "Fireworks exploding over a castle at night, cute animals dancing, happy ending, 3d render.";

      try {
          const url = await generateVeoVideo(null, prompt);
          setVideoUrl(url);
      } catch (e) {
          console.error(e);
          alert("Scene generation failed!");
      } finally {
          setLoading(false);
      }
  }

  const handleDownload = () => {
      if (videoUrl) {
          const a = document.createElement('a');
          a.href = videoUrl;
          a.download = `WonderWorld_Clip_${Date.now()}.mp4`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
      }
  };

  return (
    <div className="h-full flex flex-col p-4 bg-orange-50">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="bg-white p-4 rounded-full shadow-lg border-4 border-kid-red text-kid-red active:scale-90 transition-transform">
           <ArrowLeft size={40} strokeWidth={3} />
        </button>
        <div className="bg-kid-red text-white p-3 rounded-2xl shadow-lg flex items-center gap-2">
            <Clapperboard size={32} />
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[3rem] shadow-2xl p-6 border-8 border-kid-red flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* State 1: No Image - Big Upload Button or Trailer Button */}
        {!selectedImage && !videoUrl && !loading && (
             <div className="flex flex-col gap-6 items-center w-full max-w-2xl">
                 <div className="grid grid-cols-2 gap-8 w-full justify-items-center">
                    <label className="group relative w-full aspect-square max-w-[200px] bg-kid-red/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer border-4 border-dashed border-kid-red/30 hover:bg-kid-red/20 hover:scale-105 transition-all">
                        <div className="bg-kid-red text-white p-4 rounded-full mb-2 shadow-xl group-hover:rotate-12 transition-transform">
                            <Upload size={32} strokeWidth={3}/>
                        </div>
                        <span className="text-xl font-bold text-kid-red/50">My Photo</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>

                    <button 
                        onClick={() => handleSceneGenerate('intro')}
                        className="group w-full aspect-square max-w-[200px] bg-kid-yellow/10 rounded-[2rem] flex flex-col items-center justify-center border-4 border-kid-yellow/30 hover:bg-kid-yellow/20 hover:scale-105 transition-all"
                    >
                        <div className="bg-kid-yellow text-white p-4 rounded-full mb-2 shadow-xl group-hover:rotate-12 transition-transform">
                            <Star size={32} strokeWidth={3}/>
                        </div>
                        <span className="text-xl font-bold text-yellow-600/50">Intro Scene</span>
                    </button>
                 </div>

                 <div className="w-full h-1 bg-gray-100 rounded-full"></div>

                 <div className="flex gap-4 w-full">
                    <button onClick={() => handleSceneGenerate('action')} className="flex-1 bg-blue-50 p-4 rounded-2xl border-4 border-blue-100 text-blue-400 font-bold hover:bg-blue-100 active:scale-95 transition-all flex flex-col items-center gap-2">
                        <Zap size={24} /> Action Scene
                    </button>
                    <button onClick={() => handleSceneGenerate('finale')} className="flex-1 bg-purple-50 p-4 rounded-2xl border-4 border-purple-100 text-purple-400 font-bold hover:bg-purple-100 active:scale-95 transition-all flex flex-col items-center gap-2">
                        <Flag size={24} /> Finale Scene
                    </button>
                 </div>
             </div>
        )}

        {/* State 2: Image Selected - Show Preview and Animate Button */}
        {selectedImage && !videoUrl && !loading && (
             <div className="flex flex-col items-center w-full h-full justify-center gap-8">
                <div className="relative">
                    <img src={selectedImage} alt="Selected" className="max-h-[50vh] object-contain rounded-3xl shadow-xl border-4 border-gray-200" />
                    <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-4 -right-4 bg-red-500 text-white p-3 rounded-full shadow-lg hover:scale-110"
                    >
                        ❌
                    </button>
                </div>
                
                <button 
                    onClick={handleGenerate}
                    className="bg-gradient-to-r from-kid-red to-orange-500 text-white p-8 rounded-full shadow-[0_10px_0_rgb(153,27,27)] active:shadow-none active:translate-y-[10px] transition-all flex items-center gap-4 hover:scale-105"
                >
                    <Play size={48} fill="currentColor" />
                    <span className="text-3xl font-black tracking-wider">ACTION!</span>
                </button>
             </div>
        )}

        {/* State 3: Loading - Fun Animation */}
        {loading && (
            <div className="flex flex-col items-center text-center">
                 <div className="relative">
                     <div className="absolute inset-0 bg-yellow-300 rounded-full blur-xl animate-pulse"></div>
                     <Video className="w-32 h-32 text-kid-red relative z-10 animate-bounce" />
                 </div>
                 <div className="mt-8 flex gap-2">
                     <div className="w-6 h-6 bg-kid-blue rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                     <div className="w-6 h-6 bg-kid-green rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                     <div className="w-6 h-6 bg-kid-yellow rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                 </div>
                 <p className="mt-4 text-2xl font-bold text-kid-red animate-pulse">Making Movie...</p>
            </div>
        )}

        {/* State 4: Result - Video Player */}
        {videoUrl && (
             <div className="flex flex-col items-center w-full h-full justify-center">
                <div className="relative bg-black rounded-3xl p-2 shadow-2xl mb-6 border-4 border-gray-200">
                    <video src={videoUrl} controls autoPlay loop className="max-h-[50vh] rounded-2xl" />
                    <Sparkles className="absolute -top-6 -left-6 text-yellow-400 w-16 h-16 animate-spin-slow" />
                </div>
                
                <div className="flex flex-wrap gap-4 justify-center">
                    <button 
                        onClick={handleDownload}
                        className="bg-kid-green text-white text-xl font-bold py-4 px-8 rounded-full shadow-lg border-4 border-white hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        <Download size={28} /> Save Video
                    </button>

                    <button 
                        onClick={() => { setSelectedImage(null); setVideoUrl(null); }}
                        className="bg-kid-blue text-white text-xl font-bold py-4 px-8 rounded-full shadow-lg border-4 border-white hover:scale-105 transition-transform"
                    >
                        🎬 Make Another
                    </button>
                </div>
             </div>
        )}
      </div>
    </div>
  );
};