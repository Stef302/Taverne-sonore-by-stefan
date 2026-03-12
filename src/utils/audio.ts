// @ts-ignore
import Soundfont from 'soundfont-player';

export const instrumentOptions = [
  // Cuivres (Rouge)
  { id: 'trumpet', name: 'Trompette', color: 'red', shape: 'continuous' },
  { id: 'french_horn', name: 'Cor d\'Harmonie', color: 'red', shape: 'continuous' },
  { id: 'trombone', name: 'Trombone', color: 'red', shape: 'continuous' },
  { id: 'tuba', name: 'Tuba', color: 'red', shape: 'angular' },
  
  // Cordes frottées (Orange)
  { id: 'violin', name: 'Violon', color: 'orange', shape: 'continuous' },
  { id: 'cello', name: 'Violoncelle', color: 'orange', shape: 'continuous' },
  { id: 'contrabass', name: 'Contrebasse', color: 'orange', shape: 'angular' },
  
  // Cordes pincées (Jaune)
  { id: 'orchestral_harp', name: 'Harpe', color: 'yellow', shape: 'angular' },
  { id: 'acoustic_guitar_nylon', name: 'Guitare Classique', color: 'yellow', shape: 'angular' },
  { id: 'banjo', name: 'Banjo', color: 'yellow', shape: 'angular' },
  
  // Bois (Vert)
  { id: 'flute', name: 'Flûte', color: 'green', shape: 'continuous' },
  { id: 'clarinet', name: 'Clarinette', color: 'green', shape: 'continuous' },
  { id: 'oboe', name: 'Hautbois', color: 'green', shape: 'continuous' },
  { id: 'bassoon', name: 'Basson', color: 'green', shape: 'angular' },
  
  // Percussions (Bleu)
  { id: 'marimba', name: 'Marimba', color: 'blue', shape: 'angular' },
  { id: 'timpani', name: 'Timbales', color: 'blue', shape: 'angular' },
  { id: 'tubular_bells', name: 'Cloches Tubulaires', color: 'blue', shape: 'angular' },
  
  // Synthés / Chœurs (Violet)
  { id: 'choir_aahs', name: 'Chœurs', color: 'purple', shape: 'continuous' },
  { id: 'pad_1_new_age', name: 'Pad Atmosphérique', color: 'purple', shape: 'continuous' },
  { id: 'lead_1_square', name: 'Synthé Lead', color: 'purple', shape: 'continuous' },
  
  // Défaut
  { id: 'acoustic_grand_piano', name: 'Piano à Queue', color: 'none', shape: 'angular' },
  { id: 'harpsichord', name: 'Clavecin', color: 'none', shape: 'angular' }
];

export function getDefaultInstrument(colorFamily: string, shapeType: string): string {
  if (colorFamily === 'none' && shapeType === 'none') {
    const randomIdx = Math.floor(Math.random() * (instrumentOptions.length - 1));
    return instrumentOptions[randomIdx].id;
  }

  let matches = instrumentOptions;

  if (colorFamily !== 'none') {
    matches = matches.filter(i => i.color === colorFamily);
  }

  if (shapeType !== 'none') {
    const shapeMatches = matches.filter(i => i.shape === shapeType);
    if (shapeMatches.length > 0) {
      matches = shapeMatches;
    }
  }

  if (matches.length > 0) {
    const randomMatch = matches[Math.floor(Math.random() * matches.length)];
    return randomMatch.id;
  }

  return shapeType === 'continuous' ? 'pad_1_new_age' : 'acoustic_grand_piano';
}

export function mapYToNote(y: number, baseOctave: number = 4): string {
  const pentatonic = ['C', 'D', 'E', 'G', 'A'];
  const invertedY = Math.max(0, Math.min(1, 1 - y));
  const totalNotes = pentatonic.length * 3;
  const noteIndex = Math.floor(invertedY * (totalNotes - 1));
  const octave = baseOctave + Math.floor(noteIndex / pentatonic.length);
  const noteName = pentatonic[noteIndex % pentatonic.length];
  return `${noteName}${octave}`;
}

