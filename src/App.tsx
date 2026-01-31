import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import DrillPage from './pages/DrillPage';
import StatsPage from './pages/StatsPage';
import F2LNinjaPage from './pages/F2LPage';
import F2LStatsPage from './pages/F2LStatsPage';
import { useAppStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import { useEffect } from 'react';
import { BottomColorSetting } from './hooks/useLocalStorage';
import './App.css';

function FooterNav() {
  const location = useLocation();
  const path = location.pathname;

  const isF2L = path.startsWith('/f2l');
  const isF2LStats = path === '/f2l/stats';
  const isColorStats = path === '/stats';

  if (isF2L) {
    return (
      <footer className="p-4 text-center text-sm text-slate-400">
        {isF2LStats ? (
          <Link to="/f2l" className="hover:text-sky-400">Back to F2L</Link>
        ) : (
          <Link to="/f2l/stats" className="hover:text-sky-400">View F2L Stats</Link>
        )}
      </footer>
    );
  }

  return (
    <footer className="p-4 text-center text-sm text-slate-400">
      {isColorStats ? (
        <Link to="/color-sensei" className="hover:text-sky-400">Back to Color Sensei</Link>
      ) : (
        <Link to="/stats" className="hover:text-sky-400">View Color Sensei Stats</Link>
      )}
    </footer>
  );
}

function App() {
  const [appData, setAppData] = useAppStorage();

  useEffect(() => {
    // Register service worker only in production
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then(registration => {
          // Proactively check for an updated SW
          registration.update().catch(() => {});

          // If there’s already a waiting SW, activate it now.
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          });

          // Reload once when the new SW takes control so clients pick up the latest assets.
          let hasRefreshed = false;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (hasRefreshed) return;
            hasRefreshed = true;
            window.location.reload();
          });
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

  const handleBottomColorChange = (newColor: BottomColorSetting) => {
    setAppData(prev => ({
      ...prev,
      settings: { ...prev.settings, bottomColor: newColor },
    }));
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
              <Route path="/" element={<Navigate to="/color-sensei" replace />} />
              <Route path="/color-sensei" element={<DrillPage appData={appData} setAppData={setAppData} />} />
              <Route path="/f2l" element={<F2LNinjaPage appData={appData} />} />
              <Route path="/f2l/stats" element={<F2LStatsPage />} />
              <Route path="/stats" element={<StatsPage appData={appData} setAppData={setAppData} />} />
              <Route path="*" element={<Navigate to="/color-sensei" replace />} />
            </Routes>
          </main>
          <FooterNav />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App; 