import React from 'react';

interface WelcomeProps {
  onGetStarted: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex flex-col justify-center items-center p-4 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10">
        {/* Animated background shapes */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-xl animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-500 rounded-full mix-blend-screen filter blur-xl animate-blob animation-delay-4000"></div>
      </div>
      
      <main className="z-10 text-center animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
          Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">SmartClass</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-300">
          The intelligent platform for modernizing attendance, optimizing schedules, and empowering student success through personalized learning.
        </p>
        <button
          onClick={onGetStarted}
          className="mt-10 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110 transition-all duration-300 ease-in-out"
        >
          Get Started
        </button>
      </main>

      <footer className="absolute bottom-4 text-gray-400 text-sm z-10">
        © {new Date().getFullYear()} SmartClass Inc. All rights reserved.
      </footer>
      
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Welcome;