export function generateMusicData(contours: {x: number, y: number}[], shapeType: string, baseOctave: number = 4) {
  if (!contours || contours.length === 0 || shapeType === 'none') {
    return { melody: [], accompaniment: [], totalDuration: 0, info: {} };
  }

  const isLegato = shapeType === 'continuous';
  const minX = Math.min(...contours.map(c => c.x));
  const maxX = Math.max(...contours.map(c => c.x));
  const spanX = maxX - minX || 1;
  
  // A full width line (spanX = 1) corresponds to 60 seconds.
  // A line from the middle to the end (spanX = 0.5) corresponds to 30 seconds.
  const targetDuration = spanX * 60; 

  // Quantize to a grid (e.g., 120 BPM = 0.5s per beat)
  const bpm = isLegato ? 90 : 120;
  const beatDuration = 60 / bpm;

  const rawMelody: any[] = [];

  // Generate Melody
  contours.forEach((p) => {
    // Normalize X to 0-1 relative to the line itself, then scale to targetDuration
    const normalizedX = (p.x - minX) / spanX;
    let rawTime = normalizedX * targetDuration;

    // Quantize time to nearest 16th note (0.25 of a beat)
    const step = beatDuration / 4;
    const time = Math.round(rawTime / step) * step;

    rawMelody.push({
      time: time,
      note: mapYToNote(p.y, baseOctave),
      duration: isLegato ? beatDuration : beatDuration / 2,
      volume: 0.8
    });
  });

  // Remove duplicate notes at the exact same time, keeping the first one
  const timeUniqueMelody: any[] = [];
  const seenTimes = new Set();
  for (const note of rawMelody) {
    if (!seenTimes.has(note.time)) {
      seenTimes.add(note.time);
      timeUniqueMelody.push(note);
    }
  }

  // Sort by time just in case
  timeUniqueMelody.sort((a, b) => a.time - b.time);

  const melody = timeUniqueMelody;

  // Generate a simple, non-intrusive chord accompaniment
  // If legato, plays a soft long chord. If angular, plays shorter staccato chords.
  const accompaniment: any[] = [];
  const numMeasures = Math.ceil(targetDuration / (beatDuration * 4));
  
  for (let m = 0; m < numMeasures; m++) {
    const measureTime = m * beatDuration * 4;
    if (measureTime >= targetDuration) break;

    // Find the average Y of the melody in this measure to determine the chord
    const notesInMeasure = melody.filter(n => n.time >= measureTime && n.time < measureTime + beatDuration * 4);
    let avgY = 0.5;
    if (notesInMeasure.length > 0) {
      const prog = [0.8, 0.6, 0.5, 0.6]; // Root, IV, V, IV roughly
      avgY = prog[m % prog.length];
    }

    const rootNote = mapYToNote(avgY, baseOctave - 1);
    const thirdNote = mapYToNote(avgY - 0.15, baseOctave - 1);
    const fifthNote = mapYToNote(avgY - 0.3, baseOctave - 1);

    if (isLegato) {
      // Long, soft chords for continuous lines
      accompaniment.push({ time: measureTime, note: rootNote, duration: beatDuration * 4, volume: 0.25 });
      accompaniment.push({ time: measureTime, note: thirdNote, duration: beatDuration * 4, volume: 0.2 });
      accompaniment.push({ time: measureTime, note: fifthNote, duration: beatDuration * 4, volume: 0.2 });
    } else {
      // Shorter, rhythmic chords for angular lines (e.g., on beats 1 and 3)
      const staccatoDuration = beatDuration * 0.5;
      const vol = 0.35; // slightly louder for staccato
      
      // Beat 1
      accompaniment.push({ time: measureTime, note: rootNote, duration: staccatoDuration, volume: vol });
      accompaniment.push({ time: measureTime, note: thirdNote, duration: staccatoDuration, volume: vol });
      accompaniment.push({ time: measureTime, note: fifthNote, duration: staccatoDuration, volume: vol });
      
      // Beat 3
      if (measureTime + beatDuration * 2 < targetDuration) {
        accompaniment.push({ time: measureTime + beatDuration * 2, note: rootNote, duration: staccatoDuration, volume: vol });
        accompaniment.push({ time: measureTime + beatDuration * 2, note: thirdNote, duration: staccatoDuration, volume: vol });
        accompaniment.push({ time: measureTime + beatDuration * 2, note: fifthNote, duration: staccatoDuration, volume: vol });
      }
    }
  }

  return { 
    melody, 
    accompaniment, 
    totalDuration: targetDuration,
    info: {
      tempo: bpm,
      scale: "Pentatonique Majeure",
      noteCount: melody.length + accompaniment.length
    }
  };
}

export class MusicPlayer {
  ac: AudioContext;
  player: any = null;
  accompPlayer: any = null;
  timeline: any = null;
  scheduledNodes: any[] = [];
  startTime: number = 0;
  pauseTime: number = 0;
  isPaused: boolean = false;
  isPlaying: boolean = false;
  onProgress?: (time: number) => void;
  onEnded?: () => void;
  reqId: number = 0;
  instrumentId: string = '';
  accompInstrumentId: string = '';

  constructor() {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    this.ac = new AudioContext();
  }

