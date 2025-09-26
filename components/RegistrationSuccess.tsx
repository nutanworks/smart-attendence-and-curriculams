import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { User } from '../types';
import { DownloadIcon } from './icons';

interface RegistrationSuccessProps {
  user: User;
  onProceed: () => void;
}

const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({ user, onProceed }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const userType = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, user.id, { width: 200, margin: 2 }, (error: any) => {
        if (error) console.error('Error generating QR code:', error);
      });
    }
  }, [user.id]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `${user.id}-qr-code.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center text-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-green-600 mb-4">{userType} Registered Successfully!</h1>
        <p className="text-gray-700 mb-6">The following credentials have been generated for <span className="font-semibold">{user.name}</span>. Please save them securely.</p>
        
        <div className="space-y-4 mb-6 text-left">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">New {userType} ID:</p>
              <p className="text-2xl font-bold text-indigo-700 tracking-wider select-all">{user.id}</p>
            </div>
            {user.password && (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">{user.role === 'student' ? 'Temporary Password:' : 'Password:'}</p>
                <p className="text-2xl font-bold text-red-700 select-all">{user.password}</p>
              </div>
            )}
        </div>

        <div className="mb-8 flex flex-col items-center">
            <canvas ref={canvasRef} className="rounded-lg shadow-md border"></canvas>
            <button onClick={handleDownload} className="mt-4 inline-flex items-center px-4 py-2 text-sm btn-secondary">
                <DownloadIcon className="w-5 h-5 mr-2" />
                Download QR Code
            </button>
        </div>
        
        <button onClick={onProceed} className="w-full max-w-xs mx-auto py-3 px-4 btn-primary">
          Done
        </button>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        .btn-primary {
            background-color: #4f46e5; color: white; font-weight: 600; border-radius: 0.375rem;
            transition: background-color 0.2s;
        }
        .btn-primary:hover { background-color: #4338ca; }
        .btn-secondary {
            background-color: #eef2ff; color: #4338ca; font-weight: 600; border-radius: 0.375rem;
            transition: background-color 0.2s;
        }
        .btn-secondary:hover { background-color: #e0e7ff; }
      `}</style>
    </div>
  );
};

export default RegistrationSuccess;