import { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';

export default function QrScanner({ onScan, onError, onReady, active }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const [cameraError, setCameraError] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const stopScanner = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  const scanFrame = useCallback(() => {
    if (!videoRef.current || videoRef.current.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    if (!canvasRef.current) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });

    if (code?.data) {
      try {
        const parsed = JSON.parse(code.data);
        if (parsed?.ticketId && parsed?.accessCode) {
          stopScanner();
          onScan(parsed);
        } else if (typeof code.data === 'string' && code.data.length > 0) {
          stopScanner();
          onScan({ ticketId: code.data, accessCode: '' });
        }
      } catch {
        if (typeof code.data === 'string' && code.data.length > 0) {
          stopScanner();
          onScan({ ticketId: code.data, accessCode: '' });
        }
      }
      return;
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [onScan, stopScanner]);

  const startScanner = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const message = 'Camera access is not available in this browser';
      setCameraError(message);
      onError?.(message);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
      setCameraError('');
      setIsScanning(true);
      onReady?.();
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch (err) {
      const message = 'Unable to access camera. Please allow camera permission or use manual scan.';
      setCameraError(message);
      onError?.(message);
    }
  }, [onError, onReady, scanFrame]);

  useEffect(() => {
    if (!active) {
      stopScanner();
      return;
    }
    startScanner();
    return () => {
      stopScanner();
    };
  }, [active, startScanner, stopScanner]);

  return (
    <div className="qr-scanner-container">
      <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', maxWidth: '560px', borderRadius: '12px', background: '#000' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {cameraError && <div className="error" style={{ marginTop: '14px', maxWidth: '560px' }}>{cameraError}</div>}
      {isScanning && !cameraError && (
        <p className="qr-instructions">Point the camera at the ticket QR code. The scanner will read the ticket and verify it automatically.</p>
      )}
      {!isScanning && !cameraError && (
        <p className="qr-instructions">Tap Scan Ticket to start the camera. If the camera fails, use manual entry below.</p>
      )}
    </div>
  );
}
