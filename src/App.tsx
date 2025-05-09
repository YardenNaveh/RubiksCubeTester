import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
  // Navigate, // No longer needed if / is the direct DrillPage route
} from 'react-router-dom';
import DrillPage from './pages/DrillPage';
import StatsPage from './pages/StatsPage';
import { useAppStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import { useEffect } from 'react';
import { CubeColor } from './logic/cubeConstants';
import './App.css';

// Define a RootLayout component that includes the common structure
const RootLayout: React.FC<{
  appData: ReturnType<typeof useAppStorage>[0];
  toggleMute: () => void;
  handleBottomColorChange: (newColor: CubeColor) => void;
}> = ({ appData, toggleMute, handleBottomColorChange }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center font-sans">
      <div className="w-full max-w-md flex-grow flex flex-col">
        <Header 
          isMuted={appData.settings.muted} 
          onToggleMute={toggleMute}
          currentBottomColor={appData.settings.bottomColor}
          onBottomColorChange={handleBottomColorChange}
        />
        <main className="flex-grow flex flex-col p-4">
          <Outlet /> {/* Child routes will render here */}
        </main>
        <footer className="p-4 text-center text-sm text-slate-400">
            <Link to="/stats" className="hover:text-sky-400">View Stats</Link>
        </footer>
      </div>
    </div>
  );
};

function App() {
  const [appData, setAppData] = useAppStorage();

  useEffect(() => {
    // Register service worker only in production
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then(registration => {
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
  };

  // Define routes using the new structure
  const router = createBrowserRouter([
    {
      element: (
        <RootLayout 
          appData={appData} 
          toggleMute={toggleMute} 
          handleBottomColorChange={handleBottomColorChange} 
        />
      ),
      // Define children routes that will render inside RootLayout's <Outlet />
      children: [
        {
          path: "/",
          element: <DrillPage appData={appData} setAppData={setAppData} />,
        },
        {
          path: "/stats",
          element: <StatsPage appData={appData} setAppData={setAppData} />,
        },
        {
          path: "*", // Splat route for 404 or fallback
          element: <DrillPage appData={appData} setAppData={setAppData} />, // Defaulting to DrillPage as per user's last change
        },
      ],
    }
  ], {
    basename: import.meta.env.BASE_URL,
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    } as any, // Using 'as any' to bypass potential TypeScript type mismatch for future flags
  });

  return <RouterProvider router={router} />;
}

export default App; 