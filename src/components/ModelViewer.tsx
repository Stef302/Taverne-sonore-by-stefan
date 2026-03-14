import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';
import { Box, Upload } from 'lucide-react';

// ============================================================================
// INSTRUCTIONS POUR AJOUTER TON MODÈLE 3D :
// 1. Prends ton fichier 3D (il doit être au format .glb ou .gltf)
// 2. Renomme-le en "mon-modele.glb" (ou change le nom dans la variable ci-dessous)
// 3. Glisse-le dans le dossier "public" situé à la racine du projet
// ============================================================================

const MODEL_FILENAME = '/mon-modele.glb'; // <-- Change le nom ici si besoin

// Composant qui charge le modèle
function MyCustomModel() {
  const { scene } = useGLTF(MODEL_FILENAME);
  return <primitive object={scene} />;
}

// Gestion des erreurs si le fichier n'est pas trouvé
class ModelErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn(`Le modèle 3D "${MODEL_FILENAME}" n'a pas été trouvé. Affiche les instructions.`);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-mahogany-900/90 backdrop-blur-sm text-center p-6 z-10 border border-brass-500/30 rounded-md">
          <Upload className="text-brass-400 mb-4 animate-bounce" size={40} />
          <h3 className="text-brass-400 font-serif font-bold text-lg mb-2">Modèle 3D manquant</h3>
          <p className="text-parchment-300 text-sm mb-4 font-serif">
            Pour afficher ton modèle 3D ici :
          </p>
          <ol className="text-left text-xs text-parchment-400 font-mono space-y-2 bg-black/30 p-4 rounded border border-white/5">
            <li>1. Ajoute ton fichier dans le dossier <span className="text-brass-300 font-bold">public/</span></li>
            <li>2. Nomme-le <span className="text-brass-300 font-bold">mon-modele.glb</span></li>
            <li>3. Recharge la page !</li>
          </ol>
        </div>
      );
    }
    return this.props.children;
  }
}

// Fallback visuel pendant le chargement
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#d4af37" wireframe />
    </mesh>
  );
}

export default function ModelViewer() {
  return (
    <div className="w-full h-64 bg-black/20 rounded-md border border-ink/10 overflow-hidden relative shadow-inner">
      <ModelErrorBoundary>
        <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
          <Suspense fallback={<LoadingFallback />}>
            <Stage environment="city" intensity={0.6}>
              <MyCustomModel />
            </Stage>
          </Suspense>
          <OrbitControls autoRotate autoRotateSpeed={1.5} makeDefault enableZoom={true} />
        </Canvas>
        <div className="absolute bottom-2 right-2 text-[10px] font-mono text-ink/40 uppercase pointer-events-none bg-white/50 px-2 py-1 rounded backdrop-blur-sm">
          Glissez pour pivoter
        </div>
      </ModelErrorBoundary>
    </div>
  );
}
