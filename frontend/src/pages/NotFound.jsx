import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6 selection:bg-[#5B0A1C] selection:text-white">
      <div className="bg-rose-100 p-4 rounded-full mb-8 shadow-sm">
        <AlertCircle className="w-16 h-16 text-[#5B0A1C]" />
      </div>
      <h1 className="text-7xl lg:text-9xl font-black text-slate-900 tracking-tight mb-4">404</h1>
      <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-6">Page Not Found</h2>
      <p className="text-slate-500 max-w-md mx-auto mb-10 text-lg">
        The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
      </p>
      <Link 
        to="/" 
        className="flex items-center gap-2 px-8 py-3.5 bg-[#5B0A1C] text-white rounded-lg font-bold text-lg shadow-lg hover:bg-[#420714] transition-all hover:-translate-y-1"
      >
        <Home size={20} /> Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
