import { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Building, FileText, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import LottiePackage from "lottie-react";
import coinAnimation from "../../assets/Fake 3D vector coin.json";

const Lottie = LottiePackage.default || LottiePackage;

const LoanApply = () => {
  const [activeTab, setActiveTab] = useState('catalog'); // catalog, apply, history
  const [loading, setLoading] = useState(false);
  const [loans, setLoans] = useState([]);
  
  const [loanData, setLoanData] = useState({
    maritalStatus: 'Single',
    educationLevel: 'Bachelor\'s',
    employmentStatus: 'Employed',
    annualIncome: '',
    loanAmount: '',
    loanPurpose: 'Home',
    loanTerm: '12' // months
  });

   

  const fetchLoanHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/loan/history', { withCredentials: true });
      if (res.data.success) {
        // Filter out Active, Closed, or Defaulted loans since they belong in the Active Loans dashboard
        const historyLoans = res.data.loans.filter(l => 
          l.status !== 'Active' && l.status !== 'Closed' && l.status !== 'Defaulted' && l.status !== 'Approved'
        );
        setLoans(historyLoans);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch loan history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchLoanHistory();
    }
  }, [activeTab]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!loanData.annualIncome || !loanData.loanAmount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...loanData,
        annualIncome: Number(loanData.annualIncome),
        loanAmount: Number(loanData.loanAmount),
        loanTerm: Number(loanData.loanTerm)
      };

      const res = await axios.post('/api/loan/apply', payload, { withCredentials: true });
      if (res.status === 201) {
        toast.success('Loan application submitted! Ref: ' + res.data.loanId);
        setActiveTab('history');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit loan application');
      setLoanData({
           maritalStatus: 'Single',
    educationLevel: 'Bachelor\'s',
    employmentStatus: 'Employed',
    annualIncome: '',
    loanAmount: '',
    loanPurpose: 'Personal',
    loanTerm: '12' // months
        
      })
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'Rejected': return <XCircle className="w-5 h-5 text-rose-500" />;
      default: return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Loan Center</h2>
          <p className="text-slate-500 mt-2">Apply for a new loan or check your application status.</p>
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 flex flex-col">
        <div className="flex border-b border-slate-200/60 p-2 gap-2 bg-slate-50/50">
          <button 
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${activeTab === 'catalog' ? 'bg-white text-[#5B0A1C] shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
          >
            <Building className="w-4 h-4" /> Explore Loans
          </button>
          <button 
            onClick={() => setActiveTab('apply')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${activeTab === 'apply' ? 'bg-white text-[#5B0A1C] shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
          >
            <FileText className="w-4 h-4" /> Apply for Loan
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${activeTab === 'history' ? 'bg-white text-[#5B0A1C] shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
          >
            <Clock className="w-4 h-4" /> Application History
          </button>
        </div>

        <div className="p-8 flex-1 overflow-auto">
          {activeTab === 'catalog' ? (
              <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all">
                      <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4">
                          <Building className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Home Loan</h3>
                      <p className="text-slate-500 text-sm mb-6 flex-1">Build your dream home with interest rates starting at just 8.3% p.a. Zero foreclosure charges.</p>
                      <button onClick={() => { setLoanData({...loanData, loanPurpose: 'Home'}); setActiveTab('apply'); }} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">Apply Now</button>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all">
                      <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 mb-4">
                          <FileText className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Personal Loan</h3>
                      <p className="text-slate-500 text-sm mb-6 flex-1">Instant approvals in 60 seconds with ML-powered credit scoring. Interest rates from 10.5% p.a.</p>
                      <button onClick={() => { setLoanData({...loanData, loanPurpose: 'Personal'}); setActiveTab('apply'); }} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">Apply Now</button>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                          <CheckCircle className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Car Loan</h3>
                      <p className="text-slate-500 text-sm mb-6 flex-1">Get up to 100% on-road funding for your new car. Flexible EMIs up to 7 years.</p>
                      <button onClick={() => { setLoanData({...loanData, loanPurpose: 'Car'}); setActiveTab('apply'); }} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">Apply Now</button>
                  </div>
              </div>
          ) : activeTab === 'apply' ? (
            <form onSubmit={handleApply} className="max-w-3xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Loan Amount (₹)</label>
                  <input type="number" min="1" required className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] outline-none transition-all font-semibold" value={loanData.loanAmount} onChange={e => setLoanData({...loanData, loanAmount: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Annual Income (₹)</label>
                  <input type="number" min="1" required className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] outline-none transition-all font-semibold" value={loanData.annualIncome} onChange={e => setLoanData({...loanData, annualIncome: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Loan Term (Months)</label>
                  <select className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] outline-none transition-all" value={loanData.loanTerm} onChange={e => setLoanData({...loanData, loanTerm: e.target.value})}>
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                    <option value="24">24 Months</option>
                    <option value="36">36 Months</option>
                    <option value="60">60 Months</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Loan Purpose</label>
                  <select className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] outline-none transition-all" value={loanData.loanPurpose} onChange={e => setLoanData({...loanData, loanPurpose: e.target.value})}>
                    <option value="Business">Business</option>
                    <option value="Car">Car</option>
                    <option value="Debt consolidation">Debt consolidation</option>
                    <option value="Education">Education</option>
                    <option value="Home">Home</option>
                    <option value="Medical">Medical</option>
                    <option value="Vacation">Vacation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Employment Status</label>
                  <select className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] outline-none transition-all" value={loanData.employmentStatus} onChange={e => setLoanData({...loanData, employmentStatus: e.target.value})}>
                    <option value="Employed">Employed</option>
                    <option value="Retired">Retired</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="Student">Student</option>
                    <option value="Unemployed">Unemployed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Education Level</label>
                  <select className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] outline-none transition-all" value={loanData.educationLevel} onChange={e => setLoanData({...loanData, educationLevel: e.target.value})}>
                    <option value="High School">High School</option>
                    <option value="Bachelor's">Bachelor's Degree</option>
                    <option value="Master's">Master's Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#5B0A1C] hover:bg-[#420714] text-white py-4 rounded-xl font-bold shadow-[0_10px_20px_-10px_rgba(91,10,28,0.5)] transition-all disabled:opacity-70 flex justify-center items-center"
                >
                  {loading ? <div className="w-16 h-16 flex justify-center items-center -my-2"><Lottie animationData={coinAnimation} loop={true} /></div> : 'Submit Application'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center p-8"><div className="w-40 h-40"><Lottie animationData={coinAnimation} loop={true} /></div></div>
              ) : loans.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No loan applications found.</div>
              ) : (
                loans.map(loan => (
                  <div key={loan._id} className="group relative overflow-hidden bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 mb-6">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-50 to-amber-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:opacity-70 transition-opacity"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-rose-50 rounded-2xl flex items-center justify-center text-[#5B0A1C] shadow-sm border border-rose-100 shrink-0">
                          <FileText className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">Application Reference</p>
                          <p className="font-mono text-xl md:text-2xl font-bold text-slate-900" title={loan.status === 'Review_Required' ? 'Reference Number' : 'Loan ID'}>{loan.loan_id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center self-start md:self-auto">
                        <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm border ${
                          loan.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                          loan.status === 'Review_Required' || !loan.status ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {(loan.status === 'Review_Required' || !loan.status) && (
                             <span className="relative flex h-2.5 w-2.5">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                             </span>
                          )}
                          {loan.status === 'Approved' ? <CheckCircle className="w-4 h-4" /> : 
                           (loan.status && loan.status !== 'Review_Required') ? <AlertCircle className="w-4 h-4" /> : null}
                          <span className="uppercase tracking-wider text-xs">
                            {loan.status ? loan.status.replace('_', ' ') : 'Review Required'}
                          </span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 mb-8">
                      <div className="flex flex-col gap-1.5">
                         <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">Loan Amount</p>
                         <p className="text-base text-slate-900 font-semibold">₹{loan.loanAmount?.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">Purpose</p>
                         <p className="text-base text-slate-900 font-semibold">{loan.loanPurpose}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">Term</p>
                         <p className="text-base text-slate-900 font-semibold">{loan.loanTerm} Months</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">Annual Income</p>
                         <p className="text-base text-slate-900 font-semibold">₹{loan.annualIncome?.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">Employment Status</p>
                         <p className="text-base text-slate-900 font-semibold">{loan.employmentStatus}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">Education Level</p>
                         <p className="text-base text-slate-900 font-semibold">{loan.educationLevel}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">Marital Status</p>
                         <p className="text-base text-slate-900 font-semibold">{loan.maritalStatus}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">Age / Gender</p>
                         <p className="text-base text-slate-900 font-semibold">{loan.age} / {loan.gender}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">Applied Date</p>
                         <p className="text-base text-slate-900 font-semibold">{new Date(loan.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {(loan.status === 'Review_Required' || !loan.status) && (
                      <div className="relative z-10 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex items-start sm:items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-blue-600">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-blue-900 mb-0.5">Application Under Review</h4>
                          <p className="text-sm text-blue-800/80 leading-snug">Please wait for admin instructions. Your submitted documents and details are currently being verified.</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default LoanApply;
