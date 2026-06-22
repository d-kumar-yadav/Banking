import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Users, Banknote, Activity, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl flex items-center justify-between transition-all duration-300 border border-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-indigo-500 cursor-pointer group">
    <div>
      <p className="text-sm font-medium mb-1 transition-colors text-slate-500 group-hover:text-indigo-600">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`p-4 rounded-xl transition-transform duration-300 group-hover:scale-110 ${color}`}>{icon}</div>
  </div>
);

const SuperadminDashboardHome = () => {
  const [stats, setStats] = useState({ branches: 0, employees: 0, systemHealth: "100%" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [branchesRes, employeesRes] = await Promise.all([
          axios.get('http://localhost:4000/api/branche', { withCredentials: true }),
          axios.get('http://localhost:4000/api/employee/all', { withCredentials: true })
        ]);
        
        setStats({
          branches: branchesRes.data.branches?.length || 0,
          employees: employeesRes.data.employees?.length || 0,
          systemHealth: "100%"
        });
      } catch (error) {
        console.error("Dashboard error:", error);
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full p-2 bg-slate-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-800">Superadmin Operations</h1>
        <p className="text-slate-500">Global view of banking operations, branches, and system health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard title="Active Branches" value={stats.branches}
          icon={<Building2 size={24} className="text-indigo-600" />}
          color="bg-indigo-50" />
        <StatCard title="Total Staff" value={stats.employees}
          icon={<Users size={24} className="text-slate-600" />}
          color="bg-slate-100" />
      </div>

      <div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl">
          <h2 className="text-xl font-bold mb-4 text-slate-800">Quick Administration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/SuperadminDashboard/branches" className="block p-4 rounded-xl transition-colors bg-slate-50 border border-slate-100 hover:bg-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building2 className="text-indigo-600" />
                  <span className="font-medium text-slate-800">Branch Configuration</span>
                </div>
                <ArrowRight size={18} className="text-indigo-600" />
              </div>
            </Link>
            <Link to="/SuperadminDashboard/employees" className="block p-4 rounded-xl transition-colors bg-slate-50 border border-slate-100 hover:bg-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Users className="text-slate-600" />
                  <span className="font-medium text-slate-800">Staff & Roles Management</span>
                </div>
                <ArrowRight size={18} className="text-slate-600" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminDashboardHome;
