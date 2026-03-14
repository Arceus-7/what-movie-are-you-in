import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, RefreshCw } from 'lucide-react';
import resultBg from '../assests2/result-bg.jfif';
import resultOverlay from '../assests2/result-overlay.png';

export default function SceneCard({ data, imageBase64, onReset }) {
  const cardRef = useRef(null);

  const getAccentColor = (genre) => {
    const g = genre.toLowerCase();
    if (g.includes('noir') || g.includes('thriller') || g.includes('sci-fi')) return 'var(--accent-blue)';
    if (g.includes('drama') || g.includes('comedy') || g.includes('indie')) return 'var(--accent-amber)';
    if (g.includes('horror') || g.includes('suspense')) return 'var(--accent-green)';
    if (g.includes('romance')) return 'var(--accent-pink)';
    return 'var(--accent-default)';
  };

  const accentColor = getAccentColor(data.genre);
  
  // Progress bar calculation
  const total = data.totalRuntime || 120;
  const current = data.minutesIn || 15;
  const progressPercent = Math.min(100, Math.max(0, (current / total) * 100));

  const handleShare = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // High DPI
        backgroundColor: '#050505',
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `${data.movieTitle.replace(/\s+/g, '_').toLowerCase()}_scene.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error generating card image:', err);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      padding: '2rem 1rem',
      width: '100%',
      minHeight: '100vh',
      backgroundImage: `url(${resultBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative'
    }}>
      {/* Dark overlay to ensure card stands out from background */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', pointerEvents: 'none', zIndex: 0 }} />
      
      {/* Required for grain effect to work in canvas / CSS */}
      <svg style={{ display: 'none' }}>
        <filter id="cinematic-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.1 0" />
        </filter>
      </svg>

      {/* The exportable card wrapper */}
      <div 
        ref={cardRef}
        style={{
          width: '100%',
          maxWidth: '430px', /* slight width increase to handle border overlay */
          backgroundColor: '#050505',
          border: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
          overflow: 'hidden',
          paddingBottom: '2rem',
          zIndex: 10
        }}
      >
        {/* CSS Grain Overlay for entire card */}
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 50,
          opacity: 0.15,
          filter: 'url(#cinematic-grain)',
          mixBlendMode: 'overlay'
        }} />

        {/* Photo Header */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', backgroundColor: 'black' }}>
          <img 
            src={imageBase64} 
            alt="Captured scene" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Letterbox overlay for the photo */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '12%', background: 'black' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '12%', background: 'black' }} />
          </div>
          {/* Grungy Photo Frame Overlay */}
          <img 
            src={resultOverlay} 
            crossOrigin="anonymous" /* important for html2canvas */
            alt="Result Grunge Overlay" 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              width: '100%', 
              height: '100%', 
              objectFit: 'fill', 
              pointerEvents: 'none', 
              zIndex: 15, 
              opacity: 0.95 
            }} 
          />
        </div>

        {/* Card Content */}
        <div style={{ padding: '2rem 1.5rem', position: 'relative', zIndex: 20 }}>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 className="title-font" style={{ 
              fontSize: '2.5rem', 
              lineHeight: '1',
              color: 'white',
              marginBottom: '0.25rem',
              wordWrap: 'break-word'
            }}>
              {data.movieTitle}
            </h2>
            <p style={{ color: accentColor, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              DIR. {data.director} — {data.country}, {data.year}
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
              <span>{data.genre.toUpperCase()}</span>
              <span>{current} / {total} MIN</span>
            </div>
            
            {/* Film strip progress bar */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ width: `${progressPercent}%`, background: accentColor, height: '100%', borderRight: '1px solid black' }} />
              {/* Fake frame dividers */}
              <div style={{ position: 'absolute', left: '1.5rem', right: '1.5rem', height: '6px', top: 'calc(1.5rem + 2.5rem + 1rem + 2rem + 1.5rem + 1px)', pointerEvents: 'none', display: 'flex', justifyContent: 'space-between' }}>
                {[...Array(20)].map((_, i) => (
                   <div key={i} style={{ width: '1px', height: '100%', background: 'rgba(0,0,0,0.5)' }} />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem', lineHeight: '1.5', color: 'rgba(255,255,255,0.85)' }}>
            <div>
              <strong style={{ color: 'white', display: 'block', marginBottom: '0.2rem', fontSize: '0.8rem', letterSpacing: '0.05em' }}>THE DEAL</strong>
              <p>{data.characterDescription}</p>
            </div>
            
            <div>
              <strong style={{ color: 'white', display: 'block', marginBottom: '0.2rem', fontSize: '0.8rem', letterSpacing: '0.05em' }}>JUST HAPPENED</strong>
              <p>{data.whatJustHappened}</p>
            </div>

            <div>
              <strong style={{ color: 'white', display: 'block', marginBottom: '0.2rem', fontSize: '0.8rem', letterSpacing: '0.05em' }}>ABOUT TO HAPPEN</strong>
              <p>{data.whatIsAboutToHappen}</p>
            </div>

            <div style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderLeft: `3px solid ${accentColor}`, marginTop: '0.5rem', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <strong style={{ color: 'white', display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', letterSpacing: '0.05em' }}>CINEMATOGRAPHY NOTE</strong>
              <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>"{data.cinematographyNote}"</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: accentColor, fontSize: '0.8rem' }}>
              <span style={{ fontSize: '1rem' }}>♪</span> {data.songPlaying}
            </div>
          </div>

        </div>
      </div>

      {/* Actions (Outside Card, won't be captured) */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button className="cinematic-button" onClick={handleShare}>
          <Download size={18} />
          Save Stills
        </button>
        <button className="cinematic-button" onClick={onReset}>
          <RefreshCw size={18} />
          Another Scene
        </button>
      </div>

    </div>
  );
}