  async load(instrumentId: string, accompInstrumentId: string = 'pad_1_new_age') {
    if (this.player && this.instrumentId === instrumentId && this.accompPlayer && this.accompInstrumentId === accompInstrumentId) return; // Already loaded
    this.instrumentId = instrumentId;
    this.accompInstrumentId = accompInstrumentId;
    this.player = await Soundfont.instrument(this.ac, instrumentId as any, { soundfont: 'MusyngKite' });
    this.accompPlayer = await Soundfont.instrument(this.ac, accompInstrumentId as any, { soundfont: 'MusyngKite' });
  }

  play(timeline: any, offset: number = 0) {
    this.timeline = timeline;
    this.stopNodes();
    this.isPaused = false;
    this.isPlaying = true;

    if (this.ac.state === 'suspended') {
      this.ac.resume();
    }

    this.startTime = this.ac.currentTime - offset;
    const maxTime = timeline.totalDuration || 60;

    const schedule = (notes: any[], instrument: any) => {
      if (!notes || !instrument) return;
      notes.forEach((note: any) => {
        if (note.time >= offset) {
          const node = instrument.play(note.note, this.startTime + note.time, {
            duration: note.duration,
            gain: note.volume
          });
          if (node) this.scheduledNodes.push(node);
        }
      });
    };

    schedule(timeline.melody, this.player);
    schedule(timeline.accompaniment, this.accompPlayer);

    const loop = () => {
      if (!this.isPlaying || this.isPaused) return;
      const current = this.ac.currentTime - this.startTime;

      if (this.onProgress) this.onProgress(current);

      if (current >= maxTime) {
        this.stop();
        if (this.onEnded) this.onEnded();
      } else {
        this.reqId = requestAnimationFrame(loop);
      }
    };
    cancelAnimationFrame(this.reqId);
    this.reqId = requestAnimationFrame(loop);
  }

  pause() {
    if (!this.isPlaying || this.isPaused) return;
    this.isPaused = true;
    this.pauseTime = this.ac.currentTime - this.startTime;
    this.stopNodes();
    cancelAnimationFrame(this.reqId);
  }

  resume() {
    if (!this.isPaused) return;
    this.play(this.timeline, this.pauseTime);
  }

  seek(time: number) {
    const wasPlaying = this.isPlaying && !this.isPaused;
    this.stopNodes();
    cancelAnimationFrame(this.reqId);
    this.pauseTime = time;
    if (this.onProgress) this.onProgress(time);

    if (wasPlaying) {
      this.play(this.timeline, time);
    }
  }

  stopNodes() {
    this.scheduledNodes.forEach(node => {
      if (node && typeof node.stop === 'function') node.stop();
    });
    this.scheduledNodes = [];
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.pauseTime = 0;
    this.stopNodes();
    cancelAnimationFrame(this.reqId);
    if (this.onProgress) this.onProgress(0);
  }

  destroy() {
    this.stop();
    this.ac.close();
  }
}

function audioBufferToWav(buffer: AudioBuffer) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  const channels = [];
  let sample = 0;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit
  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([bufferArray], { type: "audio/wav" });
}

export async function exportAudio(timeline: any, instrumentId: string, accompInstrumentId: string = 'pad_1_new_age') {
  const totalDuration = timeline.totalDuration || 60;
  const sampleRate = 44100;
  // Create an offline audio context to render the audio as fast as possible
  const offlineCtx = new OfflineAudioContext(2, sampleRate * totalDuration, sampleRate);

  try {
    const player = await Soundfont.instrument(offlineCtx as any, instrumentId as any, { soundfont: 'MusyngKite' });
    const accompPlayer = await Soundfont.instrument(offlineCtx as any, accompInstrumentId as any, { soundfont: 'MusyngKite' });

    if (timeline.melody && Array.isArray(timeline.melody)) {
      timeline.melody.forEach((note: any) => {
        player.play(note.note, offlineCtx.currentTime + note.time, { 
          duration: note.duration || 0.5, 
          gain: note.volume || 0.8 
        });
      });
    }

    if (timeline.accompaniment && Array.isArray(timeline.accompaniment)) {
      timeline.accompaniment.forEach((note: any) => {
        accompPlayer.play(note.note, offlineCtx.currentTime + note.time, { 
          duration: note.duration || 1.0, 
          gain: (note.volume || 0.5) * 0.6 
        });
      });
    }

    const renderedBuffer = await offlineCtx.startRendering();
    const wavBlob = audioBufferToWav(renderedBuffer);
    
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `la-taverne-sonore-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (err) {
    console.error("Erreur lors de l'exportation audio:", err);
    throw err;
  }
}
