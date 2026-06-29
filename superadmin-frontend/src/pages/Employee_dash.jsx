import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import axios from '../api/axiosInstance';
import toast from 'react-hot-toast';

import EmployeeDashboardHome from '../components/Employee/EmployeeDashboardHome';

const Employee_dash = ({ setislogin_employee }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
        const response = await axios.post('http://localhost:4000/api/employee/logout', {}, { withCredentials: true });
        if(response.status === 200){
          toast.success('Logged out successfully');
          if (setislogin_employee) setislogin_employee(false);
          navigate('/');
        } else {
          toast.error('Failed to logout');
        }
    } catch (error) {
      toast.error('Failed to logout due to server error');
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900">
     
      {/* Sidebar - Zinc 900 */}
      <div className="w-64 flex flex-col justify-between z-20 bg-zinc-900 shadow-2xl border-r border-zinc-800">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 space-x-3 border-b border-zinc-800">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm bg-violet-600 text-white">
              <ShieldCheck size={20} />
            </div>
            <h1 className="text-base font-bold tracking-tight text-white">Employee Portal</h1>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium transition-colors text-zinc-400 hover:bg-rose-500/10 hover:text-rose-500"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 z-10 sticky top-0 bg-white/80 backdrop-blur-md border-b border-zinc-200 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-500">Employee Information Hub</h2>
          <div className="flex items-center space-x-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">System Online</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 z-10 bg-zinc-50/50">
          <Routes>
            <Route path="/" element={<EmployeeDashboardHome />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Employee_dash;
