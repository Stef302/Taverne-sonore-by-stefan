import { BookOpen, Clock, Activity, PenTool, Palette } from 'lucide-react';

const colors = [
  { id: 'red', hex: '#ef4444', family: 'Cuivres', desc: 'Trompette, Cor, Trombone, Tuba. Apporte une brillance métallique, de la puissance et un caractère martial ou triomphant.' },
  { id: 'orange', hex: '#f97316', family: 'Cordes (Frottées/Frappées)', desc: 'Piano, Violoncelle, Violon. Le cœur expressif de l\'orchestre. Idéal pour les mélodies lyriques et les basses profondes.' },
  { id: 'yellow', hex: '#eab308', family: 'Cordes (Pincées)', desc: 'Harpe, Guitare, Luth. Crée une texture perlée, délicate et cristalline. Parfait pour les arpèges et les atmosphères intimistes.' },
  { id: 'green', hex: '#22c55e', family: 'Bois', desc: 'Flûte, Clarinette, Hautbois. Offre une sonorité organique, boisée et agile. Souvent utilisé pour des motifs virevoltants ou mélancoliques.' },
  { id: 'blue', hex: '#3b82f6', family: 'Percussions', desc: 'Marimba, Timbales, Cloches. Structure le rythme, apporte de la résonance physique et ponctue le discours musical.' },
  { id: 'purple', hex: '#a855f7', family: 'Pad Éthéré', desc: 'Chœurs, Synthétiseurs texturés. Nappes sonores qui enveloppent l\'espace, créant une sensation de flou, de rêve ou de mystère.' },
];

