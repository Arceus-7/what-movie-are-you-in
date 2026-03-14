import { Camera, Film } from 'lucide-react';
import landingBg from '../assests2/landing-bg.jfif';

export default function Landing({ onStart, onOpenArchive }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '2rem',
      textAlign: 'center',
      backgroundImage: `url(${landingBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative'
    }}>
      {/* Dark tint overlay for text readability against grunge background */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 className="title-font" style={{ 
        fontSize: '4rem', 
        marginBottom: '1rem',
        letterSpacing: '0.05em'
      }}>
        What Movie Are You In<br/>Right Now
      </h1>
      
      <p style={{ 
        color: 'var(--accent-default)', 
        marginBottom: '3rem',
        fontSize: '1.1rem',
        maxWidth: '400px',
        lineHeight: '1.6'
      }}>
        Take a photo of wherever you are. Find out exactly what scene you're in.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'center' }}>
        <button 
          className="cinematic-button" 
          onClick={onStart}
          style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
        >
          <Camera size={24} />
          Take a photo of right now
        </button>

        <button 
          className="cinematic-button" 
          onClick={onOpenArchive}
          style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', border: 'none', color: 'var(--accent-default)' }}
        >
          <Film size={18} />
          View Film Diary
        </button>
      </div>
    </div>
  </div>
  );
}
