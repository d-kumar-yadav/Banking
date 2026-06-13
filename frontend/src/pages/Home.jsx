import React from 'react';
import { ShieldCheck, UserCircle, Settings, ArrowRight, Landmark, Zap, BarChart3, Globe, Fingerprint, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 selection:bg-[#5B0A1C] selection:text-white">
      
   

      {/* --- Premium Navbar --- */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 px-10 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-[#5B0A1C] to-[#831028] p-2.5 rounded-xl shadow-lg shadow-rose-900/20">
            <Landmark className="text-amber-400 w-6 h-6" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-black tracking-tighter text-[#5B0A1C]">
              MY<span className="text-slate-800">BANK</span>
            </span>
            <span className="text-[8px] font-bold tracking-[0.4em] text-amber-600 mt-1 uppercase">Advanced Financial Systems</span>
          </div>
        </div>

        <div className="hidden lg:flex gap-12 font-bold text-slate-600 text-[12px] tracking-widest">
          {["ACCOUNTS", "CARDS", "LOANS", "INVEST"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-[#5B0A1C] transition-all relative group py-1">
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 transition-all group-hover:w-full"></span>
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <Link to="/signup" className="px-7 py-2.5 bg-[#5B0A1C] text-white font-bold rounded-lg hover:bg-[#420714] shadow-[0_10px_20px_-10px_rgba(91,10,28,0.5)] transition-all hover:-translate-y-0.5 text-sm">
            SIGN UP
          </Link>
          <Link to="/login" className="px-6 py-2.5 text-[#5B0A1C] font-bold border-2 border-transparent hover:border-[#5B0A1C] rounded-lg hover:bg-rose-50 transition-all text-sm">
            LOGIN
          </Link>
          <div className="h-6 w-px bg-slate-200 mx-1 hidden lg:block"></div>
          <Link to="/Admin-login" className="hidden lg:flex group px-6 py-2.5 bg-slate-900 text-amber-400 font-bold rounded-lg hover:bg-black hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-10px_rgba(245,158,11,0.4)] hover:border-amber-500/50 transition-all duration-300 text-sm shadow-md items-center gap-2 border border-slate-700">
            <Settings size={16} className="group-hover:rotate-90 transition-transform duration-500" /> ADMIN
          </Link>
        </div>
      </nav>

      {/* --- High-Value Hero Section --- */}
      <header className="relative bg-white pt-24 pb-36 px-10 overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-[48%] h-full bg-slate-50 skew-x-[-10deg] origin-top translate-x-16 -z-10 border-l border-slate-100"></div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-[140px] -z-10"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-lg border-l-4 border-amber-500 shadow-sm text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <Fingerprint size={14} className="text-amber-500" /> Biometric Identity Verification Active
            </div>
            
            <h1 className="text-7xl lg:text-8xl font-black leading-[0.95] text-slate-900 tracking-tighter">
              Banking <br />
              <span className="text-[#5B0A1C]">Perfected.</span>
            </h1>
            
            <p className="text-lg text-slate-500 max-w-md leading-relaxed font-medium border-l-2 border-amber-500/30 pl-6 italic">
              Leveraging neural networks to provide institutional-grade security, 
              real-time fraud prevention, and instant credit decisions.
            </p>
            
            <div className="flex flex-wrap gap-6 pt-4">
              <button className="px-12 py-5 bg-[#5B0A1C] text-white rounded-xl font-bold text-lg shadow-[0_20px_40px_-10px_rgba(91,10,28,0.4)] hover:bg-[#420714] transition-all transform hover:-translate-y-1 flex items-center gap-3">
                Get Started <ArrowRight size={20} className="text-amber-400" />
              </button>
            </div>
          </div>

          {/* Neural Fraud Shield Visualization */}
          <div className="relative group">
            <div className="absolute -inset-6 bg-gradient-to-tr from-amber-500/20 to-[#5B0A1C]/10 rounded-[3rem] blur-3xl opacity-40 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(91,10,28,0.15)] border border-slate-100 p-12">
               <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Neural Fraud Shield</p>
                     <p className="text-2xl font-black text-[#5B0A1C]">THREAT: <span className="text-green-600 uppercase">None Detected</span></p>
                  </div>
                  <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                    <ShieldCheck className="text-[#5B0A1C]" size={40} />
                  </div>
               </div>

               <div className="space-y-10">
                  <div className="p-7 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-500/30 transition-all cursor-default group/item">
                     <div className="flex justify-between items-end mb-4">
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ML Credit Analytics</p>
                           <p className="text-xl font-black text-slate-800">89.4% Approval Probability</p>
                        </div>
                        <BarChart3 size={24} className="text-[#5B0A1C] group-hover/item:scale-110 transition-transform" />
                     </div>
                     <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full w-[89.4%] bg-gradient-to-r from-[#5B0A1C] to-amber-500 rounded-full"></div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-7 bg-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden group/card">
                        <div className="absolute -right-2 -top-2 p-2 opacity-5 text-amber-400 group-hover/card:rotate-12 transition-transform"><Activity size={60}/></div>
                        <p className="text-[9px] font-bold tracking-widest uppercase opacity-50 mb-1">Processing</p>
                        <p className="text-xl font-black text-amber-400 tracking-tighter">REAL-TIME</p>
                     </div>
                     <div className="p-7 bg-[#5B0A1C] rounded-3xl text-white shadow-xl shadow-rose-900/30 relative overflow-hidden group/card">
                        <div className="absolute -right-2 -top-2 p-2 opacity-10 text-white group-hover/card:scale-110 transition-transform"><Fingerprint size={60}/></div>
                        <p className="text-[9px] font-bold tracking-widest uppercase opacity-70 mb-1">Identity Status</p>
                        <p className="text-xl font-black tracking-tighter uppercase">Verified</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- Feature Grid --- */}
      <section className="py-24 px-10 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-24">
          <h2 className="text-5xl font-black text-slate-900 mb-6 italic">Institutional Trust.</h2>
          <div className="h-1.5 w-24 bg-amber-500 rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <FeatureCard 
            icon={<ShieldCheck size={32} />}
            title="AI Sentinel Guard"
            desc="Predictive security layers that analyze behavioral transaction patterns in real-time."
          />
          <FeatureCard 
            icon={<Zap size={32} />}
            title="Instant Disbursement"
            desc="Automated loan processing leveraging integrated XGBoost financial modeling."
          />
          <FeatureCard 
            icon={<UserCircle size={32} />}
            title="Intelligent Portal"
            desc="A sophisticated dashboard for managing high-volume portfolios with ease."
          />
        </div>
      </section>

      {/* --- Executive Footer --- */}
      <footer className="bg-slate-900 text-white pt-24 pb-12 px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16 border-b border-slate-800 pb-20 mb-12">
          <div className="col-span-2 space-y-10">
            <div className="flex items-center gap-3">
              <div className="bg-[#5B0A1C] p-2 rounded-lg">
                <Landmark className="text-amber-400 w-6 h-6" />
              </div>
              <span className="text-3xl font-black tracking-tighter italic">
                MY<span className="text-rose-200/40 font-light">BANK</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed font-bold italic">
              Bihar's premier digital financial institution. Providing world-class 
              infrastructure for the next generation of global leaders.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black text-amber-500 tracking-[0.4em] uppercase">Architecture</h4>
            <div className="flex flex-col gap-4 text-sm font-bold text-slate-400">
              <span className="hover:text-amber-400 cursor-pointer transition-colors">Neural Security Shield</span>
              <span className="hover:text-amber-400 cursor-pointer transition-colors">XGBoost Scoring</span>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black text-amber-500 tracking-[0.4em] uppercase">Protocol</h4>
            <div className="flex flex-col gap-4 text-sm font-bold text-slate-400">
              <span className="hover:text-amber-400 cursor-pointer transition-colors">RBI Sandbox Member</span>
              <span className="hover:text-amber-400 cursor-pointer transition-colors">NIT Patna Project</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase">
          <p>© 2026 MyBank Private Banking. All Rights Reserved.</p>
          <div className="flex gap-10">
            <span>Privileged Content</span>
            <span>Digital Sovereignty</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-14 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30 hover:border-amber-500/40 hover:shadow-[#5B0A1C]/10 transition-all group hover:-translate-y-5 duration-500 cursor-default">
    <div className="mb-10 text-[#5B0A1C] bg-rose-50 w-max p-6 rounded-[1.5rem] group-hover:bg-[#5B0A1C] group-hover:text-amber-400 transition-all duration-700 shadow-md">
      {icon}
    </div>
    <h3 className="text-2xl font-black mb-5 text-slate-900 tracking-tight">{title}</h3>
    <p className="text-sm text-slate-400 font-bold leading-relaxed">{desc}</p>
  </div>
);

export default Home;