import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, Activity, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';


const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl flex items-center justify-between transition-all duration-300 border border-[#EDE0CE] shadow-[0_1px_4px_rgba(61,40,16,0.06)] hover:-translate-y-1 hover:shadow-lg hover:border-[#C8854A] cursor-pointer group">
    <div>
      <p className="text-sm font-medium mb-1 transition-colors group-hover:text-[#8B5E3C]" style={{ color: '#523A22' }}>{title}</p>
      <h3 className="text-3xl font-bold" style={{ color: '#1C1208' }}>{value}</h3>
    </div>
    <div className={`p-4 rounded-xl transition-transform duration-300 group-hover:scale-110 ${color}`}>{icon}</div>
  </div>
);
const AdminDashboardHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pendingAccounts: 0, reviewLoans: 0, totalLoans: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const accountsRes = await axios.get('http://localhost:4000/api/accounts/admin/pending-accounts');
        const reviewLoansRes = await axios.get('http://localhost:4000/api/loan/admin/review');
        const allLoansRes = await axios.get('http://localhost:4000/api/loan/admin/all');
        setStats({
          pendingAccounts: accountsRes.data.pendingaccounts?.length || 0,
          reviewLoans: reviewLoansRes.data.reviewloan?.length || 0,
          totalLoans: allLoansRes.data.loans?.length || 0,
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
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#C8854A' }}></div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full p-2" style={{ background: '#FDF8F2' }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1C1208' }}>Welcome Back, Admin</h1>
        <p style={{ color: '#523A22' }}>Here's what's happening with your platform today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Pending Accounts" value={stats.pendingAccounts}
          icon={<Users size={24} style={{ color: '#8B5E3C' }} />}
          color="bg-[#F5EDE3]" />
        <StatCard title="Loans to Review" value={stats.reviewLoans}
          icon={<FileText size={24} style={{ color: '#523A22' }} />}
          color="bg-[#FAF5EF]" />
        <StatCard title="Total Loans" value={stats.totalLoans}
          icon={<Activity size={24} style={{ color: '#8B5E3C' }} />}
          color="bg-[#F5EDE3]" />
        <StatCard title="System Status" value="100%"
          icon={<TrendingUp size={24} className="text-teal-600" />}
          color="bg-teal-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl" style={{ border: '1px solid #EDE0CE', boxShadow: '0 1px 4px rgba(61,40,16,0.06)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#1C1208' }}>Quick Actions</h2>
          <div className="space-y-4">
            <Link to="/AdminDashboard/accounts" className="block p-4 rounded-xl transition-colors"
              style={{ background: '#FAF5EF', border: '1px solid #EDE0CE' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5EDE3'}
              onMouseLeave={e => e.currentTarget.style.background = '#FAF5EF'}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users style={{ color: '#8B5E3C' }} />
                  <span className="font-medium" style={{ color: '#1C1208' }}>Review Pending Accounts</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: '#F5EDE3', color: '#8B5E3C', border: '1px solid #EDE0CE' }}>
                  {stats.pendingAccounts} New
                </span>
              </div>
            </Link>
            <Link to="/AdminDashboard/loans" className="block p-4 rounded-xl transition-colors"
              style={{ background: '#FAF5EF', border: '1px solid #EDE0CE' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5EDE3'}
              onMouseLeave={e => e.currentTarget.style.background = '#FAF5EF'}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <FileText style={{ color: '#523A22' }} />
                  <span className="font-medium" style={{ color: '#1C1208' }}>Review Loan Applications</span>
                </div>
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: '#FDF8F2', color: '#523A22', border: '1px solid #EDE0CE' }}>
                  {stats.reviewLoans} Pending
                </span>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl flex flex-col justify-center items-center text-center" style={{ border: '1px solid #EDE0CE', boxShadow: '0 1px 4px rgba(61,40,16,0.06)' }}>
          <div className="w-24 h-24 mb-4 rounded-full flex items-center justify-center shadow-sm" style={{ background: '#F5EDE3', border: '1px solid #EDE0CE' }}>
            <Activity size={40} style={{ color: '#8B5E3C' }} />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: '#1C1208' }}>All Systems Operational</h3>
        <p className="max-w-sm" style={{ color: '#523A22' }}>The platform is running smoothly with no reported issues or downtime in the last 24 hours.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