export default function Manual() {
  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto pb-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 font-serif">Le Grand Manuel</h2>
        <p className="text-parchment-400 italic text-sm font-serif">Traité d'Interprétation Graphique & Musicale</p>
      </div>

      <div className="w-full parchment-bg p-6 sm:p-10 space-y-12">
        
        {/* Introduction */}
        <section>
          <p className="text-ink/80 leading-relaxed text-sm sm:text-base first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:text-ink first-letter:mr-1 first-letter:float-left">
            <span className="text-green-700 font-bold">La Taverne Sonore</span> n'est pas un simple lecteur, c'est un <span className="text-red-700 font-bold">automate d'interprétation</span>. Il ne lit pas des notes, il traduit des gestes. Votre dessin est une <span className="text-green-700 font-bold">partition émotionnelle</span> que l'intelligence artificielle va sculpter en <span className="text-red-700 font-bold">ondes sonores</span>. Pour maîtriser cet instrument, il convient d'en comprendre la grammaire.
          </p>
        </section>

        {/* Le Format */}
        <section>
          <h3 className="flex items-center gap-2 text-xl font-serif font-bold text-ink mb-4 border-b border-ink/10 pb-2">
            <BookOpen className="text-ink" size={20} />
            Le Support Physique
          </h3>
          <p className="text-ink/80 text-sm sm:text-base leading-relaxed mb-4">
            L'automate est calibré pour analyser un rectangle strict de <strong className="text-green-700">80 millimètres de largeur</strong> sur <strong className="text-red-700">40 millimètres de hauteur</strong> (ratio 2:1). Tout ce qui dépasse de ce cadre sera ignoré par l'œil optique.
          </p>
          <div className="w-full aspect-[2/1] border-2 border-dashed border-ink/30 rounded-lg flex items-center justify-center bg-white/50">
            <span className="font-mono text-ink/40 text-sm tracking-widest">ZONE DE DESSIN (80x40)</span>
          </div>
        </section>

        {/* Espace et Temps */}
        <section>
          <h3 className="flex items-center gap-2 text-xl font-serif font-bold text-ink mb-4 border-b border-ink/10 pb-2">
            <Clock className="text-ink" size={20} />
            L'Espace et le Temps
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/40 p-4 rounded-lg border border-ink/5">
              <h4 className="font-bold text-ink mb-2 text-sm uppercase tracking-wider"><span className="text-red-700">L'Axe Horizontal</span> (Temps)</h4>
              <p className="text-ink/70 text-sm leading-relaxed">
                La lecture s'effectue de gauche à droite. Les 80mm de largeur représentent une durée maximale de <strong className="text-red-700">60 secondes</strong>. Un trait qui traverse toute la carte durera une minute. Un petit trait au centre créera un silence, puis un son bref, puis un silence.
              </p>
            </div>
            <div className="bg-white/40 p-4 rounded-lg border border-ink/5">
              <h4 className="font-bold text-ink mb-2 text-sm uppercase tracking-wider"><span className="text-green-700">L'Axe Vertical</span> (Hauteur)</h4>
              <p className="text-ink/70 text-sm leading-relaxed">
                La hauteur de votre trait définit la <strong className="text-green-700">fréquence</strong> (la note). Le bas de la carte (0mm) correspond aux fréquences graves (basses, violoncelles). Le haut de la carte (40mm) correspond aux fréquences aiguës (flûtes, violons).
              </p>
            </div>
          </div>
        </section>

        {/* Morphologie */}
        <section>
          <h3 className="flex items-center gap-2 text-xl font-serif font-bold text-ink mb-4 border-b border-ink/10 pb-2">
            <PenTool className="text-ink" size={20} />
            La Morphologie du Trait
          </h3>
          <p className="text-ink/80 text-sm sm:text-base leading-relaxed mb-6">
            La forme de votre tracé dicte l'articulation musicale et le type d'accompagnement généré par l'automate.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 shrink-0 bg-white/60 border border-ink/10 rounded flex items-center justify-center">
                <svg viewBox="0 0 50 50" className="w-10 h-10 stroke-ink fill-none" strokeWidth="2">
                  <path d="M 5 25 Q 15 5 25 25 T 45 25" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-ink text-sm">Traits Courbes & Ondulations</h4>
                <p className="text-ink/70 text-sm mt-1">Génère une mélodie <strong className="text-green-700">Legato</strong> (liée, fluide). L'automate déduira un accompagnement atmosphérique, fait de nappes sonores et de réverbération. Idéal pour la mélancolie et le rêve.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-16 h-16 shrink-0 bg-white/60 border border-ink/10 rounded flex items-center justify-center">
                <svg viewBox="0 0 50 50" className="w-10 h-10 stroke-ink fill-none" strokeWidth="2">
                  <path d="M 5 40 L 15 10 L 25 30 L 35 15 L 45 35" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-ink text-sm">Traits Anguleux & Droits</h4>
                <p className="text-ink/70 text-sm mt-1">Génère une mélodie <strong className="text-red-700">Staccato</strong> (détachée, piquante). L'automate construira un accompagnement rythmique, mécanique, souvent soutenu par des percussions boisées ou des pizzicatos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamique */}
        <section>
          <h3 className="flex items-center gap-2 text-xl font-serif font-bold text-ink mb-4 border-b border-ink/10 pb-2">
            <Activity className="text-ink" size={20} />
            La Dynamique (Les Ronds)
          </h3>
          <p className="text-ink/80 text-sm sm:text-base leading-relaxed mb-4">
            L'intensité sonore (le volume) n'est pas définie par la pression du stylo, mais par la <strong className="text-red-700">masse d'encre</strong> déposée sous forme de cercles ou de points.
          </p>
          <div className="flex items-center justify-between bg-white/40 p-6 rounded-lg border border-ink/5">
            <div className="flex flex-col items-center gap-2">
              <div className="w-2 h-2 bg-ink rounded-full"></div>
              <span className="text-xs font-mono font-bold text-green-700">Pianissimo (pp)</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-ink/20 to-ink/60 mx-4"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 bg-ink rounded-full"></div>
              <span className="text-xs font-mono font-bold text-ink/80">Mezzo-Forte (mf)</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-ink/60 to-ink mx-4"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-ink rounded-full"></div>
              <span className="text-xs font-mono font-bold text-red-700">Fortissimo (ff)</span>
            </div>
          </div>
        </section>

        {/* Couleurs */}
        <section>
          <h3 className="flex items-center gap-2 text-xl font-serif font-bold text-ink mb-4 border-b border-ink/10 pb-2">
            <Palette className="text-ink" size={20} />
            L'Orchestration Chromatique
          </h3>
          <p className="text-ink/80 text-sm sm:text-base leading-relaxed mb-6">
            La couleur dominante de votre tracé détermine la famille d'instruments principale qui portera la voix de votre œuvre. L'automate sélectionnera l'instrument le plus approprié au sein de cette famille.
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            {colors.map((color) => (
              <div key={color.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/40 transition-colors">
                <div 
                  className="w-8 h-8 rounded-full shrink-0 shadow-inner border border-black/10 mt-1"
                  style={{ backgroundColor: color.hex }}
                />
                <div>
                  <h4 className="font-bold text-sm" style={{ color: color.hex }}>{color.family}</h4>
                  <p className="text-ink/70 text-xs sm:text-sm mt-1 leading-relaxed">{color.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
