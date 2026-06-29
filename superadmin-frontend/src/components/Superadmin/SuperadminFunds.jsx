import React, { useState } from 'react';
import axios from '../../api/axiosInstance';
import { Banknote, Search, ArrowRightLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const SuperadminFunds = () => {
  const [allocationData, setAllocationData] = useState({
    accountNumber: '',
    amount: ''
  });
  const [allocating, setAllocating] = useState(false);

  const [searchAccount, setSearchAccount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleAllocationChange = (e) => {
    setAllocationData({ ...allocationData, [e.target.name]: e.target.value });
  };

  const generateIdempotencyKey = () => {
    return 'idemp_' + Math.random().toString(36).substr(2, 9) + Date.now();
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!allocationData.accountNumber || !allocationData.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    setAllocating(true);
    try {
      const response = await axios.post('http://localhost:4000/api/branche/allocate-funds', {
        accountNumber: allocationData.accountNumber,
        amount: Number(allocationData.amount),
        idempotencykey: generateIdempotencyKey()
      }, { withCredentials: true });

      toast.success('Funds allocated successfully');
      setAllocationData({ accountNumber: '', amount: '' });
      
      // If we are currently viewing transactions for this account, refresh them
      if (searchAccount === allocationData.accountNumber) {
        handleSearch(null, allocationData.accountNumber);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to allocate funds');
    } finally {
      setAllocating(false);
    }
  };

  const handleSearch = async (e, accountToSearch = searchAccount) => {
    if (e) e.preventDefault();
    if (!accountToSearch) return;

    setSearching(true);
    setHasSearched(true);
    try {
      const response = await axios.get(`http://localhost:4000/api/branche/${accountToSearch}/transactions`, { withCredentials: true });
      setTransactions(response.data.transactions || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Funds & Transactions</h1>
        <p className="text-slate-500">Manage central vault allocations and view branch transaction histories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocate Funds Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-3 text-slate-800">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Banknote size={20} />
                </div>
                <h2 className="text-lg font-bold">Allocate Funds</h2>
              </div>
              <p className="text-sm text-slate-500 mt-2">Send funds from Central Vault to a Branch Account.</p>
            </div>
            <form onSubmit={handleAllocate} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Branch Account Number</label>
                  <input 
                    type="text" 
                    name="accountNumber" 
                    value={allocationData.accountNumber} 
                    onChange={handleAllocationChange} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" 
                    placeholder="e.g. BRN00000000001" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    name="amount" 
                    min="1"
                    value={allocationData.amount} 
                    onChange={handleAllocationChange} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" 
                    placeholder="0.00" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={allocating}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex justify-center items-center disabled:opacity-70"
                >
                  {allocating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    'Transfer Funds'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-3 text-slate-800">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <ArrowRightLeft size={20} />
                </div>
                <h2 className="text-lg font-bold">Branch Transactions</h2>
              </div>
              
              <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
                <input 
                  type="text" 
                  value={searchAccount} 
                  onChange={(e) => setSearchAccount(e.target.value)} 
                  className="px-3 py-2 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64" 
                  placeholder="Enter Branch Acc No." 
                />
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-r-lg transition-colors flex items-center justify-center"
                >
                  <Search size={18} />
                </button>
              </form>
            </div>

            <div className="flex-1 p-6 bg-slate-50 overflow-y-auto min-h-[400px]">
              {searching ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : !hasSearched ? (
                <div className="flex flex-col justify-center items-center h-full text-slate-400">
                  <Search size={48} className="mb-4 opacity-50" />
                  <p>Search for a branch account to view its transactions.</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-slate-400">
                  <ArrowRightLeft size={48} className="mb-4 opacity-50" />
                  <p>No transactions found for this account.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => {
                    const isCredit = tx.toaccount === searchAccount;
                    return (
                      <div key={tx._id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-full ${isCredit ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {isCredit ? 'Fund Received' : 'Fund Transferred'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {isCredit ? `From: ${tx.fromaccount}` : `To: ${tx.toaccount}`}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(tx.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${isCredit ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString()}
                          </p>
                          <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full ${
                            tx.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                            tx.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminFunds;
