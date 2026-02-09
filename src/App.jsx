import { useState, useEffect } from 'react';
import './index.css';
import KidsHome from './components/KidsHome';
import ParentDashboard from './components/ParentDashboard';
import ParentLogin from './components/ParentLogin';
import { checkWeeklyReset, getParentPassword } from './utils/storage';

function App() {
  const [mode, setMode] = useState('kids'); // 'kids' or 'parent'
  const [isParentAuthenticated, setIsParentAuthenticated] = useState(false);
  const [lastSynced, setLastSynced] = useState(Date.now());

  useEffect(() => {
    // Check for weekly reset on app load
    const wasReset = checkWeeklyReset();
    if (wasReset) {
      console.log('Weekly reset performed!');
    }

    // Listen for background sync updates
    const handleSyncUpdate = () => {
      console.log('Data updated from server, refreshing UI...');
      // Force update by just toggling a dummy state or similar?
      // Actually, since we pass 'mode' and rely on components to load data on mount, 
      // we might need to force them to reload.
      // Easiest is to force a re-mount of the view, or rely on components listening.
      // For now, let's reload the window if it's idle? No.
      // Let's rely on the user navigating or refreshing for full state, OR
      // Pass a 'lastUpdated' prop to children to force re-render.
      setLastSynced(Date.now());
    };

    window.addEventListener('kidsTaskTracker_data_updated', handleSyncUpdate);
    return () => window.removeEventListener('kidsTaskTracker_data_updated', handleSyncUpdate);
  }, []);

  const handleParentModeClick = () => {
    // Always go to login - the ParentLogin component handles "Set Password" vs "Login"
    setMode('parent-login');
  };

  const handleParentLogin = (success) => {
    if (success) {
      setIsParentAuthenticated(true);
      setMode('parent');
    }
  };

  const handleBackToKids = () => {
    setIsParentAuthenticated(false);
    setMode('kids');
  };

  return (
    <div className="app">
      {mode === 'kids' && (
        <>
          <KidsHome />
          <button
            onClick={handleParentModeClick}
            className="parent-mode-btn"
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '2px solid #ddd',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              fontSize: '24px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            👨‍👩‍👧‍👦
          </button>
        </>
      )}

      {mode === 'parent-login' && (
        <ParentLogin
          onLogin={handleParentLogin}
          onBack={handleBackToKids}
        />
      )}

      {mode === 'parent' && isParentAuthenticated && (
        <ParentDashboard onBack={handleBackToKids} />
      )}
    </div>
  );
}

export default App;
