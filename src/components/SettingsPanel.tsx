import React from 'react';
import { Info, User, Lightbulb, Box } from 'lucide-react';
import ModelViewer from './ModelViewer';

export default function SettingsPanel() {
  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto pb-24">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-8 text-center flex items-center gap-2 font-serif">
        <Info /> Informations
      </h2>

      <div className="w-full space-y-8">
        
        {/* 3D Model Section */}
        <div className="parchment-bg p-6 rounded-sm border border-ink/20 shadow-xl">
          <div className="flex items-center gap-2 border-b border-ink/20 pb-2 mb-4">
            <Box className="text-ink" size={20} />
            <h3 className="font-bold text-ink uppercase tracking-widest font-mono">La Machine</h3>
          </div>
          <p className="text-sm text-ink/80 italic mb-4 font-serif">
            Explorez le modèle 3D de "La Taverne de <span className="font-bold"><span className="text-green-700">S</span><span className="text-red-700">t</span><span className="text-green-700">e</span><span className="text-red-700">f</span><span className="text-green-700">a</span><span className="text-red-700">n</span> <span className="text-green-700">S</span><span className="text-red-700">a</span><span className="text-green-700">c</span><span className="text-red-700">h</span><span className="text-green-700">e</span><span className="text-red-700">l</span><span className="text-green-700">a</span><span className="text-red-700">r</span><span className="text-green-700">u</span></span>".
          </p>
          
          <ModelViewer />
        </div>

        {/* Credits Section */}
        <div className="parchment-bg p-6 rounded-sm border border-ink/20 shadow-xl">
          <div className="flex items-center gap-2 border-b border-ink/20 pb-2 mb-4">
            <User className="text-ink" size={20} />
            <h3 className="font-bold text-ink uppercase tracking-widest font-mono">Crédits</h3>
          </div>
          <div className="space-y-2 text-ink/80 font-serif">
            <p>
              <strong className="text-ink">Création & Conception :</strong> <span className="font-bold"><span className="text-green-700">S</span><span className="text-red-700">t</span><span className="text-green-700">e</span><span className="text-red-700">f</span><span className="text-green-700">a</span><span className="text-red-700">n</span> <span className="text-green-700">S</span><span className="text-red-700">a</span><span className="text-green-700">c</span><span className="text-red-700">h</span><span className="text-green-700">e</span><span className="text-red-700">l</span><span className="text-green-700">a</span><span className="text-red-700">r</span><span className="text-green-700">u</span></span>
            </p>
            <p className="text-sm">
              <span className="text-green-700 font-bold">La Taverne Sonore</span> est une expérience interactive mêlant dessin, musique et intelligence artificielle, conçue pour transformer des partitions visuelles en œuvres musicales uniques.
            </p>
          </div>
        </div>

        {/* Inspiration Section */}
        <div className="parchment-bg p-6 rounded-sm border border-ink/20 shadow-xl">
          <div className="flex items-center gap-2 border-b border-ink/20 pb-2 mb-4">
            <Lightbulb className="text-ink" size={20} />
            <h3 className="font-bold text-ink uppercase tracking-widest font-mono">Mon Inspiration</h3>
          </div>
          <div className="space-y-4 text-sm text-ink/80 font-serif leading-relaxed">
            <p>
              L'idée de "<span className="text-green-700 font-bold">La Taverne Sonore</span>" m'est venue de la fascination pour les automates musicaux du 19ème siècle et les boîtes à musique à cylindre.
            </p>
            <p>
              C'est ma façon de faire ressortir la <span className="text-green-700 font-bold">musique</span> à travers une œuvre. J'ai voulu recréer cette <span className="text-red-700 font-bold">magie mécanique</span> à l'ère du numérique, en permettant à chacun de devenir le <span className="text-green-700 font-bold">compositeur</span> de sa propre boîte à musique, simplement en dessinant. Les formes deviennent des <span className="text-red-700 font-bold">mélodies</span>, les couleurs deviennent des <span className="text-green-700 font-bold">instruments</span>, et le papier devient un véritable <span className="text-red-700 font-bold">cylindre sonore</span>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
