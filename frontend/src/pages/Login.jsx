import React from 'react';
import { Landmark, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const Login = ({ setislogin }) => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 flex selection:bg-[#5B0A1C] selection:text-white">
      {/* --- Left Side: Premium Branding --- */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-slate-900 p-12 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#5B0A1C]/40 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-10 -right-20 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        </div>
        
        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-[#5B0A1C] p-2.5 rounded-xl shadow-lg border border-[#7D0E26]">
            <Landmark className="text-amber-400 w-6 h-6" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-black tracking-tighter text-white">
              MY<span className="text-slate-400">BANK</span>
            </span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-6 mt-20 flex-1 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-amber-400 text-xs font-bold uppercase tracking-widest w-fit shadow-md">
            <ShieldCheck size={14} /> Secure Portal
          </div>
          <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
            Welcome back to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Premium Banking.</span>
          </h1>
          <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
            Access your institutional-grade dashboard with multi-factor verification and real-time fraud monitoring.
          </p>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex justify-between">
          <span>© 2026 MyBank</span>
          <span>Encrypted Connection 256-bit</span>
        </div>
      </div>

      {/* --- Right Side: Login Form --- */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 relative bg-white">
        {/* Mobile Logo (hidden on large screens) */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-3">
          <div className="bg-gradient-to-tr from-[#5B0A1C] to-[#831028] p-2 rounded-lg">
            <Landmark className="text-amber-400 w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tighter text-[#5B0A1C]">
            MY<span className="text-slate-800">BANK</span>
          </span>
        </div>

        <div className="w-full max-w-md space-y-8 z-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-slate-500 font-medium text-sm">Enter your credentials to access your account.</p>
          </div>

          <LoginForm setislogin={setislogin} />

          {/* Signup Link */}
          <p className="text-center text-sm font-medium text-slate-500 pt-4 border-t border-slate-100">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#5B0A1C] font-bold hover:underline transition-colors hover:text-amber-600">
              Register now
            </Link>
          </p>
 
          {/* Back to Home Link */}
          <div className="text-center mt-2">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-[#5B0A1C] transition-colors duration-200 group">
              <span className="mr-1 group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
