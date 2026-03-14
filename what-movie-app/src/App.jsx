import { useState, useEffect } from 'react';
import { Howl } from 'howler';
import Landing from './components/Landing';
import CameraView from './components/CameraView';
import SceneCard from './components/SceneCard';
import Archive from './components/Archive';
import { analyzeImage } from './utils/gemini';
import { Film as FilmIcon } from 'lucide-react';

function App() {
  const [view, setView] = useState('landing'); // 'landing', 'camera', 'loading', 'result'
  const [imageBase64, setImageBase64] = useState(null);
  const [sceneData, setSceneData] = useState(null);
  const [error, setError] = useState(null);
  const [showArchive, setShowArchive] = useState(false);

  // Audio setup
  const [clickSound, setClickSound] = useState(null);
  const [reelSound, setReelSound] = useState(null);

  useEffect(() => {
    // Initialize audio locally with a valid 1-sample silent WAV to prevent 404s and DOM base64 decode errors
    const silentWav = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
    const click = new Howl({
      src: [silentWav], 
      volume: 0.5
    });
    const reel = new Howl({
      src: [silentWav], 
      loop: true,
      volume: 0.3
    });
    
    setClickSound(click);
    setReelSound(reel);
  }, []);

  const handleStart = () => {
    setView('camera');
  };

  const handleCapture = async (dataUrl) => {
    setImageBase64(dataUrl);
    setView('loading');
    setError(null);
    
    // Play Reel Sound
    if(reelSound) reelSound.play();

    try {
      const result = await analyzeImage(dataUrl);
      setSceneData(result);
      
      // Save to history (keep last 5)
      const newItem = { timestamp: Date.now(), imageBase64: dataUrl, data: result };
      const rawHistory = localStorage.getItem('movie_scene_history');
      let history = rawHistory ? JSON.parse(rawHistory) : [];
      history = [newItem, ...history].slice(0, 5);
      localStorage.setItem('movie_scene_history', JSON.stringify(history));

      // Stop Reel Sound
      if(reelSound) reelSound.stop();
      // Play Projector Click
      if(clickSound) clickSound.play();
      
      setView('result');
    } catch (err) {
      console.error(err);
      let errMsg = 'Failed to develop scene. Check API key or try again.';
      if (err?.message) {
        errMsg += ' (' + err.message + ')';
      }
      setError(errMsg);
      // Keep view as 'loading' to display the error
      if(reelSound) reelSound.stop();
    }
  };

  const handleReset = () => {
    setImageBase64(null);
    setSceneData(null);
    setError(null);
    setView('landing');
  };

  return (
    <>
      {showArchive && (
        <Archive 
          onClose={() => setShowArchive(false)}
          onSelect={(item) => {
            setImageBase64(item.imageBase64);
            setSceneData(item.data);
            setView('result');
            setShowArchive(false);
          }}
        />
      )}
      
      <main>
        {view === 'landing' && <Landing onStart={handleStart} onOpenArchive={() => setShowArchive(true)} />}
        
        {view === 'camera' && (
          <CameraView 
            onCapture={handleCapture} 
            onCancel={() => setView('landing')} 
          />
        )}
        
        {view === 'loading' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            textAlign: 'center'
          }}>
            {!error && <FilmIcon size={64} style={{ animation: 'spin 2s linear infinite', color: 'var(--accent-default)', marginBottom: '2rem' }} />}
            <style>{`
              @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
            <h2 className="title-font" style={{ fontSize: '2rem', letterSpacing: '0.1em' }}>
              {error ? 'Development Failed' : 'Developing...'}
            </h2>
            {error && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1rem' }}>
                <p style={{ color: 'var(--accent-amber)', maxWidth: '80%', lineHeight: '1.5' }}>{error}</p>
                <button 
                  className="cinematic-button" 
                  onClick={() => { setError(null); setView('camera'); }} 
                  style={{ marginTop: '2rem' }}
                >
                  Go Back
                </button>
              </div>
            )}
          </div>
        )}

        {view === 'result' && sceneData && (
          <SceneCard data={sceneData} imageBase64={imageBase64} onReset={handleReset} />
        )}
      </main>
    </>
  );
}

export default App;
