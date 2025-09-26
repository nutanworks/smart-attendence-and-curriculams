import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onClose: () => void;
  onScan: (data: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // FIX: Initialize useRef with null to prevent its `current` property from being `undefined`.
  // This ensures type compatibility with `cancelAnimationFrame`.
  const requestRef = useRef<number | null>(null);
  const [scanStatus, setScanStatus] = useState<'scanning' | 'error' | 'loading'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isPermissionError, setIsPermissionError] = useState(false);

  // FIX: The callback for `requestAnimationFrame` receives a timestamp argument.
  // Adding it here to match the expected signature, even if it's unused, to resolve a potential signature mismatch error.
  const tick = useCallback((time: number) => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          onScan(code.data);
          return; // Stop scanning
        }
      }
    }
    requestRef.current = requestAnimationFrame(tick);
  }, [onScan]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
    }
  }, []);

  const enableCamera = useCallback(async () => {
    setScanStatus('loading');
    setErrorMessage('');
    setIsPermissionError(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
             setScanStatus('scanning');
             requestRef.current = requestAnimationFrame(tick);
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      let message = "Could not access the camera.";
      if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              message = "Camera access denied. Please grant permission in your browser settings.";
              setIsPermissionError(true);
          } else if (err.name === 'NotFoundError') {
              message = "No camera found on this device.";
          }
      }
      setErrorMessage(message);
      setScanStatus('error');
    }
  }, [tick]);

  useEffect(() => {
    enableCamera();
    return stopCamera;
  }, [enableCamera, stopCamera]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="relative w-full h-full max-w-2xl max-h-[60vh] bg-black rounded-lg overflow-hidden shadow-2xl">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />

        {scanStatus === 'scanning' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-4 border-dashed border-green-400 rounded-lg animate-pulse"></div>
            <p className="absolute bottom-4 text-center text-white bg-black bg-opacity-50 rounded px-2 py-1">Scanning for QR Code...</p>
          </div>
        )}
        {scanStatus === 'loading' && <p className="absolute inset-0 flex items-center justify-center text-white">Initializing Camera...</p>}
        {scanStatus === 'error' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-95 p-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-3">{isPermissionError ? 'Permission Denied' : 'Camera Error'}</h2>
                <p className="text-gray-300 mb-6">{errorMessage}</p>
                <button onClick={enableCamera} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500">Try Again</button>
            </div>
        )}

        <button onClick={onClose} className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-800 hover:bg-gray-200 z-10" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default QRScanner;