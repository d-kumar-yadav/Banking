import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import LottiePackage from "lottie-react";
import coinAnimation from "../../assets/Fake 3D vector coin.json";

const Lottie = LottiePackage.default || LottiePackage;

const LoanApply = () => {
  const [activeTab, setActiveTab] = useState('apply'); // apply, history
  const [loading, setLoading] = useState(false);
  const [loans, setLoans] = useState([]);
  
  const [loanData, setLoanData] = useState({
    maritalStatus: 'Single',
    educationLevel: 'Bachelor',
    employmentStatus: 'Employed',
    annualIncome: '',
    loanAmount: '',
    loanPurpose: 'Personal',
    loanTerm: '12' // months
  });

  const token = localStorage.getItem("token") || cookieStore?.get?.("token")?.value;
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchLoanHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:4000/api/loan/history', config);
      if (res.data.success) {
        setLoans(res.data.loans);
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

      const res = await axios.post('http://localhost:4000/api/loan/apply', payload, config);
      if (res.status === 201) {
        toast.success('Loan application submitted successfully!');
        setActiveTab('history');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit loan application');
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
            onClick={() => setActiveTab('apply')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${activeTab === 'apply' ? 'bg-white text-[#5B0A1C] shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
          >
            <Building className="w-4 h-4" /> Apply for Loan
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${activeTab === 'history' ? 'bg-white text-[#5B0A1C] shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
          >
            <FileText className="w-4 h-4" /> Application History
          </button>
        </div>

        <div className="p-8 flex-1 overflow-auto">
          {activeTab === 'apply' ? (
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
                    <option value="Personal">Personal</option>
                    <option value="Home">Home</option>
                    <option value="Education">Education</option>
                    <option value="Auto">Auto</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Employment Status</label>
                  <select className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] outline-none transition-all" value={loanData.employmentStatus} onChange={e => setLoanData({...loanData, employmentStatus: e.target.value})}>
                    <option value="Employed">Employed</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Unemployed">Unemployed</option>

                  </select>
                </div>


                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Education Level</label>
                  <select className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] outline-none transition-all" value={loanData.educationLevel} onChange={e => setLoanData({...loanData, educationLevel: e.target.value})}>
                    <option value="High School">High School</option>
                    <option value="Bachelor">Bachelor's Degree</option>
                    <option value="Master">Master's Degree</option>
                    <option value="PhD">PhD</option>
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
                  <div key={loan._id} className="bg-white/60 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-4 hover:shadow-md transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono text-slate-500">#{loan.loan_id}</span>
                        <span className="px-2.5 py-0.5 bg-slate-100 rounded-full text-xs font-semibold text-slate-600 uppercase tracking-wider">{loan.loanPurpose}</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-800">₹{loan.loanAmount?.toLocaleString()}</div>
                      <div className="text-sm text-slate-500 mt-1">{loan.loanTerm} Months Term</div>
                    </div>
                    
                    <div className="md:text-right flex flex-col justify-between">
                      <div className="flex items-center gap-2 md:justify-end text-sm font-semibold">
                        {getStatusIcon(loan.status)}
                        <span className={`${loan.status === 'Approved' ? 'text-emerald-600' : loan.status === 'Rejected' ? 'text-rose-600' : 'text-amber-600'}`}>
                          {loan.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-2">Applied: {new Date(loan.createdAt).toLocaleDateString()}</div>
                    </div>
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