import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CreditCard, ArrowUpRight, ArrowDownRight, Wallet, FileText, Clock, Phone, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../Loader';

const AccountsOverview = () => {
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [applyaccount, setApplyaccount] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [UserAppliedaccounts, setUserAppliedaccounts] = useState([]);
  const [activeTab, setActiveTab] = useState('accounts');



  useEffect(() => {
    // it create a looping timer that trigger after every 1sec 
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // New Account State
  const [newAccountData, setNewAccountData] = useState({
    pan_id: '',
    adhar_id: '',
    address: '',
    phone: '',
    otp: '',
    account_type: 'Savings',
    pan_image: 'placeholder_pan_url', // Using placeholders since we aren't handling real file uploads in this demo
    adhar_image: 'placeholder_adhar_url',
    signature: 'placeholder_signature_url',
    image: 'placeholder_user_image_url'
  });
  

  

  const handleSendOtp = async () => {
    if (!newAccountData.phone) {
      toast.error("Please enter Phone Number to receive OTP");
      return;
    }

    try {
      await axios.post("http://localhost:4000/api/auth/send-otp", { phone: newAccountData.phone });
      setIsOtpSent(true);
      setOtpTimer(30);
      toast.success("OTP sent successfully!");
    } catch (error) {
      console.error("Failed to send OTP:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.");
    }
  };



  const fetchAccountsAndBalances = async () => {
    try {
      setLoading(true);
    
      const res = await axios.get('http://localhost:4000/api/accounts/getallaccount');
      if (res.data.success) {
        setAccounts(res.data.accounts);
        if (res.data.accounts.length === 1) {
          setNewAccountData(prev => ({ ...prev, account_type: res.data.accounts[0].account_type === 'Savings' ? 'Current' : 'Savings' }));
        }

        // Fetch balances for each account concurrently using Promise.all
        const balancePromises = res.data.accounts.map(async (acc) => {
          try {
            const balRes = await axios.get(`http://localhost:4000/api/accounts/balance/${acc.accountNumber}`);
            if (balRes.data.success) {
              return [acc.accountNumber, balRes.data.balance];
            }
          } catch (err) {
            console.error(`Error fetching balance for ${acc.accountNumber}`);
            return [acc.accountNumber, 'Error'];
          }
          return [acc.accountNumber, 'Error'];
        });

        const balanceResults = await Promise.all(balancePromises);
        const balancesData = Object.fromEntries(balanceResults)
        setBalances(balancesData);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch accounts ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountsAndBalances();
  }, []);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:4000/api/accounts/createaccount', newAccountData);
      if (res.data.success) {
        toast.success(res.data.message);
        setApplyaccount(false);
        setrefrencenumber(res.data.referenceNumber);

      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    }
  };

  useEffect(() => {
    const fetchApplications = async () => {
      
        setLoading(true);
        try {
         
          const res = await axios.get('http://localhost:4000/api/accounts/appliedaccounts');
          if (res.data.success) {
            setUserAppliedaccounts(res.data.appliedaccounts);
          }
        } catch (err) {
          toast.error("Failed to fetch application status of Applied accounts");
        } finally {
          setLoading(false);
        }
      
    };
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader size="h-64 w-64" text="Loading" />
      </div>
    );
  }
  

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
            Accounts Overview
          </h2>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            Manage your banking accounts and view real-time balances.
          </p>
        </div>

        {accounts.length < 2 && UserAppliedaccounts.length === 0 && (
          <button
            onClick={() => setApplyaccount(true)}
            className="flex items-center gap-2 bg-[#5B0A1C] text-white px-6 py-3 rounded-xl font-bold shadow-[0_10px_20px_-10px_rgba(91,10,28,0.5)] hover:bg-[#420714] hover:-translate-y-0.5 transition-all shrink-0"
          >
            <Plus className="w-5 h-5" />
            Apply for Account
          </button>
        )}
        {accounts.length >= 2 && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 shadow-sm text-amber-800 text-sm font-medium max-w-md shrink-0">  
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-amber-900 mb-0.5">Limit Reached</p>
              <p className="text-amber-700/90 text-sm leading-tight">Maximum of 2 accounts allowed. Please contact support.</p>
            </div>
          </div>
        )}
        {accounts.length < 2 && UserAppliedaccounts.length > 0 && (
          <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 shadow-sm text-indigo-800 max-w-md shrink-0">  
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-sm">
              <p className="font-bold text-indigo-900 mb-0.5 text-base">Application Pending</p>
              <p className="text-indigo-700/90 font-medium leading-tight">You have already applied for an account. Please wait for admin approval.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`pb-4 px-2 text-l font-semibold transition-all ${activeTab === 'accounts' ? 'text-[#5B0A1C] border-b-2 border-[#5B0A1C]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          My Accounts
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-4 px-2 text-l font-semibold transition-all ${activeTab === 'applications' ? 'text-[#5B0A1C] border-b-2 border-[#5B0A1C]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          My Applications
        </button>
      </div>

      {activeTab === 'accounts' ? (
        accounts.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-12 text-center shadow-sm">
            <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700">No active accounts</h3>
            <p className="text-slate-500 mt-2">You don't have any accounts yet. Apply for one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map(acc => (
              <div key={acc._id} className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-[#5B0A1C]">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${acc.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {acc.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Account Number</p>
                  <h3 className="text-xl font-semibold text-slate-800 tracking-wider mb-6 font-mono">{acc.accountNumber}</h3>
                </div>
                <div className="mt-auto pt-6 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-500 mb-1">Available Balance</p>
                  <div className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    ₹{balances[acc.accountNumber] !== undefined ? balances[acc.accountNumber].toLocaleString() : '---'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <FileText className="w-6 h-6 text-[#5B0A1C]" />
            Application Status
          </h3>
          {UserAppliedaccounts.length > 0 ? (
            <div className="space-y-6">
              {UserAppliedaccounts.map((account) => (
                <div key={account._id} className="group relative overflow-hidden bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  {/* Decorative Background Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-50 to-amber-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:opacity-70 transition-opacity"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-rose-50 rounded-2xl flex items-center justify-center text-[#5B0A1C] shadow-sm border border-rose-100 shrink-0">
                        <FileText className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">Application Reference</p>
                        <p className="font-mono text-xl md:text-2xl font-bold text-slate-900">{account.refrencenumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center self-start md:self-auto">
                      <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm border ${
                        account.user?.kycStatus === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        account.user?.kycStatus === 'pending' || !account.user?.kycStatus ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {(account.user?.kycStatus === 'pending' || !account.user?.kycStatus) && (
                           <span className="relative flex h-2.5 w-2.5">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                           </span>
                        )}
                        {account.user?.kycStatus === 'verified' ? <CheckCircle className="w-4 h-4" /> : 
                         (account.user?.kycStatus && account.user.kycStatus !== 'pending') ? <AlertCircle className="w-4 h-4" /> : null}
                        <span className="uppercase tracking-wider text-xs">
                          {account.user?.kycStatus ? account.user.kycStatus : 'Pending'}
                        </span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 mb-8">
                    <div className="flex flex-col gap-1.5">
                       <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> Account Type</p>
                       <p className="text-base text-slate-900 font-semibold">{account.account_type || 'Savings'} Account</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                       <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> PAN Number</p>
                       <p className="text-base text-slate-900 font-semibold">{account.user?.pan_id || 'N/A'}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                       <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Aadhaar Number</p>
                       <p className="text-base text-slate-900 font-semibold">{account.user?.adhar_id || 'N/A'}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                       <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number</p>
                       <p className="text-base text-slate-900 font-semibold">{account.user?.phone || 'N/A'}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2">
                       <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Residential Address</p>
                       <p className="text-base text-slate-900 font-semibold truncate hover:text-clip hover:whitespace-normal transition-all" title={account.user?.address}>{account.user?.address || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="relative z-10 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex items-start sm:items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-blue-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-blue-900 mb-0.5">Application Under Review</h4>
                      <p className="text-sm text-blue-800/80 leading-snug">Please wait for admin instructions. Your submitted documents and details are currently being verified.</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-5 border border-slate-100">
                <FileText className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">No Applications Found</h4>
              <p className="text-slate-500 mb-8 max-w-sm">You haven't submitted any account applications yet. Apply for a new account to see its status here.</p>
              <button
                onClick={() => setApplyaccount(true)}
                className="flex items-center gap-2 bg-[#5B0A1C] text-white px-6 py-3 rounded-xl font-bold shadow-[0_10px_20px_-10px_rgba(91,10,28,0.5)] hover:bg-[#420714] hover:-translate-y-0.5 transition-all"
              >
                <Plus className="w-5 h-5" />
                Apply Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Basic Create Account */}
      {applyaccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Apply for New Account</h3>
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <select
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] outline-none transition-all text-slate-700"
                value={newAccountData.account_type}
                onChange={e => setNewAccountData({ ...newAccountData, account_type: e.target.value })}
                required
              >
               {accounts.length === 1 &&
               (accounts[0].account_type === "Savings" ? <option value="Current">Current Account</option> : <option value="Savings">Savings Account</option>)
               }
                { accounts.length === 0 && <>
                <option value="Savings">Savings Account</option>
                <option value="Current">Current Account</option>
                </>
                }

                

              </select>
              <input
                placeholder="PAN Number"
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] outline-none transition-all"
                value={newAccountData.pan_id}
                onChange={e => setNewAccountData({ ...newAccountData, pan_id: e.target.value })}
                required
              />
              <input
                placeholder="Aadhaar Number"
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] outline-none transition-all"
                value={newAccountData.adhar_id}
                onChange={e => setNewAccountData({ ...newAccountData, adhar_id: e.target.value })}
                required
              />
              <input
                placeholder="Residential Address"
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] outline-none transition-all"
                value={newAccountData.address}
                onChange={e => setNewAccountData({ ...newAccountData, address: e.target.value })}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] outline-none transition-all"
                value={newAccountData.phone}
                onChange={e => setNewAccountData({ ...newAccountData, phone: e.target.value })}
                required
              />
              <div className="relative">
                <input
                  type="text"
                  placeholder="OTP Code"
                  maxLength="6"
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] outline-none transition-all tracking-widest font-mono"
                  value={newAccountData.otp}
                  onChange={e => setNewAccountData({ ...newAccountData, otp: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpTimer > 0}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase transition-colors px-2 py-1 rounded ${otpTimer > 0 ? 'text-slate-400 bg-slate-100 cursor-not-allowed' : 'text-[#5B0A1C] hover:text-amber-600 bg-rose-50 shadow-sm'}`}
                >
                  {otpTimer > 0 ? `Wait ${otpTimer}s` : (isOtpSent ? "Resend OTP" : "Get OTP")}
                </button>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setApplyaccount(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-medium transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-[#5B0A1C] text-white hover:bg-[#420714] rounded-xl font-medium shadow-[0_10px_20px_-10px_rgba(91,10,28,0.5)] transition-all">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
    
      )}
    </div>
  );
};

export default AccountsOverview;
