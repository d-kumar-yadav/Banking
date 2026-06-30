import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Menu } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import Loader from '../components/Loader';

import AccountsOverview from '../components/dashboard/AccountsOverview';
import TransferMoney from '../components/dashboard/TransferMoney';
import TransactionHistory from '../components/dashboard/TransactionHistory';
import LoanApply from '../components/dashboard/LoanApply';
import ActiveLoans from '../components/dashboard/ActiveLoans';
import CreditSimulator from '../components/dashboard/CreditSimulator';
import Profile from '../components/dashboard/Profile';
import Cards from '../components/dashboard/Cards';

const Dashboard = ({setislogin}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000');
        
        socket.emit('join', userId);

        socket.on('account_frozen', (data) => {
            toast.error(
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-rose-600 text-lg">âš ï¸ CRITICAL FRAUD ALERT</span>
                    <span className="text-slate-700">{data.message}</span>
                    <span className="text-sm text-slate-500 font-mono mt-1">Affected Account: {data.accountNumber}</span>
                </div>, 
                { duration: 15000, position: 'top-center', style: { border: '2px solid #ef4444', minWidth: '400px' } }
            );
        });

        return () => {
            socket.disconnect();
        };
    }, []);
    return (
        <div className="min-h-screen bg-[#FDFDFD] relative overflow-hidden flex selection:bg-[#5B0A1C] selection:text-white">
      
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[120px] mix-blend-multiply pointer-events-none transform translate-x-1/3 -translate-y-1/3 z-0"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#5B0A1C]/5 rounded-full blur-[100px] mix-blend-multiply pointer-events-none transform -translate-x-1/4 translate-y-1/4 z-0"></div>
            <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-rose-900/5 rounded-full blur-[100px] mix-blend-multiply pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-0"></div>

      
            <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
               <Sidebar setislogin={setislogin} setIsSidebarOpen={setIsSidebarOpen} />
            </div>

            {/* Overlay for mobile when sidebar is open */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <main className="flex-1 relative z-10 h-screen overflow-y-auto border-l border-white/40 shadow-inner flex flex-col">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 bg-white/40 backdrop-blur-xl border-b border-white/60 sticky top-0 z-30">
                    <span className="text-xl font-black tracking-tighter text-[#5B0A1C]">
                        MY<span className="text-slate-800">BANK</span>
                    </span>
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 bg-white rounded-lg shadow-sm text-slate-600 hover:text-[#5B0A1C]"
                    >
                        <Menu size={24} />
                    </button>
                </div>
                
                <div className="p-4 md:p-12 pb-24 flex-1">
                <Routes>
                    <Route path="/" element={<AccountsOverview />} />
                    <Route path="/transfer" element={<TransferMoney />} />
                    <Route path="/history" element={<TransactionHistory />} />
                    <Route path="/loan" element={<LoanApply />} />
                    <Route path="/active-loans" element={<ActiveLoans />} />
                    <Route path="/credit" element={<CreditSimulator />} />
                    <Route path="/cards" element={<Cards />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;

