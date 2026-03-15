import { useRef, useEffect, useState } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

export default function CameraView({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable', err);
        setError('Camera not available. Please upload a photo instead.');
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Make sure to clean up stream on component unmount
  useEffect(() => {
    return () => {
      setStream(s => {
        if (s) s.getTracks().forEach(track => track.stop());
        return null;
      });
    }
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Resize high-res mobile cameras to prevent Netlify 6MB payload limit errors
    const MAX_WIDTH = 1280;
    let pWidth = video.videoWidth;
    let pHeight = video.videoHeight;
    
    if (pWidth > MAX_WIDTH) {
      pHeight = Math.floor((pHeight * MAX_WIDTH) / pWidth);
      pWidth = MAX_WIDTH;
    }
    
    // Set canvas dimensions
    canvas.width = pWidth;
    canvas.height = pHeight;
    
    const ctx = canvas.getContext('2d');
    
    // Draw the current video frame
    ctx.drawImage(video, 0, 0, pWidth, pHeight);
    
    // Convert to target cinematic view (desaturate & grain)
    processImage(ctx, pWidth, pHeight);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(dataUrl);
  };

  const processImage = (ctx, width, height) => {
    // Basic desaturation
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; // reduce saturation by overlaying semi-transparent black in color mode
    ctx.fillRect(0, 0, width, height);
    
    // Apply some pseudo grain
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(100,100,100,0.1)'; 
    ctx.fillRect(0, 0, width, height);
    
    ctx.globalCompositeOperation = 'source-over';
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if(!canvas) return;
        
        // Resize large images
        const MAX_WIDTH = 1280;
        let pWidth = img.width;
        let pHeight = img.height;
        if (pWidth > MAX_WIDTH) {
          pHeight = Math.floor((pHeight * MAX_WIDTH) / pWidth);
          pWidth = MAX_WIDTH;
        }

        canvas.width = pWidth;
        canvas.height = pHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, pWidth, pHeight);
        processImage(ctx, pWidth, pHeight);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', backgroundColor: 'black' }}>
      
      {!error && (
        <div className="letterbox" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }} 
          />
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ color: 'var(--accent-amber)', marginBottom: '2rem' }}>{error}</p>
        </div>
      )}

      {/* Hidden Canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileUpload} 
      />

      {/* Controls */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '0',
        right: '0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2rem',
        zIndex: 20
      }}>
        <button 
          onClick={onCancel}
          style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '1rem' }}
        >
          <X size={28} />
        </button>

        {!error && (
          <button 
            onClick={handleCapture}
            style={{ 
              width: '70px', 
              height: '70px', 
              borderRadius: '50%', 
              background: 'transparent',
              border: '4px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'white' }} />
          </button>
        )}

        <button 
          onClick={() => fileInputRef.current?.click()}
          style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '1rem' }}
        >
          <ImageIcon size={28} />
        </button>
      </div>

    </div>
  );
}
