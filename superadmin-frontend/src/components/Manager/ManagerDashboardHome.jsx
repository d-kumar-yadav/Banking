import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Users, FileText, Activity, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, colorClass, borderClass }) => (
  <div className={`bg-white p-6 rounded-2xl flex items-center justify-between transition-all duration-300 border ${borderClass} shadow-sm hover:-translate-y-1 hover:shadow-md cursor-pointer group`}>
    <div>
      <p className="text-sm font-semibold mb-1 text-slate-500 uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
    </div>
    <div className={`p-4 rounded-xl transition-transform duration-300 group-hover:scale-110 ${colorClass}`}>{icon}</div>
  </div>
);

const ManagerDashboardHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pendingAccounts: 0, reviewLoans: 0, totalLoans: 0, branchBalance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        //         const results = await Promise.all([
        //    axios.get('/api/accounts/Manager/pending-accounts'),
        //    axios.get('/api/loan/Manager/review', { withCredentials: true }),
        //    axios.get('/api/loan/Manager/all', { withCredentials: true }),
        //    axios.get('/api/employee/branch/balance', { withCredentials: true })
        // ]);
        
        // setStats({
        //   
        //   pendingAccounts: results[0].data.pendingaccounts?.length || 0,
        //   reviewLoans: results[1].data.reviewloan?.length || 0,
        //   totalLoans: results[2].data.loans?.length || 0,
        //   branchBalance: results[3].data.branchBalance || 0,
        // });
        const results = await Promise.allSettled([
           axios.get('/api/accounts/Manager/pending-accounts'),
           axios.get('/api/loan/Manager/review', { withCredentials: true }),
           axios.get('/api/loan/Manager/all', { withCredentials: true }),
           axios.get('/api/employee/branch/balance', { withCredentials: true })
        ]);
        
        setStats({
          pendingAccounts: results[0].status === 'fulfilled' ? (results[0].value.data.pendingaccounts?.length || 0) : 0,
          reviewLoans: results[1].status === 'fulfilled' ? (results[1].value.data.reviewloan?.length || 0) : 0,
          totalLoans: results[2].status === 'fulfilled' ? (results[2].value.data.loans?.length || 0) : 0,
          branchBalance: results[3].status === 'fulfilled' ? (results[3].value.data.branchBalance || 0) : 0,
        });
      } catch (error) {
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full">
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-slate-900">Welcome Back, Manager</h1>
          <p className="text-slate-500">Here's what's happening with your branch today.</p>
        </div>
        
        {/* Premium Branch Balance Hero Card - Light Theme */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-6 rounded-2xl shadow-lg border border-emerald-100 min-w-[320px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-blue-400/10 blur-2xl transition-transform duration-700 group-hover:scale-150"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-emerald-400/10 blur-xl transition-transform duration-700 group-hover:scale-150"></div>
          
          <div className="relative z-10 flex items-center justify-between mb-3">
            <span className="text-slate-500 font-bold tracking-wider text-xs uppercase">Available Vault Balance</span>
            <div className="p-2 bg-white rounded-lg border border-emerald-50 shadow-sm">
               <Activity size={18} className="text-emerald-500" />
            </div>
          </div>
          <h2 className="relative z-10 text-4xl font-extrabold text-slate-800 tracking-tight">
            ${stats.branchBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Pending Accounts" value={stats.pendingAccounts}
          icon={<Users size={24} className="text-emerald-600" />}
          colorClass="bg-emerald-50" borderClass="border-slate-200 hover:border-emerald-300" />
        <StatCard title="Loans to Review" value={stats.reviewLoans}
          icon={<FileText size={24} className="text-amber-600" />}
          colorClass="bg-amber-50" borderClass="border-slate-200 hover:border-amber-300" />
        <StatCard title="Total Loans" value={stats.totalLoans}
          icon={<Activity size={24} className="text-indigo-600" />}
          colorClass="bg-indigo-50" borderClass="border-slate-200 hover:border-indigo-300" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-2">
          <h2 className="text-xl font-bold mb-4 text-slate-800">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/ManagerDashboard/accounts" className="block p-4 rounded-xl transition-all duration-200 bg-slate-50 hover:bg-emerald-50 hover:shadow-sm border border-slate-100 hover:border-emerald-100 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Users size={20} />
                  </div>
                  <span className="font-semibold text-slate-800">Review Pending Accounts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-700">
                    {stats.pendingAccounts} New
                  </span>
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-500" />
                </div>
              </div>
            </Link>
            
            <Link to="/ManagerDashboard/loans" className="block p-4 rounded-xl transition-all duration-200 bg-slate-50 hover:bg-amber-50 hover:shadow-sm border border-slate-100 hover:border-amber-100 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <FileText size={20} />
                  </div>
                  <span className="font-semibold text-slate-800">Review Loan Applications</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-700">
                    {stats.reviewLoans} Pending
                  </span>
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-amber-500" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardHome;
