import { useState, useEffect } from 'react';
import axios from 'axios';
import { History, ArrowDownLeft, ArrowUpRight, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import LottiePackage from "lottie-react";
import coinAnimation from "../../assets/Fake 3D vector coin.json";

const Lottie = LottiePackage.default || LottiePackage;

const TransactionHistory = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token") || cookieStore?.get?.("token")?.value;
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/accounts/user/getallaccount', config);
        if (res.data.success && res.data.accounts.length > 0) {
          setAccounts(res.data.accounts);
          setSelectedAccount(res.data.accounts[0].accountNumber);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (!selectedAccount) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:4000/api/intra/transaction_history/${selectedAccount}`, config);
        if (res.data.success) {
          setTransactions(res.data.transactions);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load transaction history');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [selectedAccount]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Transaction History</h2>
          <p className="text-slate-500 mt-2">Track your incoming and outgoing funds.</p>
        </div>
        
        {accounts.length > 0 && (
          <div className="relative">
            <select 
              className="appearance-none bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-700 py-3 pl-5 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] font-mono shadow-sm"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              {accounts.map(acc => (
                <option key={acc._id} value={acc.accountNumber}>{acc.accountNumber}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="w-40 h-40"><Lottie animationData={coinAnimation} loop={true} /></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700">No Transactions Found</h3>
            <p className="text-slate-500 mt-2">Looks like you haven't made any transactions with this account yet.</p>
          </div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50 backdrop-blur-sm sticky top-0 z-10">
                  <th className="py-5 px-6 font-semibold text-slate-600 text-sm">Type</th>
                  <th className="py-5 px-6 font-semibold text-slate-600 text-sm">Details</th>
                  <th className="py-5 px-6 font-semibold text-slate-600 text-sm">Date & Time</th>
                  <th className="py-5 px-6 font-semibold text-slate-600 text-sm">Status</th>
                  <th className="py-5 px-6 font-semibold text-slate-600 text-sm text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((txn, idx) => {
                  const isSent = txn.transactionType === 'Sent';
                  return (
                    <tr key={txn.transactionId || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSent ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                          {isSent ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-800">{isSent ? 'Transfer To' : 'Received From'}</p>
                        <p className="text-sm text-slate-500 font-mono mt-0.5">{isSent ? txn.toaccount : txn.fromaccount}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-800">{txn.paymentDate}</p>
                        <p className="text-sm text-slate-500">{txn.paymentTime}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          txn.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          txn.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`font-bold text-lg ${isSent ? 'text-slate-800' : 'text-emerald-600'}`}>
                          {isSent ? '-' : '+'}₹{txn.amount?.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
