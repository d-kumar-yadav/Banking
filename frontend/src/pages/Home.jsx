import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCircle, ArrowRight, Landmark, Zap, BarChart3, Fingerprint, Activity, Wallet, PieChart, CreditCard, Clock, Lock, CheckCircle, Smartphone, Download, Star, Award, HelpCircle, ChevronDown, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [activeSection, setActiveSection] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [tenure, setTenure] = useState(5);

  const calculateEMI = (p, r, t) => {
    const monthlyRate = r / 12 / 100;
    const months = t * 12;
    if (monthlyRate === 0) return p / months;
    const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['accounts', 'cards', 'loans'];
      let current = '';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 3 && rect.bottom >= window.innerHeight / 3) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger once on mount
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 selection:bg-[#5B0A1C] selection:text-white">
      
      {/* --- Minimal Corporate Navbar --- */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 lg:px-12 py-4 flex justify-between items-center shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className="bg-[#5B0A1C] p-2 rounded-lg">
            <Landmark className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-black tracking-tight text-[#5B0A1C]">
              MY<span className="text-slate-800">BANK</span>
            </span>
            <span className="text-[9px] font-bold tracking-[0.2em] text-slate-400 mt-0.5 uppercase">Digital Banking</span>
          </div>
        </div>

        <div className="hidden lg:flex gap-8 font-bold text-slate-600 text-sm">
          {["Accounts", "Cards", "Loans"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className={`hover:text-[#5B0A1C] transition-colors relative group py-1 ${activeSection === item.toLowerCase() ? 'text-[#5B0A1C]' : ''}`}>
              {item}
              <span className={`absolute bottom-0 left-0 h-[2px] bg-[#5B0A1C] transition-all group-hover:w-full ${activeSection === item.toLowerCase() ? 'w-full' : 'w-0'}`}></span>
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Link to="/login" className="text-[#5B0A1C] font-bold hover:text-rose-900 transition-colors text-sm">
            LOGIN
          </Link>
          <Link to="/signup" className="px-6 py-2.5 bg-[#5B0A1C] text-white font-bold rounded hover:bg-[#420714] shadow-md transition-all hover:-translate-y-0.5 text-sm">
            OPEN ACCOUNT
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-slate-600 hover:text-[#5B0A1C]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white pt-24 px-6 pb-6 flex flex-col shadow-2xl border-b border-slate-100">
          <div className="flex flex-col gap-6 font-bold text-slate-800 text-lg">
            {["Accounts", "Cards", "Loans"].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-[#5B0A1C] transition-colors border-b border-slate-100 pb-4"
              >
                {item}
              </a>
            ))}
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-[#5B0A1C] mt-4">
              LOGIN
            </Link>
            <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="px-6 py-4 bg-[#5B0A1C] text-white rounded text-center shadow-md">
              OPEN ACCOUNT
            </Link>
          </div>
        </div>
      )}

      
      <header className="relative bg-slate-50 pt-20 pb-40 lg:pb-52 px-6 lg:px-12 overflow-hidden border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm text-xs font-bold text-slate-600 mb-8">
            <ShieldCheck size={16} className="text-emerald-600" /> RBI Regulated & Secured by Neural ML
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl">
            Banking that moves at the <br className="hidden md:block"/>
            <span className="text-[#5B0A1C]">speed of your life.</span>
          </h1>
          
          <p className="text-lg text-slate-500 mt-6 max-w-2xl font-medium">
            Experience zero-fee accounts, instant AI-approved loans, and real-time fraud monitoring. All in one beautifully simple dashboard.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto">
            <Link to="/signup" className="px-8 py-3.5 bg-[#5B0A1C] text-white rounded font-bold text-lg shadow-lg hover:bg-[#420714] transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
              Get Started <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="px-8 py-3.5 bg-white text-slate-700 border border-slate-300 rounded font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center w-full sm:w-auto">
              Net Banking
            </Link>
          </div>
        </div>

  
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-rose-100/50 to-transparent skew-x-12 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-tr from-slate-200/50 to-transparent rounded-tr-full -z-10"></div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-24 relative z-20 mb-32">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform duration-300 group cursor-pointer">
            <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#5B0A1C] transition-colors">
              <Wallet className="text-[#5B0A1C] group-hover:text-white" size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Savings Account</h3>
            <p className="text-sm text-slate-500 font-medium mb-4">Zero balance account with up to 7% interest p.a. and instant virtual debit card.</p>
            <Link to="/signup" className="text-[#5B0A1C] font-bold text-sm flex items-center gap-1">Apply Now <ArrowRight size={16}/></Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform duration-300 group cursor-pointer">
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors">
              <Zap className="text-amber-600 group-hover:text-white" size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Instant Loans</h3>
            <p className="text-sm text-slate-500 font-medium mb-4">AI-powered approvals in under 60 seconds. Zero foreclosure charges anytime.</p>
            <Link to="/signup" className="text-amber-600 font-bold text-sm flex items-center gap-1">Check Eligibility <ArrowRight size={16}/></Link>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform duration-300 group cursor-pointer">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
              <Activity className="text-emerald-600 group-hover:text-white" size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Credit Simulator</h3>
            <p className="text-sm text-slate-500 font-medium mb-4">Gamified credit score building. Earn +1.5 points for every on-time EMI payment.</p>
            <Link to="/signup" className="text-emerald-600 font-bold text-sm flex items-center gap-1">Simulate Score <ArrowRight size={16}/></Link>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-8 rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform duration-300 group cursor-pointer">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
              <ShieldCheck className="text-indigo-600 group-hover:text-white" size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Neural Security</h3>
            <p className="text-sm text-slate-500 font-medium mb-4">Military-grade encryption and real-time ML fraud detection on all transfers.</p>
            <Link to="/signup" className="text-indigo-600 font-bold text-sm flex items-center gap-1">Learn More <ArrowRight size={16}/></Link>
          </div>

        </div>
      </div>

      {/* --- Core Features / Value Proposition --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
              A smarter way to manage <br/> your finances.
            </h2>
            <p className="text-slate-500 text-lg">
              We leverage advanced Machine Learning models to provide you with seamless, instant, and secure banking experiences that traditional banks simply cannot match.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="mt-1 bg-slate-100 p-2 rounded-full"><Clock className="w-5 h-5 text-[#5B0A1C]" /></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Zero-Penalty Foreclosures</h4>
                  <p className="text-slate-500 text-sm">Pay off your loans early without any hidden fees or penalties. You are in complete control.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 bg-slate-100 p-2 rounded-full"><BarChart3 className="w-5 h-5 text-[#5B0A1C]" /></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Gamified Credit Scores</h4>
                  <p className="text-slate-500 text-sm">Watch your credit score grow in real-time. We reward your financial discipline directly on your dashboard.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 bg-slate-100 p-2 rounded-full"><Lock className="w-5 h-5 text-[#5B0A1C]" /></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Real-Time Threat Prevention</h4>
                  <p className="text-slate-500 text-sm">Our neural network flags and freezes anomalous transactions instantly, keeping your funds entirely safe.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
          
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#5B0A1C]/5 rounded-bl-full"></div>
               <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
                 <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Balance</p>
                   <p className="text-3xl font-black text-slate-800">₹2,45,000</p>
                 </div>
                 <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                   <ShieldCheck size={14}/> Secure
                 </div>
               </div>

               <div className="space-y-4">
                 <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                   <div className="flex items-center gap-3">
                     <div className="bg-rose-50 p-2 rounded-lg text-[#5B0A1C]"><CreditCard size={20}/></div>
                     <div>
                       <p className="font-bold text-slate-800 text-sm">EMI Payment</p>
                       <p className="text-xs text-slate-400">Personal Loan</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-bold text-rose-600 text-sm">- ₹15,000</p>
                     <p className="text-xs text-emerald-600 font-bold">Score +1.5 🌟</p>
                   </div>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                   <div className="flex items-center gap-3">
                     <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><PieChart size={20}/></div>
                     <div>
                       <p className="font-bold text-slate-800 text-sm">Salary Credited</p>
                       <p className="text-xs text-slate-400">Tech Corp</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-bold text-emerald-600 text-sm">+ ₹85,000</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Products Sections --- */}
      
      {/* Accounts Section */}
      <section id="accounts" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">Bank Accounts Tailored For You</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">From zero-balance digital savings to premium corporate salary accounts, find the perfect home for your money.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Digital Savings", desc: "Zero balance requirement. Earn up to 7.1% p.a. interest. Instant virtual debit card.", badge: "Popular" },
              { title: "Corporate Salary", desc: "Zero balance. Unlimited free ATM withdrawals across India. Free airport lounge access." },
              { title: "Current Account", desc: "For businesses and professionals. Dynamic cash deposit limits and advanced API integrations.", badge: "Business" }
            ].map((acc, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col relative overflow-hidden">
                {acc.badge && <span className="absolute top-4 right-4 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{acc.badge}</span>}
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Landmark className="text-slate-700" size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{acc.title}</h3>
                <p className="text-slate-500 text-sm mb-8 flex-1">{acc.desc}</p>
                <Link to="/signup" className="text-[#5B0A1C] font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                  Open Instantly <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section id="cards" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black mb-4">Premium Credit Cards</h2>
              <p className="text-slate-400 max-w-xl">Experience uncompromised luxury with our signature collection. Zero forex markup, unlimited lounge access, and milestone rewards.</p>
            </div>
            <Link to="/signup" className="px-6 py-3 bg-white text-slate-900 font-bold rounded hover:bg-slate-100 transition-colors">
              Explore All Cards
            </Link>
          </div>
          <div className="grid lg:grid-cols-4 gap-8">
            {[
              { name: "Sapphire Reserve", fee: "₹5,000 / year", features: ["Unlimited Lounge Access", "0% Forex Markup", "10x Reward Points"], color: "bg-gradient-to-br from-indigo-900 to-slate-900", border: "border-indigo-500/30" },
              { name: "Ruby Rewards", fee: "Lifetime Free", features: ["5% Cashback on Groceries", "Free Movie Tickets", "Zero Annual Fee"], color: "bg-gradient-to-br from-[#5B0A1C] to-rose-950", border: "border-rose-500/30" },
              { name: "Titanium Corporate", fee: "₹2,500 / year", features: ["Expense Management API", "Global Wi-Fi Access", "Business Travel Insurance"], color: "bg-gradient-to-br from-slate-700 to-slate-900", border: "border-slate-500/30" },
              { name: "Emerald Elite", fee: "₹10,000 / year", features: ["Golf Course Access", "24/7 Concierge", "Low Interest Rate"], color: "bg-gradient-to-br from-emerald-900 to-slate-900", border: "border-emerald-500/30" }
            ].map((card, i) => (
              <div key={i} className={`p-8 rounded-2xl border ${card.border} ${card.color} shadow-2xl relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none"></div>
                <h3 className="text-2xl font-black mb-1">{card.name}</h3>
                <p className="text-sm font-medium text-slate-300 mb-8">{card.fee}</p>
                <ul className="space-y-4 mb-8">
                  {card.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                      <ShieldCheck size={16} className="text-emerald-400" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className="block w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-center font-bold text-sm transition-colors backdrop-blur-sm">
                  Apply Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loans Section */}
      <section id="loans" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="bg-amber-50 rounded-3xl p-10 border border-amber-100 relative overflow-hidden">
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-amber-500/30">
                <Zap className="text-white w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">Instant ML Approvals</h3>
              <p className="text-slate-600 mb-8 leading-relaxed relative z-10">
                Why wait weeks for a loan? Our Neural Network assesses your creditworthiness instantly. Get disbursed in 60 seconds with absolutely zero foreclosure penalties.
              </p>
              <div className="space-y-4 relative z-10">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-slate-700">Personal Loan</span>
                  <span className="text-amber-600 font-bold">10.5% p.a.</span>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-slate-700">Home Loan</span>
                  <span className="text-amber-600 font-bold">8.3% p.a.</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900">Loans that understand you.</h2>
            <p className="text-slate-500 text-lg">Whether you are buying your dream home or need emergency funds, we offer the most transparent lending in the market.</p>
            <ul className="space-y-4 text-slate-700 font-medium">
              <li className="flex items-center gap-3"><CheckCircle size={20} className="text-emerald-500" /> No hidden processing fees</li>
              <li className="flex items-center gap-3"><CheckCircle size={20} className="text-emerald-500" /> Flexible EMI schedules</li>
              <li className="flex items-center gap-3"><CheckCircle size={20} className="text-emerald-500" /> 100% digital process (No branch visits)</li>
            </ul>
            <div className="pt-4">
              <Link to="/signup" className="px-8 py-3.5 bg-[#5B0A1C] text-white rounded font-bold hover:bg-[#420714] shadow-md transition-all inline-block">
                Check Eligibility
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* EMI Calculator Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
           <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-slate-100 grid lg:grid-cols-2 gap-12">
               <div>
                  <h3 className="text-3xl font-black text-slate-900 mb-2">EMI Calculator</h3>
                  <p className="text-slate-500 mb-8 font-medium">Plan your loan easily. Adjust the sliders to see your monthly EMI.</p>
                  
                  {/* Sliders */}
                  <div className="space-y-8">
                      <div>
                          <div className="flex justify-between font-bold text-sm mb-3">
                              <span className="text-slate-700">Loan Amount</span>
                              <span className="text-[#5B0A1C] text-lg">₹{loanAmount.toLocaleString()}</span>
                          </div>
                          <input type="range" min="10000" max="5000000" step="10000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full accent-[#5B0A1C] h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                      </div>
                      <div>
                          <div className="flex justify-between font-bold text-sm mb-3">
                              <span className="text-slate-700">Interest Rate (p.a.)</span>
                              <span className="text-[#5B0A1C] text-lg">{interestRate}%</span>
                          </div>
                          <input type="range" min="5" max="20" step="0.5" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full accent-[#5B0A1C] h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                      </div>
                      <div>
                          <div className="flex justify-between font-bold text-sm mb-3">
                              <span className="text-slate-700">Tenure</span>
                              <span className="text-[#5B0A1C] text-lg">{tenure} Years</span>
                          </div>
                          <input type="range" min="1" max="30" step="1" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full accent-[#5B0A1C] h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                      </div>
                  </div>
               </div>
               
               <div className="bg-gradient-to-br from-[#5B0A1C] to-rose-900 rounded-2xl p-8 text-white flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-bl-full pointer-events-none"></div>
                  <p className="text-rose-200 font-bold uppercase tracking-wider text-sm mb-2">Your Monthly EMI</p>
                  <h4 className="text-5xl font-black text-white mb-8">₹{calculateEMI(loanAmount, interestRate, tenure).toLocaleString()}</h4>
                  <div className="w-full space-y-4">
                      <div className="flex justify-between text-sm border-b border-rose-800/50 pb-3">
                          <span className="text-rose-200">Principal Amount</span>
                          <span className="font-bold text-white">₹{loanAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm border-b border-rose-800/50 pb-3">
                          <span className="text-rose-200">Total Interest</span>
                          <span className="font-bold text-white">₹{(calculateEMI(loanAmount, interestRate, tenure) * tenure * 12 - loanAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm pb-2">
                          <span className="text-rose-200">Total Amount Payable</span>
                          <span className="font-bold text-white">₹{(calculateEMI(loanAmount, interestRate, tenure) * tenure * 12).toLocaleString()}</span>
                      </div>
                  </div>
               </div>
           </div>
        </div>
      </section>

      {/* 1. Trusted by Millions (Stats) */}
      <section className="py-20 bg-[#5B0A1C] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl lg:text-5xl font-black mb-2 text-rose-200">₹5K<span className="text-2xl">Cr+</span></p>
              <p className="text-rose-100 font-medium text-sm tracking-wider uppercase">Loans Disbursed</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-black mb-2 text-rose-200">1.2<span className="text-2xl">M</span></p>
              <p className="text-rose-100 font-medium text-sm tracking-wider uppercase">Active Users</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-black mb-2 text-rose-200">&lt;60<span className="text-2xl">s</span></p>
              <p className="text-rose-100 font-medium text-sm tracking-wider uppercase">Avg Approval Time</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-black mb-2 text-rose-200">0</p>
              <p className="text-rose-100 font-medium text-sm tracking-wider uppercase">Security Breaches</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Mobile App Showcase */}
      <section className="py-24 bg-slate-50 border-t border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-emerald-100 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-800">
              <Smartphone size={16} /> Available on iOS & Android
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Your entire bank, <br/> in your pocket.
            </h2>
            <p className="text-slate-500 text-lg max-w-lg">
              Manage your accounts, track your credit score, and get instant loans anytime, anywhere. Experience the most beautifully designed banking app ever created.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                <Download size={24} />
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Download on the</p>
                  <p className="text-lg font-black leading-none">App Store</p>
                </div>
              </button>
              <button className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                <Download size={24} />
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">GET IT ON</p>
                  <p className="text-lg font-black leading-none">Google Play</p>
                </div>
              </button>
            </div>
            <div className="flex items-center gap-4 pt-6">
              <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">U{i}</div>)}
              </div>
              <div className="text-sm">
                <div className="flex text-amber-400 mb-1"><Star size={14} className="fill-current"/><Star size={14} className="fill-current"/><Star size={14} className="fill-current"/><Star size={14} className="fill-current"/><Star size={14} className="fill-current"/></div>
                <p className="font-bold text-slate-700">4.9/5 <span className="text-slate-400 font-normal">from 85k+ reviews</span></p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative flex justify-center">
             <div className="absolute inset-0 bg-gradient-to-tr from-rose-200/40 to-indigo-200/40 rounded-full blur-3xl -z-10 w-3/4 h-3/4 m-auto"></div>
             {/* Mockup Placeholder */}
             <div className="w-[300px] h-[600px] bg-slate-900 rounded-[2.5rem] border-[8px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20"></div>
                {/* App Screen UI */}
                <div className="flex-1 bg-slate-50 p-6 pt-12 relative z-10">
                   <div className="flex justify-between items-center mb-8">
                     <div>
                       <p className="text-xs font-bold text-slate-400 uppercase">Hello, Alex</p>
                       <p className="text-xl font-black text-slate-800">₹2,45,000</p>
                     </div>
                     <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-800 font-bold">A</div>
                   </div>
                   <div className="bg-gradient-to-br from-[#5B0A1C] to-rose-900 h-40 rounded-2xl p-5 text-white mb-6 shadow-lg">
                      <p className="text-rose-200 text-xs mb-1">Premium Card</p>
                      <p className="font-mono text-lg tracking-widest mb-4">**** 4589</p>
                      <div className="flex justify-between items-end">
                        <span className="font-bold">₹15,230</span>
                        <span className="text-xs">VISA</span>
                      </div>
                   </div>
                   <div className="space-y-3">
                     <p className="font-bold text-slate-800 mb-2">Recent Transactions</p>
                     {[1,2,3].map(i => (
                       <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                           <div className="h-2 w-16 bg-slate-200 rounded"></div>
                         </div>
                         <div className="h-2 w-10 bg-slate-200 rounded"></div>
                       </div>
                     ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. Security & Partners Marquee */}
      <section className="py-12 bg-white border-t border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-6 text-center">
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Backed By & Compliant With</p>
        </div>
        <div className="flex gap-16 items-center justify-center flex-wrap opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 font-black text-2xl text-slate-800"><ShieldCheck className="text-emerald-600"/> RBI Regulated</div>
          <div className="flex items-center gap-2 font-black text-2xl text-slate-800"><Lock className="text-slate-600"/> PCI-DSS</div>
          <div className="flex items-center gap-2 font-black text-2xl text-slate-800"><Award className="text-amber-600"/> ISO 27001</div>
          <div className="flex items-center gap-2 font-black text-2xl text-slate-800"><ShieldCheck className="text-indigo-600"/> 256-bit AES</div>
        </div>
      </section>

      {/* 4. FAQ Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500">Everything you need to know about banking with us.</p>
          </div>
          <div className="space-y-4">
            {[
              { q: "Is my money safe in a digital bank?", a: "Absolutely. We are fully regulated by the RBI. Your deposits are insured up to ₹5,00,000 under DICGC. We use military-grade 256-bit encryption and neural ML models to detect and block fraud in real-time." },
              { q: "How does the 60-second loan approval work?", a: "Instead of manual human checks, our proprietary Neural Network analyzes thousands of data points instantly, including your cash flow and credit history, to approve loans without human bias or delays." },
              { q: "Are there really zero hidden fees?", a: "Yes. No minimum balance charges, no IMPS/NEFT fees, and zero foreclosure penalties on loans. We believe in 100% transparent pricing." },
              { q: "Do you have physical branches?", a: "We are a 100% digital bank. This means lower overhead costs for us, which we pass on to you as higher interest rates and zero fees. Everything you need can be done from our award-winning app." }
            ].map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl shadow-sm border border-slate-200 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 font-bold text-slate-900">
                  <span className="flex gap-3 items-center"><HelpCircle size={20} className="text-[#5B0A1C]"/> {faq.q}</span>
                  <ChevronDown className="transition duration-300 group-open:-rotate-180 text-slate-400" />
                </summary>
                <p className="px-6 pb-6 pt-0 text-slate-500 leading-relaxed pl-16">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

  
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 px-6 lg:px-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-slate-800 pb-12">
          
          <div className="space-y-6 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="bg-[#5B0A1C] p-2 rounded-lg">
                <Landmark className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                MY<span className="text-slate-400">BANK</span>
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Redefining trust and technology in modern banking. Secure, instant, and fully digital.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Products</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer">Savings Accounts</li>
              <li className="hover:text-white transition-colors cursor-pointer">Current Accounts</li>
              <li className="hover:text-white transition-colors cursor-pointer">Instant Personal Loans</li>
              <li className="hover:text-white transition-colors cursor-pointer">Credit Simulator</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Security</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer">Neural Fraud Shield</li>
              <li className="hover:text-white transition-colors cursor-pointer">Biometric Verification</li>
              <li className="hover:text-white transition-colors cursor-pointer">RBI Guidelines</li>
              <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Support</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer">24/7 Helpline</li>
              <li className="hover:text-white transition-colors cursor-pointer">Locate Branch</li>
              <li className="hover:text-white transition-colors cursor-pointer">Report Fraud</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 MyBank. A prototype financial institution.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="cursor-pointer hover:text-white transition-colors">Terms of Service</span>
            <span className="cursor-pointer hover:text-white transition-colors">Security Overview</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;