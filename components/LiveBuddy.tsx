import React, { useEffect, useRef, useState } from 'react';
import { connectLiveSession } from '../services/geminiService';
import { createPcmBlob, decodeAudioData } from '../services/audioUtils';
import { Mic, Volume2, MicOff } from 'lucide-react';
import { LiveServerMessage } from '@google/genai';

export const LiveBuddy: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // User speaking
  const [aiSpeaking, setAiSpeaking] = useState(false); // AI speaking

  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  
  // Cleanup ref to ensure we stop tracks on unmount
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startSession = async () => {
    try {
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        inputCtxRef.current = inputCtx;
        outputCtxRef.current = outputCtx;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const sessionPromise = connectLiveSession({
            onOpen: () => {
                setIsConnected(true);
                // Setup Input Stream
                const source = inputCtx.createMediaStreamSource(stream);
                const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                
                processor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    // Simple VAD visualization
                    const volume = inputData.reduce((acc, val) => acc + Math.abs(val), 0) / inputData.length;
                    if (volume > 0.01) setIsSpeaking(true); else setIsSpeaking(false);

                    const pcmBlob = createPcmBlob(inputData);
                    sessionPromise.then(session => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };
                
                source.connect(processor);
                processor.connect(inputCtx.destination);
            },
            onMessage: async (msg: LiveServerMessage) => {
                 const data = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                 if (data) {
                     setAiSpeaking(true);
                     // Decode and schedule
                     const binary = atob(data);
                     const len = binary.length;
                     const bytes = new Uint8Array(len);
                     for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);

                     const audioBuffer = await decodeAudioData(bytes, outputCtx, 24000, 1);
                     
                     const source = outputCtx.createBufferSource();
                     source.buffer = audioBuffer;
                     source.connect(outputCtx.destination);
                     
                     const currentTime = outputCtx.currentTime;
                     const startTime = Math.max(nextStartTimeRef.current, currentTime);
                     source.start(startTime);
                     nextStartTimeRef.current = startTime + audioBuffer.duration;
                     
                     source.onended = () => {
                         if (outputCtx.currentTime >= nextStartTimeRef.current) {
                             setAiSpeaking(false);
                         }
                     };
                 }
            },
            onClose: () => setIsConnected(false),
            onError: (e) => console.error(e)
        });
        
        sessionRef.current = sessionPromise;

    } catch (err) {
        console.error("Failed to start live session", err);
        alert("Microphone permission needed!");
    }
  };

  const stopSession = () => {
      // Clean up audio contexts and tracks
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      inputCtxRef.current?.close();
      outputCtxRef.current?.close();
      // We can't strictly "close" the session via library easily without the resolved object, 
      // but cutting the stream effectively ends it for the client.
      setIsConnected(false);
      onBack();
  };

  useEffect(() => {
      // Start automatically on mount (requires interaction normally, but this component is entered via click)
      startSession();
      return () => {
           mediaStreamRef.current?.getTracks().forEach(track => track.stop());
           inputCtxRef.current?.close();
           outputCtxRef.current?.close();
      }
  }, []);

  return (
    <div className="h-full flex flex-col p-4 bg-gradient-to-b from-purple-900 to-indigo-900 text-white relative overflow-hidden">
      
       {/* Background Elements */}
       <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse-slow"></div>
       <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-500 rounded-full blur-xl opacity-30 animate-bounce-slow"></div>

      <div className="flex justify-between items-center z-10">
        <button onClick={stopSession} className="bg-white/20 hover:bg-white/40 p-3 rounded-full backdrop-blur-md border-2 border-white/50">
           ❌ Close
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center z-10 gap-8">
          
          <div className={`relative w-64 h-64 rounded-full flex items-center justify-center transition-all duration-300 ${aiSpeaking ? 'scale-110 shadow-[0_0_100px_rgba(139,92,246,0.6)]' : 'shadow-2xl'}`}>
             <div className="absolute inset-0 bg-gradient-to-tr from-kid-purple to-kid-pink rounded-full animate-spin-slow opacity-80"></div>
             <div className="absolute inset-2 bg-indigo-950 rounded-full flex items-center justify-center">
                 {/* Face */}
                 <div className="flex gap-4">
                     <div className={`w-8 h-12 bg-white rounded-full transition-all ${aiSpeaking ? 'h-8' : 'h-12'}`}></div>
                     <div className={`w-8 h-12 bg-white rounded-full transition-all ${aiSpeaking ? 'h-8' : 'h-12'}`}></div>
                 </div>
             </div>
          </div>

          <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-sans">Magic Friend</h2>
              <p className="text-xl opacity-80">{isConnected ? (aiSpeaking ? "Listening..." : "I'm listening...") : "Connecting..."}</p>
          </div>

          <div className={`p-6 rounded-full transition-colors ${isSpeaking ? 'bg-green-500 shadow-[0_0_50px_rgba(34,197,94,0.6)]' : 'bg-white/10'}`}>
              {isSpeaking ? <Mic size={48} className="text-white"/> : <MicOff size={48} className="text-white/50"/>}
          </div>

      </div>
    </div>
  );
};
