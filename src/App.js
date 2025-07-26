import { useState, useEffect } from 'react';
import Game from './components/Game';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    const storedToken = localStorage.getItem('spotify_access_token');
    const expiresAt = localStorage.getItem('spotify_token_expires_at');

    if (storedToken && new Date().getTime() < expiresAt) {
      setAccessToken(storedToken);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    const expiresIn = params.get('expires_in');

    if (token) {
      const expiryTime = new Date().getTime() + expiresIn * 1000;
      localStorage.setItem('spotify_access_token', token);
      localStorage.setItem('spotify_token_expires_at', expiryTime);
      setAccessToken(token);
      window.history.pushState({}, document.title, "/");
    }

    return () => clearTimeout(bootTimer);
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/spotify?action=login';
  };

  const handleLogout = () => {
    setAccessToken(null);
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expires_at');
  };

  const isAuthenticated = !!accessToken;

  return (
    <div className="dark-container">
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-5xl title-text mb-6">STATIFY</h1>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      ) : !isAuthenticated ? (
        <div className="flex flex-col items-center justify-center h-screen px-4">
          <div className="max-w-md w-full text-center">
            <h1 className="text-6xl title-text mb-3">STATIFY</h1>
            <p className="text-gray-400 mb-8">Test your knowledge of music popularity</p>
            
            <div className="dark-card mb-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm font-mono text-gray-400 mb-1">1</p>
                  <p className="text-xs text-gray-500">Pick Songs</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-mono text-gray-400 mb-1">2</p>
                  <p className="text-xs text-gray-500">Guess Popularity</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-mono text-gray-400 mb-1">3</p>
                  <p className="text-xs text-gray-500">Score Points</p>
                </div>
              </div>
              
              <button
                onClick={handleLogin}
                className="dark-button w-full rounded"
              >
                Connect Spotify
              </button>
            </div>
            
            <p className="text-xs text-gray-600">
              Powered by Spotify Web API
            </p>
          </div>
        </div>
        ) : (
          <div className="flex flex-col min-h-screen">
            <header className="nav-header px-6 py-4">
              <div className="flex justify-between items-center max-w-7xl mx-auto">
                <h1 className="text-3xl title-text">STATIFY</h1>
                <button
                  onClick={handleLogout}
                  className="nav-button"
                >
                  Logout
                </button>
              </div>
            </header>
            <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10">
              <Game accessToken={accessToken} />
            </div>
          </div>
        )}
    </div>
  );
}

export default App;