import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { base64ToUint8Array } from "./audioUtils";

// --- VEO (Video Generation) ---
export const generateVeoVideo = async (
  imageB64: string | null,
  prompt: string = "Make this image come to life, magical and fun"
): Promise<string> => {
  // 1. Check/Request API Key for Veo
  // Fix: Cast window to any to access aistudio without global type augmentation which might conflict
  const win = window as any;
  if (win.aistudio) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await win.aistudio.openSelectKey();
    }
  }

  // 2. Init AI with fresh key environment
  // Always use process.env.API_KEY directly as per platform rules
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // 3. Prepare Payload
  const payload: any = {
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  };

  // Only add image if provided (supports Text-to-Video now)
  if (imageB64) {
    payload.image = {
      imageBytes: imageB64,
      mimeType: 'image/png',
    };
  }

  // 4. Start Operation
  let operation = await ai.models.generateVideos(payload);

  // 5. Poll
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  // 6. Get Result
  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed to return a URI");
  
  // 7. Fetch actual bytes
  const fetchUrl = `${videoUri}&key=${process.env.API_KEY}`;
  const vidResponse = await fetch(fetchUrl);
  const vidBlob = await vidResponse.blob();
  return URL.createObjectURL(vidBlob);
};

// --- FLASH IMAGE (Image Editing) ---
export const editImageWithFlash = async (
  originalImageB64: string,
  prompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: originalImageB64,
            mimeType: 'image/png',
          },
        },
        { text: prompt },
      ],
    },
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image returned from editing");
};

// --- TTS (Text to Speech) ---
export const generateTTS = async (text: string): Promise<ArrayBuffer> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, // Friendly voice
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");
  
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// --- LIVE API Connect Helper ---
export const connectLiveSession = async (
    callbacks: {
        onOpen: () => void,
        onMessage: (msg: LiveServerMessage) => void,
        onClose: (e: CloseEvent) => void,
        onError: (e: ErrorEvent) => void
    }
) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: callbacks.onOpen,
            onmessage: callbacks.onMessage,
            onclose: callbacks.onClose,
            onerror: callbacks.onError
        },
        config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: "You are a magical, friendly forest spirit talking to a 5-6 year old child. Keep sentences short, simple, and encouraging. Be excited about their adventures. Do not give long lectures.",
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
            }
        }
    });
}