import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { User } from "../types";

interface MyQRCodeModalProps {
  user: User;
  onClose: () => void;
}

const MyQRCodeModal: React.FC<MyQRCodeModalProps> = ({ user, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const idType = user.role.charAt(0).toUpperCase() + user.role.slice(1) + ' ID';


  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        user.id,
        { width: 256, margin: 2 },
        (error) => {
          if (error) {
            console.error("Error generating QR code:", error);
          }
        }
      );
    }
  }, [user.id]);

  // Download QR as PNG
  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = `${user.id}-qrcode.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-lg shadow-2xl p-8 max-w-sm w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2">My {idType}</h2>

        <div className="mt-6 mb-8 flex flex-col items-center">
          <canvas
            ref={canvasRef}
            className="rounded-lg shadow-md border"
          ></canvas>
          <p className="text-lg font-semibold text-gray-800 mt-4">
            {user.name}
          </p>
          <p className="text-md text-gray-500 tracking-wider">{user.id}</p>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
        >
          Close
        </button>
        <button
          onClick={handleDownload}
          className="w-full mt-2 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors"
        >
          Download QR Code
        </button>
      </div>
    </div>
  );
};

export default MyQRCodeModal;