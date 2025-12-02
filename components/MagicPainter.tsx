import React, { useRef, useState, useEffect } from 'react';
import { editImageWithFlash } from '../services/geminiService';
import { Wand2, RefreshCcw, Eraser, ArrowLeft, Download, Bot } from 'lucide-react';

const MAGIC_PROMPTS = [
    { icon: '🎩', prompt: 'Add a funny hat', color: 'bg-orange-400' },
    { icon: '❄️', prompt: 'Make it snowy winter', color: 'bg-blue-400' },
    { icon: '🐱', prompt: 'Add a cute cat', color: 'bg-yellow-400' },
    { icon: '🌈', prompt: 'Add a rainbow', color: 'bg-pink-400' },
];

export const MagicPainter: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
        e.preventDefault(); // Prevent scrolling
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleAIEdit = async (prompt: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setLoading(true);
    try {
       const base64 = canvas.toDataURL('image/png').split(',')[1];
       const result = await editImageWithFlash(base64, prompt);
       setGeneratedImage(result);
    } catch (e) {
        console.error(e);
        alert("Magic failed! Try again.");
    } finally {
        setLoading(false);
    }
  };

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      if(canvas) {
          const ctx = canvas.getContext('2d');
          if(ctx) {
             ctx.fillStyle = '#ffffff';
             ctx.fillRect(0,0, canvas.width, canvas.height);
             setGeneratedImage(null);
          }
      }
  }

  const magicSketch = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Draw a simple house
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const w = canvas.width;
      const h = canvas.height;
      const cx = w/2;
      const cy = h/2;

      ctx.lineWidth = 10;
      ctx.strokeStyle = '#000000';
      ctx.lineJoin = 'round';
      
      // Box
      ctx.strokeRect(cx - 100, cy - 50, 200, 200);
      
      // Roof
      ctx.beginPath();
      ctx.moveTo(cx - 120, cy - 50);
      ctx.lineTo(cx, cy - 150);
      ctx.lineTo(cx + 120, cy - 50);
      ctx.closePath();
      ctx.stroke();

      // Door
      ctx.strokeRect(cx - 30, cy + 50, 60, 100);
      
      // Sun
      ctx.strokeStyle = '#FCD34D';
      ctx.fillStyle = '#FCD34D';
      ctx.beginPath();
      ctx.arc(w - 80, 80, 40, 0, Math.PI * 2);
      ctx.fill();
  }

  return (
    <div className="h-full flex flex-col p-4 gap-4 bg-sky-50">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="bg-white p-4 rounded-full shadow-lg border-4 border-kid-blue text-kid-blue active:scale-90 transition-transform">
           <ArrowLeft size={40} strokeWidth={3} />
        </button>
        <div className="text-4xl animate-bounce-slow">🎨</div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden relative">
        {/* Toolbar */}
        <div className="flex md:flex-col gap-3 bg-white p-3 rounded-3xl shadow-xl justify-center items-center border-4 border-kid-purple/20">
            {/* Colors */}
            <div className="flex md:flex-col gap-2">
                {['#000000', '#EF4444', '#10B981', '#3B82F6', '#FCD34D'].map(c => (
                    <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-12 h-12 rounded-full border-4 ${color === c ? 'border-gray-800 scale-110' : 'border-transparent'} shadow-sm`}
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>
            
            <div className="w-full h-1 bg-gray-200 rounded-full my-2"></div>

             {/* Tools */}
             <div className="flex gap-4 md:flex-col items-center">
                <button onClick={() => setBrushSize(10)} className={`p-2 rounded-full ${brushSize===10 ? 'bg-kid-yellow ring-4 ring-kid-yellow/50' : 'bg-gray-100'}`}><div className="w-3 h-3 bg-black rounded-full"/></button>
                <button onClick={() => setBrushSize(25)} className={`p-2 rounded-full ${brushSize===25 ? 'bg-kid-yellow ring-4 ring-kid-yellow/50' : 'bg-gray-100'}`}><div className="w-6 h-6 bg-black rounded-full"/></button>
                
                <button onClick={() => {setColor('#ffffff'); setBrushSize(40);}} className={`p-3 rounded-full ${color==='#ffffff' ? 'bg-kid-red text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Eraser size={28} />
                </button>
                <button onClick={clearCanvas} className="p-3 bg-red-100 rounded-full text-red-500 hover:bg-red-200">
                    <RefreshCcw size={28} />
                </button>
                <button onClick={magicSketch} className="p-3 bg-blue-100 rounded-full text-blue-500 hover:bg-blue-200" title="Auto Draw (for Demo)">
                    <Bot size={28} />
                </button>
             </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-white rounded-3xl shadow-2xl border-8 border-kid-yellow overflow-hidden touch-none">
            {generatedImage ? (
                <div className="relative w-full h-full flex items-center justify-center bg-checkered">
                    <img src={generatedImage} alt="Magic Result" className="max-w-full max-h-full object-contain" />
                    <button 
                        onClick={() => setGeneratedImage(null)}
                        className="absolute bottom-4 right-4 bg-kid-blue text-white p-4 rounded-full font-bold shadow-xl border-4 border-white text-2xl animate-pulse"
                    >
                        🔄 Draw Again
                    </button>
                </div>
            ) : (
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                    className="w-full h-full cursor-round"
                    style={{ touchAction: 'none' }}
                />
            )}
            
            {loading && (
                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                    <Wand2 className="w-24 h-24 text-kid-purple animate-spin-slow mb-4" />
                    <p className="text-3xl font-bold text-kid-purple animate-bounce">Magic...</p>
                </div>
            )}
        </div>

        {/* AI Actions - Icon Only for Kids */}
        <div className="flex md:flex-col gap-3 justify-center">
            {MAGIC_PROMPTS.map((item) => (
                <button
                    key={item.prompt}
                    onClick={() => handleAIEdit(item.prompt)}
                    disabled={loading || !!generatedImage}
                    className={`${item.color} w-20 h-20 rounded-2xl shadow-lg hover:scale-110 active:scale-90 transition-all flex items-center justify-center text-4xl border-b-8 border-black/20 disabled:opacity-50 disabled:grayscale`}
                    title={item.prompt}
                >
                    {item.icon}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};