import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
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

      
            <div className="relative z-10 flex">
               <Sidebar setislogin={setislogin} />
            </div>

            <main className="flex-1 relative z-10 h-screen overflow-y-auto p-6 md:p-12 pb-24 border-l border-white/40 shadow-inner">
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
            </main>
        </div>
    );
};

export default Dashboard;

