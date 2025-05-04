import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import DrillPage from './pages/DrillPage';
import StatsPage from './pages/StatsPage';
import { useAppStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import { useEffect } from 'react';
import { CubeColor } from './logic/cubeConstants';

function App() {
  const [appData, setAppData, resetStats] = useAppStorage();

  // Register the service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js') // Assuming sw.js is at the root after build
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
          // Optional: Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, prompt user to refresh
                  // console.log('New content is available; please refresh.');
                  // You could show a notification here
                }
              });
            }
          });
        }).catch(error => {
          console.error('Service Worker registration failed:', error);
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