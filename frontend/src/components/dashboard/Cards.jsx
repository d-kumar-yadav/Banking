import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, ShieldCheck, Star, Plane, ShoppingBag, Clock, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import LottiePackage from "lottie-react";

// Assuming coinAnimation is available in assets
import coinAnimation from "../../assets/Fake 3D vector coin.json";
const Lottie = LottiePackage.default || LottiePackage;

const Cards = () => {
    const [activeTab, setActiveTab] = useState('active'); // active, apply, history
    const [applyingFor, setApplyingFor] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState("");
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch user's accounts (which contain active cards)
    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/accounts/user/getallaccount', { withCredentials: true });
            if (res.data.success) {
                setAccounts(res.data.accounts);
                if (res.data.accounts.length > 0) {
                    setSelectedAccountId(res.data.accounts[0]._id);
                }
            }
        } catch (err) {
            console.error("Failed to fetch accounts", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch card application history
    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/cards/history', { withCredentials: true });
            if (res.data.success) {
                setHistory(res.data.applications);
            }
        } catch (err) {
            console.error("Failed to fetch card history", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        } else if (activeTab === 'active') {
            fetchAccounts(); // Refresh active cards
        }
    }, [activeTab]);

    const handleApply = async (cardName, cardType) => {
        if (!selectedAccountId) {
            toast.error("Please open a bank account first to apply for a card.");
            return;
        }

        setApplyingFor(cardName);
        try {
            const res = await axios.post('/api/cards/apply', {
                accountId: selectedAccountId,
                cardType,
                cardName
            }, { withCredentials: true });
            
            if (res.status === 201) {
                toast.success(`Application for ${cardName} submitted!`, { duration: 4000 });
                setActiveTab('history');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to apply for ${cardName}`);
        } finally {
            setApplyingFor(null);
        }
    };

    const formatCardNumber = (num) => {
        return num ? num.match(/.{1,4}/g).join(' ') : '**** **** **** ****';
    };

    const creditCardCatalog = [
        {
            name: "Sapphire Reserve Credit Card",
            type: "Super Premium",
            fee: "₹5,000 / year",
            color: "from-slate-900 to-indigo-900",
            icon: <Star className="text-amber-400 w-8 h-8" />,
            features: ["Unlimited Airport Lounge Access Global", "0% Forex Markup on International Spends", "10x Reward Points on Dining"],
        },
        {
            name: "Ruby Rewards Credit Card",
            type: "Lifestyle",
            fee: "Lifetime Free",
            color: "from-[#5B0A1C] to-rose-900",
            icon: <ShoppingBag className="text-rose-200 w-8 h-8" />,
            features: ["5% Cashback on Groceries & Utilities", "Buy 1 Get 1 Free Movie Tickets", "Zero Annual Fee"],
        },
        {
            name: "Titanium Travel Card",
            type: "Travel",
            fee: "₹2,500 / year",
            color: "from-slate-700 to-slate-800",
            icon: <Plane className="text-sky-400 w-8 h-8" />,
            features: ["Free Comprehensive Travel Insurance", "Global Wi-Fi Access in 100+ countries", "5x Points on Flight Bookings"],
        },
        {
            name: "Emerald Elite Credit Card",
            type: "Luxury",
            fee: "₹10,000 / year",
            color: "from-emerald-900 to-slate-900",
            icon: <Star className="text-emerald-400 w-8 h-8" />,
            features: ["Complimentary Golf Course Access", "24/7 Dedicated Concierge", "Lowest Interest Rate"],
        }
    ];

    // Collect all active cards from all accounts
    const allActiveCards = accounts.reduce((acc, account) => {
        if (account.cards && account.cards.length > 0) {
            account.cards.forEach(c => acc.push({ ...c, accountType: account.account_type, accountNumber: account.accountNumber }));
        }
        return acc;
    }, []);

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
            <div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Card Center</h2>
                <p className="text-slate-500 mt-2 font-medium">Manage your active cards or apply for new ones.</p>
            </div>

            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 flex flex-col">
                <div className="flex border-b border-slate-200/60 p-2 gap-2 bg-slate-50/50">
                    <button 
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${activeTab === 'active' ? 'bg-white text-[#5B0A1C] shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                    >
                        <CreditCard className="w-4 h-4" /> My Active Cards
                    </button>
                    <button 
                        onClick={() => setActiveTab('apply')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${activeTab === 'apply' ? 'bg-white text-[#5B0A1C] shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                    >
                        <ShieldCheck className="w-4 h-4" /> Apply for Card
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${activeTab === 'history' ? 'bg-white text-[#5B0A1C] shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                    >
                        <Clock className="w-4 h-4" /> Application History
                    </button>
                </div>

                <div className="p-8 flex-1 overflow-auto">
                    {/* ACTIVE CARDS TAB */}
                    {activeTab === 'active' && (
                        <div className="space-y-6">
                            {loading ? (
                                <div className="flex justify-center py-12"><div className="w-24 h-24"><Lottie animationData={coinAnimation} loop={true} /></div></div>
                            ) : allActiveCards.length === 0 ? (
                                <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200">
                                    <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-slate-700">No Active Cards</h3>
                                    <p className="text-slate-500 mt-2 max-w-md mx-auto">You don't have any active debit or credit cards. Apply for one from the catalog!</p>
                                    <button onClick={() => setActiveTab('apply')} className="mt-6 px-6 py-2.5 bg-[#5B0A1C] text-white rounded-lg font-bold shadow-md hover:bg-[#420714] transition-colors">Browse Cards</button>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-8">
                                    {allActiveCards.map((card, idx) => (
                                        <div key={idx} className={`rounded-3xl p-8 relative overflow-hidden shadow-2xl transition-all hover:-translate-y-1 ${card.cardType === 'credit' ? 'bg-gradient-to-br from-slate-900 to-indigo-900 text-white' : 'bg-gradient-to-br from-[#5B0A1C] to-rose-900 text-white'}`}>
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-bl-full pointer-events-none"></div>
                                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-tr-full pointer-events-none"></div>
                                            
                                            <div className="flex justify-between items-start relative z-10 mb-12">
                                                <div className="flex flex-col">
                                                    <span className="text-2xl font-black tracking-tight text-white/90">
                                                        MY<span className="text-white/60">BANK</span>
                                                    </span>
                                                    <span className="text-[10px] uppercase tracking-widest font-bold text-white/70 mt-1">{card.cardType === 'credit' ? 'Credit Card' : 'Debit Card'}</span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${card.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                                    {card.status}
                                                </span>
                                            </div>

                                            <div className="relative z-10 mb-8">
                                                <p className="font-mono text-2xl tracking-widest text-white shadow-sm">{formatCardNumber(card.cardNumber)}</p>
                                            </div>

                                            <div className="flex justify-between items-end relative z-10">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">Linked Account</p>
                                                    <p className="font-medium text-sm font-mono">{card.accountNumber}</p>
                                                </div>
                                                <div className="flex gap-6 text-right">
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">Valid Thru</p>
                                                        <p className="font-medium font-mono">{card.expiryDate}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">CVV</p>
                                                        <p className="font-medium font-mono">{card.cvv}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* APPLY FOR CARD TAB */}
                    {activeTab === 'apply' && (
                        <div className="space-y-8">
                            {accounts.length > 0 && (
                                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 max-w-xl mx-auto overflow-hidden">
                                    <span className="font-semibold text-slate-700 whitespace-nowrap">Link card to account:</span>
                                    <select 
                                        className="w-full sm:flex-1 bg-white border border-slate-300 rounded-lg px-4 py-2 font-medium text-slate-700 outline-none focus:border-[#5B0A1C] text-ellipsis overflow-hidden"
                                        value={selectedAccountId}
                                        onChange={(e) => setSelectedAccountId(e.target.value)}
                                    >
                                        {accounts.map(acc => (
                                            <option key={acc._id} value={acc._id}>{acc.account_type} - {acc.accountNumber}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Standard Debit Card Offer */}
                            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                                <div className="absolute right-0 top-0 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl group-hover:bg-rose-500/30 transition-all pointer-events-none"></div>
                                <div className="relative z-10 max-w-xl">
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 inline-block">Everyday Banking</span>
                                    <h3 className="text-3xl font-black mb-3">Premium Debit Card</h3>
                                    <p className="text-slate-300 mb-6 leading-relaxed">Directly linked to your bank account. Enjoy zero issuance fees, tap-to-pay capability, and unlimited ATM withdrawals globally.</p>
                                    <ul className="flex flex-wrap gap-4 mb-6 text-sm text-emerald-400 font-medium">
                                        <li className="flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Zero Issuance Fee</li>
                                        <li className="flex items-center gap-1"><CheckCircle className="w-4 h-4"/> NFC Enabled</li>
                                    </ul>
                                </div>
                                <div className="relative z-10 w-full md:w-auto shrink-0">
                                    <button 
                                        onClick={() => handleApply('Standard Premium Debit', 'debit')}
                                        disabled={applyingFor === 'Standard Premium Debit'}
                                        className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl font-black shadow-lg hover:bg-slate-100 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                        {applyingFor === 'Standard Premium Debit' ? 'Processing...' : 'Apply for Debit Card'}
                                    </button>
                                </div>
                            </div>

                            <hr className="border-slate-200" />
                            
                            <h3 className="text-2xl font-black text-slate-800 pt-4">Credit Card Collection</h3>
                            <div className="grid lg:grid-cols-3 gap-8">
                                {creditCardCatalog.map((card, i) => (
                                    <div key={i} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
                                        <div className={`h-40 bg-gradient-to-br ${card.color} p-6 relative overflow-hidden`}>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none"></div>
                                            
                                            <div className="flex justify-between items-start relative z-10">
                                                {card.icon}
                                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-wider">{card.type}</span>
                                            </div>
                                            <div className="absolute bottom-6 left-6 relative z-10 mt-8">
                                                <h3 className="text-white font-black text-lg tracking-wide">{card.name}</h3>
                                            </div>
                                        </div>

                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="mb-6">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Annual Fee</p>
                                                <p className="text-lg font-black text-slate-800">{card.fee}</p>
                                            </div>
                                            
                                            <div className="space-y-3 mb-8 flex-1">
                                                {card.features.map((f, j) => (
                                                    <div key={j} className="flex items-start gap-3">
                                                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                                        <p className="text-sm font-medium text-slate-600">{f}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <button 
                                                onClick={() => handleApply(card.name, 'credit')}
                                                disabled={applyingFor === card.name}
                                                className="w-full py-4 bg-[#5B0A1C] hover:bg-[#420714] text-white rounded-xl font-bold shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                                            >
                                                {applyingFor === card.name ? 'Processing...' : 'Apply for Credit Card'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* HISTORY TAB */}
                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center p-8"><div className="w-24 h-24"><Lottie animationData={coinAnimation} loop={true} /></div></div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">No card applications found.</div>
                            ) : (
                                history.map(app => (
                                    <div key={app._id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row justify-between md:items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${app.cardType === 'credit' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-[#5B0A1C]'}`}>
                                                <CreditCard className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{app.cardType} Card</p>
                                                <h4 className="text-lg font-bold text-slate-800">{app.cardName}</h4>
                                                <p className="text-sm text-slate-500 font-mono mt-1">App ID: {app.applicationId}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                                            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border ${
                                                app.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                                app.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                                                'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {app.status === 'Approved' ? <CheckCircle className="w-3.5 h-3.5" /> : 
                                                 app.status === 'Rejected' ? <XCircle className="w-3.5 h-3.5" /> : 
                                                 <Clock className="w-3.5 h-3.5" />}
                                                {app.status}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium">{new Date(app.createdAt).toLocaleDateString()}</span>
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

export default Cards;

