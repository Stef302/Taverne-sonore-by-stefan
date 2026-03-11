/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Camera, Library, BookOpen, Info } from 'lucide-react';
import Scanner from './components/Scanner';
import Gallery from './components/Gallery';
import Manual from './components/Manual';
import SettingsPanel from './components/SettingsPanel';

export interface Cylinder {
  id: string;
  title: string;
  date: string;
  instrument: string;
  accompInstrument?: string;
  image: string;
  result: any;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [cylinders, setCylinders] = useState<Cylinder[]>([]);

  const handleSaveCylinder = (cylinder: Cylinder) => {
    setCylinders(prev => [cylinder, ...prev]);
  };

  return (
    <div className="h-screen flex flex-col bg-mahogany-900 text-parchment-200 overflow-hidden">
      {/* Header */}
      <header className="pt-8 pb-4 px-4 text-center z-10 bg-mahogany-900/80 backdrop-blur-md border-b border-white/5">
        <h1 className="text-2xl sm:text-3xl font-bold text-brass-400 tracking-wide font-serif">
          La Taverne Sonore
        </h1>
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto p-4 pb-28">
        {activeTab === 'scanner' && <Scanner onSave={handleSaveCylinder} />}
        {activeTab === 'gallery' && <Gallery cylinders={cylinders} />}
        {activeTab === 'manual' && <Manual />}
        {activeTab === 'info' && <SettingsPanel />}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full bg-mahogany-800/95 backdrop-blur-xl border-t border-white/10 pb-safe z-50">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
          {[
            { id: 'scanner', icon: Camera, label: 'Scanner' },
            { id: 'gallery', icon: Library, label: 'Cylindres' },
            { id: 'manual', icon: BookOpen, label: 'Manuel' },
            { id: 'info', icon: Info, label: 'Infos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                activeTab === tab.id
                  ? 'text-brass-400'
                  : 'text-parchment-400 hover:text-brass-300'
              }`}
            >
              <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-wider uppercase">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
