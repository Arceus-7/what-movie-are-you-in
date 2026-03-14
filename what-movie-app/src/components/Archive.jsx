import { X } from 'lucide-react';

export default function Archive({ onClose, onSelect }) {
  const historyRaw = localStorage.getItem('movie_scene_history');
  const history = historyRaw ? JSON.parse(historyRaw) : [];

  return (
    <div className="modal-overlay" style={{ background: 'var(--bg-color)', zIndex: 100 }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '800px', height: '100%', overflowY: 'auto', padding: '2rem' }}>
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          <X size={32} />
        </button>

        <h2 className="title-font" style={{ fontSize: '3rem', marginBottom: '2rem' }}>Film Diary</h2>

        {history.length === 0 && (
          <p style={{ color: 'var(--accent-default)' }}>No scenes developed yet.</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem' }}>
          {history.map((item, id) => (
            <div 
              key={id} 
              onClick={() => onSelect(item)}
              style={{
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'white'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            >
              <div style={{ aspectRatio: '4/3', overflow: 'hidden', position: 'relative' }}>
                <img src={item.imageBase64} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="letterbox" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
              </div>
              <div style={{ padding: '1rem', background: '#0a0a0a' }}>
                <h3 className="title-font" style={{ fontSize: '1.2rem', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.data.movieTitle}
                </h3>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                  {item.data.genre.split(',')[0]}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>
                  {new Date(item.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
