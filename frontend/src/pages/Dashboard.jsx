import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Loader from '../components/Loader';

import AccountsOverview from '../components/dashboard/AccountsOverview';
import TransferMoney from '../components/dashboard/TransferMoney';
import TransactionHistory from '../components/dashboard/TransactionHistory';
import LoanApply from '../components/dashboard/LoanApply';
import CreditSimulator from '../components/dashboard/CreditSimulator';

const Dashboard = ({setislogin}) => {
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
                    <Route path="/credit" element={<CreditSimulator />} />
                </Routes>
            </main>
        </div>
    );
};

export default Dashboard;
