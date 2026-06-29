import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { Building, Send, AlertCircle, Calendar, CheckCircle } from 'lucide-react';

const ActiveLoans = () => {
    const [loans, setLoans] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmLoanId, setConfirmLoanId] = useState(null);
    const [precloseLoanId, setPrecloseLoanId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Loans
                const loanRes = await axios.get('/api/loan/history', { withCredentials: true });
                if (loanRes.data.success) {
                    // Filter for only Active loans
                    setLoans(loanRes.data.loans.filter(loan => loan.status === 'Active'));
                }

                // Fetch Accounts for repayment
                const accRes = await axios.get('/api/accounts/user/getallaccount', { withCredentials: true });
                if (accRes.data.success) {
                    const activeAccs = accRes.data.accounts.filter(a => a.status === 'Active');
                    setAccounts(activeAccs);
                    if (activeAccs.length > 0) setSelectedAccount(activeAccs[0].accountNumber);
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        };
        fetchData();
    }, []);

    const handleRepay = async (loan_id) => {
        if (!selectedAccount) {
            toast.error("Please select an account to pay from.");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post('/api/loan/repay', {
                loan_id,
                account_number: selectedAccount
            }, { withCredentials: true });

            if (res.data.success) {
                toast.success(res.data.message);
                // Update local state to reflect new balance or closed status
                setLoans(prevLoans => prevLoans.map(loan => {
                    if (loan.loan_id === loan_id) {
                        return { 
                            ...loan, 
                            remainingBalance: res.data.remainingBalance,
                            status: res.data.status,
                            nextDueDate: res.data.status === 'Closed' ? loan.nextDueDate : new Date(new Date(loan.nextDueDate).setDate(new Date(loan.nextDueDate).getDate() + 30)).toISOString()
                        };
                    }
                    return loan;
                }).filter(loan => loan.status === 'Active'));
                
                // Reload page after a short delay to fetch updated account balances
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Repayment failed");
        } finally {
            setLoading(false);
        }
    };

    const handlePreclose = async (loan_id) => {
        if (!selectedAccount) {
            toast.error("Please select an account to pay from.");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post('/api/loan/preclose', {
                loan_id,
                account_number: selectedAccount
            }, { withCredentials: true });

            if (res.data.success) {
                toast.success(res.data.message, { duration: 4000 });
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Foreclosure failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Active Loans & EMI</h2>
                <p className="text-slate-500 mt-2">Manage your active loans and make EMI payments.</p>
            </div>

            {accounts.length > 0 && loans.length > 0 && (
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-700">Pay from Account:</span>
                    <select 
                        className="flex-1 p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#5B0A1C]/20 outline-none font-mono"
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                    >
                        {accounts.map(acc => (
                            <option key={acc.accountNumber} value={acc.accountNumber}>{acc.accountNumber} - Bal: ₹{acc.balance || '...'}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="grid gap-6">
                {loans.length === 0 ? (
                    <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-12 text-center flex flex-col items-center">
                        <Building className="w-16 h-16 text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">No Active Loans</h3>
                        <p className="text-slate-500 mt-2">You don't have any active loans that require repayment right now.</p>
                    </div>
                ) : (
                    loans.map(loan => {
                        const progress = ((loan.totalRepaymentAmount - loan.remainingBalance) / loan.totalRepaymentAmount) * 100;
                        const dueDate = new Date(loan.nextDueDate);
                        const isOverdue = dueDate < new Date();

                        return (
                            <div key={loan.loan_id} className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none"></div>
                                
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs rounded-full uppercase tracking-wider">{loan.loanPurpose} LOAN</span>
                                            <span className="font-mono text-sm text-slate-500 font-bold">{loan.loan_id}</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800">₹{(loan.remainingBalance || 0).toLocaleString()} <span className="text-sm font-medium text-slate-500">remaining</span></h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500 font-bold mb-1">Monthly EMI</p>
                                        <p className="text-xl font-bold text-rose-600">₹{(loan.monthlyEMI || 0).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-xs font-bold text-slate-500">
                                        <span>Paid: {Math.round((loan.totalRepaymentAmount - loan.remainingBalance) / loan.monthlyEMI)} of {loan.loanTerm} EMIs ({progress.toFixed(1)}%)</span>
                                        <span>Total: ₹{(loan.totalRepaymentAmount || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Interest</p>
                                        <p className="text-sm font-bold text-slate-700">{loan.interestRate || 10}% p.a.</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Term</p>
                                        <p className="text-sm font-bold text-slate-700">{loan.loanTerm} Months</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</p>
                                        <p className="text-sm font-bold text-slate-700">{new Date(loan.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Est. End Date</p>
                                        <p className="text-sm font-bold text-slate-700">
                                            {new Date(new Date(loan.createdAt).setMonth(new Date(loan.createdAt).getMonth() + loan.loanTerm)).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${isOverdue ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500">Next Due Date</p>
                                            <p className={`text-sm font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                                                {dueDate.toLocaleDateString()} {isOverdue && '(Overdue)'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Foreclose Flow */}
                                        {precloseLoanId === loan.loan_id ? (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => setPrecloseLoanId(null)}
                                                    disabled={loading}
                                                    className="px-4 py-3 rounded-xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all outline-none disabled:opacity-70"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    onClick={() => { handlePreclose(loan.loan_id); setPrecloseLoanId(null); }}
                                                    disabled={loading}
                                                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 rounded-xl font-bold shadow-md hover:-translate-y-0.5 transition-all outline-none disabled:opacity-70"
                                                >
                                                    <AlertCircle className="w-4 h-4" />
                                                    Confirm Foreclose ₹{(loan.remainingBalance || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                </button>
                                            </div>
                                        ) : confirmLoanId === loan.loan_id ? (
                                            // Pay EMI Confirmation Flow
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => setConfirmLoanId(null)}
                                                    disabled={loading}
                                                    className="px-4 py-3 rounded-xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all outline-none disabled:opacity-70"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    onClick={() => { handleRepay(loan.loan_id); setConfirmLoanId(null); }}
                                                    disabled={loading}
                                                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-bold shadow-md hover:-translate-y-0.5 transition-all outline-none disabled:opacity-70"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Confirm Pay ₹{(loan.monthlyEMI || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                </button>
                                            </div>
                                        ) : (
                                            // Default Buttons
                                            <>
                                                <button 
                                                    onClick={() => setPrecloseLoanId(loan.loan_id)}
                                                    disabled={loading}
                                                    className="flex items-center gap-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-4 py-3 rounded-xl font-bold shadow-sm transition-all outline-none disabled:opacity-70"
                                                >
                                                    Foreclose
                                                </button>
                                                <button 
                                                    onClick={() => setConfirmLoanId(loan.loan_id)}
                                                    disabled={loading}
                                                    className="flex items-center gap-2 bg-[#5B0A1C] hover:bg-[#420714] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:-translate-y-0.5 transition-all outline-none disabled:opacity-70"
                                                >
                                                    <Send className="w-4 h-4" />
                                                    Pay EMI
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <details className="mt-4 group bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden cursor-pointer">
                                    <summary className="p-4 font-semibold text-sm text-slate-700 outline-none flex items-center justify-between hover:bg-slate-100 transition-colors">
                                        View Full Application Details
                                        <span className="text-slate-400 group-open:rotate-180 transition-transform duration-300">▼</span>
                                    </summary>
                                    <div className="p-4 pt-0 text-sm grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-slate-100 mt-2">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 mb-0.5 uppercase">Annual Income</p>
                                            <p className="font-semibold text-slate-800">₹{loan.annualIncome?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 mb-0.5 uppercase">Employment Status</p>
                                            <p className="font-semibold text-slate-800">{loan.employmentStatus}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 mb-0.5 uppercase">Education Level</p>
                                            <p className="font-semibold text-slate-800">{loan.educationLevel}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 mb-0.5 uppercase">Marital Status</p>
                                            <p className="font-semibold text-slate-800">{loan.maritalStatus}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 mb-0.5 uppercase">Age</p>
                                            <p className="font-semibold text-slate-800">{loan.age} yrs</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 mb-0.5 uppercase">Gender</p>
                                            <p className="font-semibold text-slate-800">{loan.gender}</p>
                                        </div>
                                    </div>
                                </details>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

export default ActiveLoans;

