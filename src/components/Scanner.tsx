import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Play, Loader2, Camera as CameraIcon, RefreshCw, Upload, Music, Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { MusicPlayer, generateMusicData, instrumentOptions, getDefaultInstrument } from '../utils/audio';
import { Cylinder } from '../App';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface ScannerProps {
  onSave: (cylinder: Cylinder) => void;
}

export default function Scanner({ onSave }: ScannerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [contourPath, setContourPath] = useState<{x: number, y: number}[]>([]);
  
  // Modifiable parameters
  const [showSettings, setShowSettings] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<string>('acoustic_grand_piano');
  const [baseOctave, setBaseOctave] = useState<number>(4);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const playerRef = useRef<MusicPlayer | null>(null);

  useEffect(() => {
    playerRef.current = new MusicPlayer();
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Erreur d'accès à la caméra:", err);
      setCameraError(true);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!image && !result) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [image, result, startCamera, stopCamera]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setImage(dataUrl);
        stopCamera();
        handleScan(dataUrl);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImage(dataUrl);
        setResult(null);
        handleScan(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractContours = (dataUrl: string): Promise<{x: number, y: number}[]> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve([]);
        
        canvas.width = 100;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 100, 50);
        const imageData = ctx.getImageData(0, 0, 100, 50);
        const data = imageData.data;
        const points: {x: number, y: number}[] = [];
        
        for (let x = 0; x < 100; x += 2) {
          for (let y = 0; y < 50; y += 2) {
            const i = (y * 100 + x) * 4;
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];
            if (r < 150 && g < 150 && b < 150) {
              points.push({ x: x / 100, y: y / 50 });
            }
          }
        }
        
        points.sort((a, b) => a.x - b.x);
        
        const sampled = [];
        if (points.length > 0) {
          // Sample more points for a richer melody (e.g., up to 150 points)
          const step = Math.max(1, Math.floor(points.length / 150));
          for (let i = 0; i < points.length; i += step) {
            sampled.push(points[i]);
          }
        }
        
        resolve(sampled);
      };
      img.src = dataUrl;
    });
  };

  const handleScan = async (imageDataToScan: string) => {
    if (!imageDataToScan) return;
    setIsScanning(true);
    setResult(null);
    setShowSettings(false);

    const path = await extractContours(imageDataToScan);
    setContourPath(path);

    try {
      const base64Data = imageDataToScan.split(',')[1];
      const mimeType = imageDataToScan.split(';')[0].split(':')[1];

      const prompt = `Analyse cette partition manuscrite.
Retourne UNIQUEMENT un JSON avec :
1. summary: 2 phrases poétiques sur l'interprétation.
2. title: Un titre poétique.
3. shapeType: "continuous" (traits liés/courbes), "angular" (traits droits/hachés), ou "none" (si vide).
4. colorFamily: "red", "orange", "yellow", "green", "blue", "purple", ou "none" (selon la couleur dominante).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: prompt }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              title: { type: Type.STRING },
              shapeType: { type: Type.STRING },
              colorFamily: { type: Type.STRING }
            },
            required: ["summary", "title", "shapeType", "colorFamily"]
          }
        }
      });

      if (response.text) {
        const metadata = JSON.parse(response.text);
        
        const defaultInstr = getDefaultInstrument(metadata.colorFamily, metadata.shapeType);
        setSelectedInstrument(defaultInstr);
        setBaseOctave(4);

        const fullResult = {
          ...metadata,
          contours: path
        };

        setResult(fullResult);

        onSave({
          id: Date.now().toString(),
          title: metadata.title || "Œuvre Inconnue",
          date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
          instrument: defaultInstr,
          image: imageDataToScan,
          result: fullResult
        });
      }
    } catch (error) {
      console.error("Scanning failed:", error);
      setResult({ summary: "L'automate a rencontré une erreur lors de la lecture du cylindre." });
    } finally {
      setIsScanning(false);
    }
  };

  const handlePlay = async () => {
    if (!result || !result.contours || !playerRef.current) return;
    
    playerRef.current.stop();
    setIsPlaying(true);
    
    const timeline = generateMusicData(result.contours, result.shapeType, baseOctave);
    
    await playerRef.current.load(selectedInstrument);
    playerRef.current.onEnded = () => {
      setIsPlaying(false);
    };
    playerRef.current.play(timeline);
  };

  return (
    <div className="flex flex-col items-center w-full h-full pb-24">
      <h2 className="text-xl sm:text-2xl font-bold text-brass-400 mb-4 sm:mb-6 text-center font-serif">Le Viseur Optique</h2>
      
      <div className="relative w-full max-w-2xl aspect-[4/3] sm:aspect-[2/1] bg-black brass-border overflow-hidden flex items-center justify-center group">
        {!image ? (
          <>
            {cameraError ? (
              <div 
                className="flex flex-col items-center justify-center text-brass-600 cursor-pointer hover:text-brass-400 transition-colors w-full h-full p-4 text-center"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={48} className="mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                <p className="font-sans text-xs sm:text-sm uppercase tracking-widest font-medium">Caméra indisponible. Cliquez pour insérer.</p>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-[4px] sm:border-[8px] border-black/40 pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[90%] aspect-[2/1] border-2 border-dashed border-brass-400/70 rounded-lg"></div>
                </div>
                
                <button 
                  onClick={captureImage}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-brass-500 text-white rounded-full p-4 shadow-lg hover:bg-brass-400 hover:scale-105 transition-all"
                >
                  <CameraIcon size={28} fill="currentColor" />
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <img src={image} alt="Partition" className="w-full h-full object-cover opacity-90" />
            
            {isScanning && (
              <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                <motion.div 
                  className="absolute top-0 bottom-0 w-1 bg-brass-400 shadow-[0_0_15px_#d4af37]"
                  initial={{ left: '-10%' }}
                  animate={{ left: '110%' }}
                  transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
                />
                
                {contourPath.length > 0 && (
                  <motion.div
                    className="absolute w-12 h-12 border border-brass-400/80 rounded-full flex items-center justify-center -ml-6 -mt-6"
                    animate={{
                      left: contourPath.map(p => `${p.x * 100}%`),
                      top: contourPath.map(p => `${p.y * 100}%`),
                      scale: contourPath.map((_, i) => i % 2 === 0 ? 1.2 : 0.8)
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-1 h-1 bg-brass-300 rounded-full shadow-[0_0_10px_#fde68a]"></div>
                    <div className="absolute w-full h-px bg-brass-400/50"></div>
                    <div className="absolute h-full w-px bg-brass-400/50"></div>
                  </motion.div>
                )}
                
                <div className="absolute inset-0 bg-brass-500/10 mix-blend-color-burn animate-pulse"></div>
              </div>
            )}
          </>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {isScanning && (
        <div className="mt-6 sm:mt-8 flex items-center space-x-3 text-brass-400">
          <Loader2 className="animate-spin" />
          <p className="uppercase tracking-widest text-xs sm:text-sm font-medium">Analyse des contours en cours...</p>
        </div>
      )}

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 sm:mt-8 w-full max-w-2xl parchment-bg p-6 sm:p-8 relative"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-ink">{result.title || "Interprétation"}</h3>
            </div>
            {result.contours && (
              <button 
                onClick={handlePlay}
                disabled={isPlaying || result.contours.length === 0}
                className={`flex items-center justify-center gap-2 px-6 py-2 rounded-full font-medium text-sm transition-all shadow-md ${isPlaying || result.contours.length === 0 ? 'bg-brass-600 text-white/50 cursor-not-allowed' : 'bg-brass-500 text-white hover:bg-brass-400 hover:scale-105'}`}
              >
                {isPlaying ? <Loader2 className="animate-spin" size={16} /> : <Music size={16} />}
                {isPlaying ? "Lecture..." : "Écouter l'œuvre"}
              </button>
            )}
          </div>
          
          <p className="text-sm sm:text-base italic mb-6 leading-relaxed text-ink/80 font-serif">"{result.summary}"</p>
          
          {result.contours && result.contours.length > 0 ? (
            <div className="mb-6">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 text-xs font-bold text-ink/70 uppercase tracking-wider hover:text-ink transition-colors"
              >
                <Settings2 size={14} />
                Réglages de l'Automate
                {showSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              {showSettings && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-white/40 p-4 rounded-lg border border-ink/10 mt-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-ink/70 mb-2">Instrument Principal</label>
                      <select 
                        value={selectedInstrument}
                        onChange={(e) => setSelectedInstrument(e.target.value)}
                        className="w-full bg-parchment-100 border border-ink/20 rounded-md py-2 px-3 text-sm text-ink focus:outline-none focus:border-brass-500"
                      >
                        {instrumentOptions.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-mono text-ink/70 mb-2">
                        Hauteur (Octave: {baseOctave})
                      </label>
                      <input 
                        type="range" 
                        min="2" 
                        max="6" 
                        value={baseOctave}
                        onChange={(e) => setBaseOctave(parseInt(e.target.value))}
                        className="w-full h-2 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-brass-500"
                      />
                      <div className="flex justify-between text-[10px] text-ink/50 mt-1 font-mono">
                        <span>Grave</span>
                        <span>Aigu</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="bg-white/40 p-4 rounded-lg border border-ink/10 mb-6 text-center text-ink/60 text-sm italic">
              Aucune forme reconnue. Dessinez des traits pour générer de la musique.
            </div>
          )}
          
          <div className="mt-4 flex justify-center border-t border-ink/10 pt-6">
            <button 
              onClick={() => { setImage(null); setResult(null); setContourPath([]); setShowSettings(false); }}
              className="px-6 py-2 bg-ink/5 text-ink rounded-full hover:bg-ink/10 transition-colors text-xs uppercase tracking-widest font-medium flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Nouveau Scan
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
