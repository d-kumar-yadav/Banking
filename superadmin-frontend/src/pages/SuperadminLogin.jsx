import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import SuperadminLoginForm from '../components/SuperadminLoginForm';

const SuperadminLogin = ({ setislogin_superadmin }) => {
  return (
    <div className="min-h-screen bg-slate-900 font-sans text-white flex justify-center items-center p-4 relative overflow-hidden selection:bg-amber-500 selection:text-slate-900">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-[#5B0A1C]/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-slate-200/20">
        
        {/* Header Section */}
        <div className="bg-[#5B0A1C] p-8 text-center relative overflow-hidden">
           {/* Pattern overlays */}
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
           
           <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="bg-white/10 p-4 rounded-xl shadow-inner border border-white/20 backdrop-blur-sm">
                <ShieldCheck className="text-amber-400 w-10 h-10" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">System Portal</h1>
                <p className="text-rose-200/80 text-sm font-medium mt-1">Authorized Access Only</p>
              </div>
           </div>
        </div>

        {/* Form Section */}
        <div className="p-8 sm:p-10">
          <SuperadminLoginForm setislogin_superadmin={setislogin_superadmin} />
          
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <Link to="/" className="text-sm font-bold text-slate-500 hover:text-[#5B0A1C] transition-colors flex justify-center items-center gap-2">
               ← Return to Portal Select
            </Link>
          </div>
          <div className="text-center mt-2">
            <a href="https://mybank-106.vercel.app" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-[#5B0A1C] transition-colors duration-200 group">
              <span className="mr-1 group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Customer Website
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SuperadminLogin;
