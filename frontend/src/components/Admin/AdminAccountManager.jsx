import React, { useState } from 'react';
import axios from 'axios';
import { Search, ShieldAlert, CheckCircle, Lock, Unlock, DollarSign, Activity, AlertTriangle, User, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAccountManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [account, setAccount] = useState(null);
  const [flaggedTxns, setFlaggedTxns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    try {
      const accRes = await axios.get(`http://localhost:4000/api/accounts/admin/accountdetails/${searchQuery}`, { withCredentials: true });
      setAccount(accRes.data.account);
      try {
        const txnsRes = await axios.get(`http://localhost:4000/api/accounts/admin/flagged-transactions/${searchQuery}`, { withCredentials: true });
        setFlaggedTxns(txnsRes.data.transactions || []);
      } catch (err) {
        if (err.response?.status === 404) setFlaggedTxns([]);
        else console.error("Failed to fetch flagged transactions");
      }
      setActiveTab('details'); // Reset to default tab on new search
    } catch (error) {
      toast.error('Account not found');
      setAccount(null); setFlaggedTxns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfreeze = async () => {
    try {
      await axios.post(`http://localhost:4000/api/accounts/admin/approve-frozen-account/${account.accountNumber}`, {}, { withCredentials: true });
      toast.success('Account unfrozen successfully');
      setAccount({ ...account, status: 'Active' });
    } catch (error) { toast.error('Failed to unfreeze account'); }
  };

  const handleInitialFund = async (e) => {
    e.preventDefault();
    if (!fundAmount || fundAmount <= 0) { toast.error('Enter a valid amount'); return; }
    try {
      const idempotencykey = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      await axios.post(`http://localhost:4000/api/intra/system/intial_fund`, {
        toaccount: account.accountNumber, amount: Number(fundAmount), idempotencykey
      }, { withCredentials: true });
      toast.success(`₹${fundAmount} credited successfully`);
      setFundAmount('');
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to issue initial funds'); }
  };           

  const tabs = [
    { id: 'details', label: 'Account Details', icon: User, color: '#C8854A', bgColor: '#FAF5EF' },
    { id: 'status', label: 'Manage Status', icon: ShieldAlert, color: account?.status === 'Active' ? '#10B981' : '#F43F5E', bgColor: account?.status === 'Active' ? '#ECFDF5' : '#FFF1F2' },
    { id: 'fund', label: 'Initial Funds', icon: DollarSign, color: '#C8854A', bgColor: '#FAF5EF' },
    { id: 'flagged', label: 'Flagged Transactions', icon: AlertTriangle, color: '#F59E0B', bgColor: '#FEF3C7' },
  ];

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col space-y-6 min-h-full p-2" style={{ background: '#FDF8F2' }}>
      <div>
        <h1 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: '#1C1208' }}>Account Manager</h1>
        <p className="text-lg" style={{ color: '#523A22' }}>Search and manage specific user accounts securely.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-2xl transition-all duration-300 hover:shadow-md" style={{ border: '1px solid #EDE0CE', boxShadow: '0 4px 12px rgba(61,40,16,0.04)' }}>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#C8854A]">
              <Search className="h-5 w-5" style={{ color: '#8B5E3C' }} />
            </div>
            <input type="text"
              className="block w-full pl-12 pr-4 py-4 rounded-xl text-lg leading-5 transition-all duration-300 outline-none"
              style={{ border: '1px solid #EDE0CE', background: '#FAF5EF', color: '#1C1208' }}
              placeholder="Enter Account Number..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={e => { e.target.style.borderColor = '#C8854A'; e.target.style.boxShadow = '0 0 0 4px rgba(200,133,74,0.1)'; e.target.style.background = '#FFFFFF'; }}
              onBlur={e => { e.target.style.borderColor = '#EDE0CE'; e.target.style.boxShadow = 'none'; e.target.style.background = '#FAF5EF'; }}
            />
          </div>
          <button type="submit" disabled={loading}
            className="px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 text-white shadow-lg"
            style={{ background: '#3D2810' }}
            onMouseEnter={e => e.currentTarget.style.background = '#2A1C08'}
            onMouseLeave={e => e.currentTarget.style.background = '#3D2810'}>
            {loading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : <span>Locate Account</span>}
          </button>
        </form>
      </div>

      {account && (
        <div className="flex flex-col lg:flex-row gap-8 animate-in slide-in-from-bottom-6 duration-500 flex-1">
          {/* Action Tabs Sidebar */}
          <div className="lg:w-1/4 flex flex-col space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 ml-2" style={{ color: '#8B5E3C' }}>Actions</h3>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 w-full text-left outline-none focus:ring-2 focus:ring-[#C8854A]/50 ${isActive ? 'bg-white shadow-sm' : 'hover:bg-white/60'}`}
                  style={{ 
                    border: isActive ? `1px solid #EDE0CE` : '1px solid transparent',
                    borderLeftWidth: isActive ? '4px' : '4px',
                    borderLeftColor: isActive ? tab.color : 'transparent'
                  }}
                >
                  <div className={`p-2 rounded-lg transition-colors`} style={{ background: isActive ? tab.bgColor : 'transparent' }}>
                    <Icon size={20} style={{ color: isActive ? tab.color : '#8B5E3C' }} />
                  </div>
                  <span className="font-semibold text-lg" style={{ color: isActive ? '#1C1208' : '#523A22' }}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Content Display */}
          <div className="lg:w-3/4 bg-white rounded-2xl overflow-hidden transition-all duration-500 flex flex-col" style={{ border: '1px solid #EDE0CE', boxShadow: '0 8px 30px rgba(61,40,16,0.06)' }}>
            <div className="p-8 flex-1 animate-in fade-in zoom-in-95 duration-300">
              
              {/* --- ACCOUNT DETAILS TAB --- */}
              {activeTab === 'details' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  {/* Header Profile Section */}
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-6">
                    <div className="relative">
                      {account.user?.image ? (
                        <img src={account.user.image} alt="User profile" className="w-24 h-24 rounded-full object-cover border-4 border-orange-50 shadow-sm" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center border-4 border-orange-100 shadow-sm">
                          <User size={40} className="text-[#C8854A]" />
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow">
                        {account.user?.kycStatus === 'verified' ? <CheckCircle size={16} className="text-emerald-500" /> : <Info size={16} className="text-amber-500" />}
                      </div>
                    </div>
                    <div className="text-center md:text-left flex-1">
                      <h2 className="text-3xl font-bold capitalize" style={{ color: '#1C1208' }}>{account.user?.name || 'Unknown User'}</h2>
                      <p className="font-mono text-lg" style={{ color: '#8B5E3C' }}>Account: {account.accountNumber}</p>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                         <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600 uppercase tracking-wide">{account.account_type}</span>
                         <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${account.user?.kycStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>KYC {account.user?.kycStatus || 'Pending'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Core Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Email Address', value: account.user?.email, colSpan: 'md:col-span-2' },
                      { label: 'Phone Number', value: account.user?.phone, colSpan: 'md:col-span-1' },
                      { label: 'Date of Birth', value: account.user?.date_of_birth ? new Date(account.user.date_of_birth).toLocaleDateString() : 'N/A', colSpan: 'md:col-span-1' },
                      { label: 'Gender', value: account.user?.gender, colSpan: 'md:col-span-1' },
                      { label: 'Credit Score', value: account.user?.creditScore, colSpan: 'md:col-span-1' },
                      { label: 'Monthly Income', value: account.user?.monthlyIncome ? `₹${account.user.monthlyIncome.toLocaleString()}` : 'N/A', colSpan: 'md:col-span-1' },
                      { label: 'Current Balance', value: `₹${account.balance?.toLocaleString() || '0'}`, colSpan: 'md:col-span-2', highlight: true },
                    ].map((item, idx) => (
                      <div key={idx} className={`p-4 rounded-xl flex flex-col justify-center ${item.colSpan}`} style={{ background: item.highlight ? '#FDF8F2' : '#FAF5EF', border: item.highlight ? '2px solid #C8854A' : '1px solid #EDE0CE' }}>
                        <p className="text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: '#8B5E3C' }}>{item.label}</p>
                        <p className={`font-medium ${item.highlight ? 'text-2xl font-bold' : 'text-lg'}`} style={{ color: '#1C1208' }}>{item.value || 'N/A'}</p>
                      </div>
                    ))}
                    <div className="p-4 rounded-xl flex flex-col justify-center md:col-span-3" style={{ background: '#FAF5EF', border: '1px solid #EDE0CE' }}>
                      <p className="text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: '#8B5E3C' }}>Full Address</p>
                      <p className="text-lg font-medium" style={{ color: '#1C1208' }}>{account.user?.address || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="mt-8">
                     <h3 className="text-lg font-bold mb-4 uppercase tracking-wider" style={{ color: '#523A22', borderBottom: '2px solid #EDE0CE', paddingBottom: '8px' }}>Identity Documents</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Aadhaar */}
                        <div className="border rounded-xl p-4" style={{ borderColor: '#EDE0CE' }}>
                           <div className="flex justify-between items-center mb-3">
                              <p className="font-bold" style={{ color: '#1C1208' }}>Aadhaar Card</p>
                              <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{account.user?.adhar_id || 'N/A'}</p>
                           </div>
                           <div className="bg-gray-50 h-40 rounded-lg flex items-center justify-center border border-dashed border-gray-300 overflow-hidden">
                              {account.user?.adhar_image ? (
                                <img src={account.user.adhar_image} alt="Aadhaar" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-gray-400 text-sm">Image not available</span>
                              )}
                           </div>
                        </div>

                        {/* PAN */}
                        <div className="border rounded-xl p-4" style={{ borderColor: '#EDE0CE' }}>
                           <div className="flex justify-between items-center mb-3">
                              <p className="font-bold" style={{ color: '#1C1208' }}>PAN Card</p>
                              <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{account.user?.pan_id || 'N/A'}</p>
                           </div>
                           <div className="bg-gray-50 h-40 rounded-lg flex items-center justify-center border border-dashed border-gray-300 overflow-hidden">
                              {account.user?.pan_image ? (
                                <img src={account.user.pan_image} alt="PAN" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-gray-400 text-sm">Image not available</span>
                              )}
                           </div>
                        </div>

                        {/* Signature */}
                        <div className="border rounded-xl p-4 md:col-span-2" style={{ borderColor: '#EDE0CE' }}>
                           <div className="mb-3">
                              <p className="font-bold" style={{ color: '#1C1208' }}>Authorized Signature</p>
                           </div>
                           <div className="bg-white h-32 rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden relative">
                              {account.user?.signature ? (
                                <img src={account.user.signature} alt="Signature" className="max-h-full max-w-full object-contain" />
                              ) : (
                                <span className="text-gray-400 text-sm">Signature not available</span>
                              )}
                           </div>
                        </div>
                        
                     </div>
                  </div>

                </div>
              )}

              {/* --- MANAGE STATUS TAB --- */}
              {activeTab === 'status' && (
                <div className="space-y-8 max-w-2xl mx-auto text-center mt-4">
                   <div className="flex justify-center mb-6">
                      <div className={`p-6 rounded-full inline-block ${account.status === 'Active' ? 'bg-emerald-50 border-4 border-emerald-100' : 'bg-rose-50 border-4 border-rose-100'}`}>
                         {account.status === 'Active' ? <CheckCircle size={64} className="text-emerald-500" /> : <Lock size={64} className="text-rose-500" />}
                      </div>
                   </div>
                   
                   <div>
                      <h2 className="text-3xl font-bold mb-2" style={{ color: '#1C1208' }}>Account is {account.status}</h2>
                      <p className="text-lg" style={{ color: '#523A22' }}>
                        {account.status === 'Active' ? 'This account is operating normally with no restrictions.' : 'This account has been frozen. Transactions cannot be processed.'}
                      </p>
                   </div>

                   {account.status === 'Frozen' && (
                     <div className="mt-10 p-8 rounded-2xl bg-white shadow-lg" style={{ border: '1px solid #FFE4E6' }}>
                       <h3 className="text-xl font-bold mb-4 text-rose-800">Approve Frozen Account</h3>
                       <p className="text-rose-600 mb-8">Unfreezing this account will restore full transaction capabilities to the user. Ensure all security checks have been completed before proceeding.</p>
                       <button onClick={handleUnfreeze} className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all transform active:scale-95 flex items-center justify-center space-x-3 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 shadow-lg">
                         <Unlock size={24} /><span>Approve & Unfreeze Account</span>
                       </button>
                     </div>
                   )}
                </div>
              )}

              {/* --- INITIAL FUNDS TAB --- */}
              {activeTab === 'fund' && (
                <div className="space-y-8 max-w-xl mx-auto mt-4">
                  <div className="text-center mb-8">
                    <div className="p-4 rounded-full bg-orange-50 inline-block mb-4"><DollarSign size={40} className="text-[#C8854A]" /></div>
                    <h2 className="text-3xl font-bold mb-2" style={{ color: '#1C1208' }}>Issue Initial Funds</h2>
                    <p className="text-lg" style={{ color: '#523A22' }}>Credit funds directly to account <span className="font-mono font-bold">{account.accountNumber}</span></p>
                  </div>

                  <form onSubmit={handleInitialFund} className="space-y-6 bg-white p-8 rounded-2xl shadow-xl" style={{ border: '1px solid #EDE0CE' }}>
                    <div>
                      <label className="block text-sm font-bold uppercase tracking-wider mb-2" style={{ color: '#8B5E3C' }}>Amount to Credit (₹)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-2xl font-bold text-[#8B5E3C]">₹</span>
                        </div>
                        <input type="number" min="1" required value={fundAmount} onChange={(e) => setFundAmount(e.target.value)}
                          className="block w-full pl-10 pr-4 py-4 text-2xl font-bold rounded-xl transition-all duration-300 outline-none"
                          style={{ border: '2px solid #EDE0CE', background: '#FAF5EF', color: '#1C1208' }}
                          placeholder="0.00"
                          onFocus={e => { e.target.style.borderColor = '#C8854A'; e.target.style.background = '#FFFFFF'; }}
                          onBlur={e => { e.target.style.borderColor = '#EDE0CE'; e.target.style.background = '#FAF5EF'; }}
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all transform active:scale-95 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 shadow-lg">
                      Confirm & Credit Account
                    </button>
                  </form>
                </div>
              )}

              {/* --- FLAGGED TRANSACTIONS TAB --- */}
              {activeTab === 'flagged' && (
                <div className="space-y-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid #EDE0CE' }}>
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><ShieldAlert size={28} /></div>
                      <div>
                        <h2 className="text-2xl font-bold" style={{ color: '#1C1208' }}>Flagged Transactions</h2>
                        <p className="text-md" style={{ color: '#523A22' }}>Intercepted by ML Fraud Detection</p>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-rose-100 text-rose-800 rounded-lg font-bold">
                      {flaggedTxns.length} Flagged
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2">
                    {flaggedTxns.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-6 bg-emerald-50 rounded-full mb-6">
                           <Activity size={64} className="text-emerald-500" />
                        </div>
                        <p className="text-2xl font-bold mb-2" style={{ color: '#1C1208' }}>Clean Record</p>
                        <p className="text-lg" style={{ color: '#523A22' }}>No suspicious activity detected for this account.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {flaggedTxns.map((txn) => (
                          <div key={txn._id} className="bg-white border-2 border-rose-100 rounded-xl p-5 hover:border-rose-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                            <div className="flex items-start space-x-4 ml-2">
                              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><AlertTriangle size={20} /></div>
                              <div>
                                <p className="font-bold text-lg" style={{ color: '#1C1208' }}>Suspicious Transfer Attempt</p>
                                <p className="text-md" style={{ color: '#523A22' }}>To Account: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{txn.toaccount}</span></p>
                                <p className="text-sm mt-2 text-gray-500 flex items-center"><Info size={14} className="mr-1"/> {new Date(txn.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex flex-row md:flex-col items-center justify-between md:items-end w-full md:w-auto p-4 md:p-0 bg-gray-50 md:bg-transparent rounded-lg">
                              <p className="text-2xl font-bold" style={{ color: '#1C1208' }}>₹{txn.amount}</p>
                              <div className="flex items-center mt-2 bg-rose-100 text-rose-800 px-3 py-1.5 rounded-lg font-semibold text-sm">
                                <span className="mr-2">Fraud Score:</span> 
                                <span className="bg-rose-500 text-white px-2 py-0.5 rounded">
                                  {txn.fraudScore ? txn.fraudScore.toFixed(2) : 'HIGH'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccountManager;
