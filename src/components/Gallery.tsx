import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Square, X, Music, Settings2, ChevronDown, ChevronUp, Library as LibraryIcon, Download, Loader2 } from 'lucide-react';
import { Cylinder } from '../App';
import { MusicPlayer, generateMusicData, instrumentOptions, exportAudio } from '../utils/audio';

interface GalleryProps {
  cylinders: Cylinder[];
}

function CylinderCard({ cylinder, onClick }: { cylinder: Cylinder, onClick: () => void }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX(((y - centerY) / centerY) * -15);
    setRotateY(((x - centerX) / centerX) * 15);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      style={{ perspective: 1000 }}
      onClick={onClick}
      className="cursor-pointer w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        animate={{ rotateX, rotateY }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full aspect-[3/4] parchment-bg brass-border p-4 flex flex-col items-center justify-between shadow-xl relative overflow-hidden group"
      >
        <div 
          className="absolute inset-0 opacity-30 bg-cover bg-center mix-blend-multiply transition-opacity group-hover:opacity-50" 
          style={{ backgroundImage: `url(${cylinder.image})` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-mahogany-900/20" />
        
        <h3 className="font-bold text-ink font-serif text-center z-10 text-lg drop-shadow-sm">{cylinder.title}</h3>
        
        <div className="w-16 h-16 rounded-full border-2 border-brass-500/50 flex items-center justify-center z-10 bg-parchment-100/80 backdrop-blur-sm group-hover:scale-110 transition-transform">
          <Music className="text-brass-600" size={28} />
        </div>
        
        <div className="z-10 text-center w-full bg-parchment-100/90 py-1 rounded-sm border border-ink/10">
          <p className="text-xs font-mono text-ink/80">{cylinder.date}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Gallery({ cylinders }: GalleryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [playbackState, setPlaybackState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const playerRef = useRef<MusicPlayer | null>(null);

  // Modifiable parameters per cylinder
  const [selectedInstruments, setSelectedInstruments] = useState<Record<string, string>>({});
  const [baseOctaves, setBaseOctaves] = useState<Record<string, number>>({});

  const expandedCylinder = cylinders.find(c => c.id === expandedId);

  // Initialize player
  useEffect(() => {
    playerRef.current = new MusicPlayer();
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const handleClose = () => {
    if (playerRef.current) {
      playerRef.current.stop();
    }
    setPlaybackState('idle');
    setProgress(0);
    setExpandedId(null);
    setShowSettings(false);
  };

  const handleExport = async () => {
    if (!expandedCylinder || !expandedCylinder.result) return;
    setIsExporting(true);
    try {
      const instrument = selectedInstruments[expandedCylinder.id] || expandedCylinder.instrument || 'acoustic_grand_piano';
      const octave = baseOctaves[expandedCylinder.id] || 4;
      let timeline = expandedCylinder.result;
      if (expandedCylinder.result.contours) {
        timeline = generateMusicData(expandedCylinder.result.contours, expandedCylinder.result.shapeType, octave);
      }
      await exportAudio(timeline, instrument);
    } catch (err) {
      console.error("Erreur lors de l'exportation:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePlayPause = async () => {
    if (!expandedCylinder || !expandedCylinder.result || !playerRef.current) return;

    if (playbackState === 'idle') {
      setIsLoading(true);
      const instrument = selectedInstruments[expandedCylinder.id] || expandedCylinder.instrument || 'acoustic_grand_piano';
      const octave = baseOctaves[expandedCylinder.id] || 4;
      
      let timeline = expandedCylinder.result;
      if (expandedCylinder.result.contours) {
        timeline = generateMusicData(expandedCylinder.result.contours, expandedCylinder.result.shapeType, octave);
      }
      
      await playerRef.current.load(instrument);
      
      playerRef.current.onProgress = (time) => {
        const total = timeline.totalDuration || 60;
        setProgress(Math.min(100, (time / total) * 100));
      };
      
      playerRef.current.onEnded = () => {
        setPlaybackState('idle');
        setProgress(0);
      };

      playerRef.current.play(timeline);
      setPlaybackState('playing');
      setIsLoading(false);
      
    } else if (playbackState === 'playing') {
      playerRef.current.pause();
      setPlaybackState('paused');
    } else if (playbackState === 'paused') {
      playerRef.current.resume();
      setPlaybackState('playing');
    }
  };

  const handleStop = () => {
    if (playerRef.current) {
      playerRef.current.stop();
    }
    setPlaybackState('idle');
    setProgress(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!expandedCylinder || !expandedCylinder.result || !playerRef.current) return;
    
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    
    let timeline = expandedCylinder.result;
    if (expandedCylinder.result.contours) {
      const octave = baseOctaves[expandedCylinder.id] || 4;
      timeline = generateMusicData(expandedCylinder.result.contours, expandedCylinder.result.shapeType, octave);
    }
    
    const total = timeline.totalDuration || 60;
    const seekTime = (newProgress / 100) * total;
    
    if (playbackState !== 'idle') {
      playerRef.current.seek(seekTime);
    }
  };

  const handleInstrumentChange = (id: string, instrument: string) => {
    setSelectedInstruments(prev => ({ ...prev, [id]: instrument }));
    handleStop();
  };

  const handleOctaveChange = (id: string, octave: number) => {
    setBaseOctaves(prev => ({ ...prev, [id]: octave }));
    handleStop();
  };

  const formatTime = (percent: number, total: number) => {
    const seconds = Math.floor((percent / 100) * total);
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (cylinders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center px-4">
        <LibraryIcon size={48} className="text-brass-400 mb-4 opacity-50" />
        <h2 className="text-xl sm:text-2xl font-bold text-brass-400 mb-4 font-serif">Archives Vides</h2>
        <p className="text-parchment-400 max-w-md italic font-serif">
          Vos cylindres sonores apparaîtront ici une fois que vous aurez scanné et interprété vos premières partitions.
        </p>
      </div>
    );
  }

  const currentTimeline = expandedCylinder?.result?.contours ? 
    generateMusicData(expandedCylinder.result.contours, expandedCylinder.result.shapeType, baseOctaves[expandedCylinder.id] || 4) : 
    expandedCylinder?.result;

  return (
    <div className="w-full pb-24 relative">
      <h2 className="text-xl sm:text-2xl font-bold text-brass-400 mb-8 text-center font-serif">Archives des Cylindres</h2>
      
      {/* Grid of Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-2">
        {cylinders.map((cylinder) => (
          <CylinderCard 
            key={cylinder.id} 
            cylinder={cylinder} 
            onClick={() => setExpandedId(cylinder.id)} 
          />
        ))}
      </div>

      {/* Expanded View Modal */}
      <AnimatePresence>
        {expandedId && expandedCylinder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mahogany-900/90 backdrop-blur-sm"
          >
            <motion.div
              layoutId={`card-${expandedId}`}
              initial={{ scale: 0.9, y: 50, rotateX: 20 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto parchment-bg brass-border shadow-2xl relative flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 z-20 flex justify-between items-center p-4 border-b border-ink/10 bg-parchment-200/90 backdrop-blur-md">
                <h3 className="font-bold text-ink font-serif text-lg truncate pr-4">{expandedCylinder.title}</h3>
                <button onClick={handleClose} className="p-2 text-ink/60 hover:text-ink hover:bg-ink/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-6">
                {/* Image */}
                <div className="w-full h-48 bg-black/5 rounded-sm overflow-hidden border border-ink/20 shadow-inner relative">
                  <img 
                    src={expandedCylinder.image} 
                    alt="Partition" 
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                  {/* Scanning line animation when playing */}
                  {playbackState === 'playing' && (
                    <motion.div 
                      className="absolute top-0 bottom-0 w-1 bg-brass-500 shadow-[0_0_10px_rgba(212,175,55,0.8)]"
                      style={{ left: `${progress}%` }}
                    />
                  )}
                </div>

                {/* Advanced Player */}
                <div className="bg-white/40 p-4 rounded-lg border border-ink/10 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-ink/60">
                      {formatTime(progress, currentTimeline?.totalDuration || 60)} / {formatTime(100, currentTimeline?.totalDuration || 60)}
                    </span>
                    <span className="text-xs font-mono text-ink/80 font-bold">
                      {isLoading ? 'Chargement...' : playbackState === 'playing' ? 'Lecture' : playbackState === 'paused' ? 'Pause' : 'Prêt'}
                    </span>
                  </div>
                  
                  {/* Progress Bar (Seekable) */}
                  <div className="w-full h-4 mb-4 relative flex items-center group">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="0.1"
                      value={progress}
                      onChange={handleSeek}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full h-2 bg-ink/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brass-500 transition-all duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {/* Thumb visual */}
                    <div 
                      className="absolute h-4 w-4 bg-brass-600 rounded-full shadow-md transform -translate-x-1/2 pointer-events-none group-hover:scale-110 transition-transform"
                      style={{ left: `${progress}%` }}
                    />
                  </div>
                  
                  {/* Controls */}
                  <div className="flex justify-center items-center gap-4">
                    <button 
                      onClick={handleStop}
                      disabled={playbackState === 'idle'}
                      className={`p-3 rounded-full transition-colors ${playbackState === 'idle' ? 'text-ink/30' : 'text-ink hover:bg-ink/10'}`}
                      title="Arrêter"
                    >
                      <Square size={20} fill="currentColor" />
                    </button>
                    
                    <button 
                      onClick={handlePlayPause}
                      disabled={isLoading}
                      className={`w-14 h-14 bg-brass-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-brass-500 hover:scale-105 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={playbackState === 'playing' ? 'Pause' : 'Lecture'}
                    >
                      {isLoading ? <Loader2 size={24} className="animate-spin" /> : 
                       playbackState === 'playing' ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                    </button>

                    <button 
                      onClick={handleExport}
                      disabled={isExporting}
                      className={`p-3 rounded-full transition-colors text-ink hover:bg-ink/10 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Exporter en WAV"
                    >
                      {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                    </button>
                  </div>
                </div>

                {/* Analysis */}
                <div className="space-y-4">
                  <div className="border-l-2 border-brass-400 pl-4">
                    <h4 className="text-sm font-bold text-ink/60 uppercase tracking-widest font-mono mb-1">Interprétation</h4>
                    <p className="text-ink font-serif italic leading-relaxed">
                      "{expandedCylinder.result?.summary || "Une mélodie oubliée..."}"
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/30 p-3 rounded border border-ink/5">
                      <span className="block text-[10px] uppercase font-mono text-ink/50 mb-1">Type de tracé</span>
                      <span className="font-bold text-ink text-sm capitalize">{expandedCylinder.result?.shapeType || 'Inconnu'}</span>
                    </div>
                    <div className="bg-white/30 p-3 rounded border border-ink/5">
                      <span className="block text-[10px] uppercase font-mono text-ink/50 mb-1">Dominante</span>
                      <span className="font-bold text-ink text-sm capitalize">{expandedCylinder.result?.colorFamily || 'Inconnue'}</span>
                    </div>
                  </div>

                  {/* Musical Info */}
                  {currentTimeline?.info && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-ink/5 p-2 rounded text-center">
                        <span className="block text-[9px] uppercase font-mono text-ink/50">Tempo</span>
                        <span className="font-bold text-ink text-xs">{currentTimeline.info.tempo} BPM</span>
                      </div>
                      <div className="bg-ink/5 p-2 rounded text-center">
                        <span className="block text-[9px] uppercase font-mono text-ink/50">Gamme</span>
                        <span className="font-bold text-ink text-xs truncate" title={currentTimeline.info.scale}>{currentTimeline.info.scale}</span>
                      </div>
                      <div className="bg-ink/5 p-2 rounded text-center">
                        <span className="block text-[9px] uppercase font-mono text-ink/50">Notes</span>
                        <span className="font-bold text-ink text-xs">{currentTimeline.info.noteCount}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Settings */}
                <div className="mt-2">
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center justify-between w-full p-3 bg-ink/5 rounded border border-ink/10 text-sm font-bold text-ink/70 uppercase tracking-wider hover:bg-ink/10 transition-colors"
                  >
                    <span className="flex items-center gap-2"><Settings2 size={16} /> Réglages de l'Automate</span>
                    {showSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  <AnimatePresence>
                    {showSettings && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-white/40 p-4 rounded-b-lg border-x border-b border-ink/10 grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-xs font-mono text-ink/70 mb-2">Instrument Principal</label>
                            <select 
                              value={selectedInstruments[expandedCylinder.id] || expandedCylinder.instrument || 'acoustic_grand_piano'}
                              onChange={(e) => handleInstrumentChange(expandedCylinder.id, e.target.value)}
                              className="w-full bg-parchment-100 border border-ink/20 rounded-md py-2 px-3 text-sm text-ink focus:outline-none focus:border-brass-500"
                            >
                              {instrumentOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-mono text-ink/70 mb-2">
                              Hauteur (Octave: {baseOctaves[expandedCylinder.id] || 4})
                            </label>
                            <input 
                              type="range" 
                              min="2" 
                              max="6" 
                              value={baseOctaves[expandedCylinder.id] || 4}
                              onChange={(e) => handleOctaveChange(expandedCylinder.id, parseInt(e.target.value))}
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
                  </AnimatePresence>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
