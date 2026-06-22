import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, ArrowRightLeft, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import LottiePackage from "lottie-react";
import coinAnimation from "../../assets/Fake 3D vector coin.json";

const Lottie = LottiePackage.default || LottiePackage;

const TransferMoney = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferData, setTransferData] = useState({
    fromaccount: '',
    toaccount: '',
    amount: '',
  });

  const token = localStorage.getItem("token") || cookieStore?.get?.("token")?.value;
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/accounts/user/getallaccount', config);
        if (res.data.success) {
          const activeAccounts = res.data.accounts.filter(acc => acc.status === 'Active');
          setAccounts(activeAccounts);
          if (activeAccounts.length > 0) {
            setTransferData(prev => ({ ...prev, fromaccount: activeAccounts[0].accountNumber }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAccounts();
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferData.fromaccount || !transferData.toaccount || !transferData.amount) {
      toast.error('Please fill all fields');
      return;
    }
    
    // Generate a simple idempotency key
    const idempotencykey = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:4000/api/intra/transaction', {
        ...transferData,
        amount: Number(transferData.amount),
        idempotencykey
      }, config);

      if (res.data.success) {
        toast.success(res.data.message || 'Transfer successful');
        setTransferData(prev => ({ ...prev, toaccount: '', amount: '' }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Transfer Money</h2>
        <p className="text-slate-500 mt-2">Send funds securely to internal or external accounts.</p>
      </div>

      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
        
        <form onSubmit={handleTransfer} className="space-y-6 relative z-10">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">From Account</label>
            <div className="relative">
              <select 
                className="w-full pl-4 pr-10 py-4 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] appearance-none outline-none transition-all font-mono text-slate-700"
                value={transferData.fromaccount}
                onChange={e => setTransferData({...transferData, fromaccount: e.target.value})}
              >
                {accounts.length === 0 && <option value="">No Active Accounts</option>}
                {accounts.map(acc => (
                  <option key={acc._id} value={acc.accountNumber}>{acc.accountNumber}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <ArrowRightLeft className="w-5 h-5 text-slate-400 rotate-90" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">To Account (Recipient)</label>
            <input 
              type="text"
              placeholder="Enter recipient account number"
              className="w-full px-4 py-4 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] outline-none transition-all font-mono placeholder:font-sans"
              value={transferData.toaccount}
              onChange={e => setTransferData({...transferData, toaccount: e.target.value})}
            />
          </div>

          <div className="space-y-2">
             <label className="text-sm font-semibold text-slate-700 ml-1">Amount (₹)</label>
             <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-slate-500 font-semibold text-lg">₹</span>
                <input 
                  type="number"
                  placeholder="0.00"
                  min="1"
                  className="w-full pl-10 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] outline-none transition-all font-bold text-slate-800 text-xl"
                  value={transferData.amount}
                  onChange={e => setTransferData({...transferData, amount: e.target.value})}
                />
             </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <p>Your transaction is protected by bank-grade encryption and ML-based fraud detection systems.</p>
          </div>

          <button 
            type="submit" 
            disabled={loading || accounts.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-[#5B0A1C] hover:bg-[#420714] text-white py-4 rounded-2xl font-bold shadow-[0_10px_20px_-10px_rgba(91,10,28,0.5)] hover:-translate-y-0.5 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="w-16 h-16 flex items-center justify-center -my-2">
                <Lottie animationData={coinAnimation} loop={true} />
              </div>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Money Securely
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransferMoney;
