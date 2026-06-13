import React from 'react';
import { Landmark, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import SignupForm from '../components/SignupForm';

const Signup = ({ setislogin }) => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 flex selection:bg-[#5B0A1C] selection:text-white">
      {/* --- Left Side: Premium Branding --- */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-[#5B0A1C] p-12 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute -bottom-20 -left-20 w-[40rem] h-[40rem] bg-rose-900/50 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute top-10 -right-20 w-[30rem] h-[30rem] bg-amber-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white p-2.5 rounded-xl shadow-lg border border-slate-100">
            <Landmark className="text-[#5B0A1C] w-6 h-6" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-black tracking-tighter text-white">
              MY<span className="text-amber-400">BANK</span>
            </span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-6 mt-20 flex-1 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest w-fit shadow-md animate-pulse">
            <ShieldCheck size={14} className="text-amber-400" /> Platinum Access
          </div>
          <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
            Create your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Legacy.</span>
          </h1>
          <p className="text-rose-100 font-medium leading-relaxed max-w-sm text-sm">
            Join the elite circle of individuals who trust us with their financial future. Experience banking reimagined with state-of-the-art security and intelligent insights.
          </p>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em] text-rose-200 flex justify-between opacity-80">
          <span>© 2026 MyBank</span>
          <span>Regulated Institution</span>
        </div>
      </div>

      {/* --- Right Side: Registration Form --- */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 relative bg-white overflow-y-auto">
        {/* Mobile Logo */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-3">
          <div className="bg-gradient-to-tr from-[#5B0A1C] to-[#831028] p-2 rounded-lg">
            <Landmark className="text-amber-400 w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tighter text-[#5B0A1C]">
            MY<span className="text-slate-800">BANK</span>
          </span>
        </div>

        <div className="w-full max-w-[500px] z-10 my-auto py-10">
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sign Up</h2>
            <p className="text-slate-500 font-medium text-sm">Complete your profile to unlock premium banking services.</p>
          </div>

          <SignupForm setislogin={setislogin} />

          {/* Login Link */}
          <p className="text-center text-sm font-medium text-slate-500 pt-6 mt-6 border-t border-slate-100">
            Already have an account?{' '}
            <Link to="/login" className="text-[#5B0A1C] font-bold hover:underline transition-colors hover:text-amber-600">
              Sign in securely
            </Link>
          </p>
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

export default Signup;