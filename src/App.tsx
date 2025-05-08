import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import DrillPage from './pages/DrillPage';
import StatsPage from './pages/StatsPage';
import { useAppStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import { useEffect, useState } from 'react';
import { CubeColor, COLORS } from './logic/cubeConstants';
import { OrientationProblem, generateOrientationProblem, checkAnswer } from './logic/orientation';
import './App.css';

function App() {
  const [appData, setAppData, /* resetStats */] = useAppStorage();

  // Register the service worker
  useEffect(() => {
    // Register service worker only in production
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }
  }, []);

  const toggleMute = () => {
    setAppData(prev => ({
      ...prev,
      settings: { ...prev.settings, muted: !prev.settings.muted },
    }));
  };

  const handleBottomColorChange = (newColor: CubeColor) => {
    setAppData(prev => ({
      ...prev,
      settings: { ...prev.settings, bottomColor: newColor },
    }));
    // Note: May need to trigger a re-generation of the problem in DrillPage
  };

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center font-sans">
        {/* Centered content container */} 
        <div className="w-full max-w-md flex-grow flex flex-col">
          <Header 
            isMuted={appData.settings.muted} 
            onToggleMute={toggleMute}
            currentBottomColor={appData.settings.bottomColor}
            onBottomColorChange={handleBottomColorChange}
          />
          <main className="flex-grow flex flex-col p-4">
            <Routes>
              <Route path="/" element={<DrillPage appData={appData} setAppData={setAppData} />} />
              <Route path="/stats" element={<StatsPage appData={appData} setAppData={setAppData} />} />
              {/* Add a simple 404 or redirect? For now, defaults to DrillPage if no match */}
              <Route path="*" element={<DrillPage appData={appData} setAppData={setAppData} />} />
            </Routes>
          </main>
          {/* Footer links - adjust color */}
           <footer className="p-4 text-center text-sm text-slate-400">
             <Link to="/stats" className="hover:text-sky-400">View Stats</Link> | <a href="https://github.com/YardenNaveh/RubiksCubeTester" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400">GitHub</a>
           </footer>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App; 