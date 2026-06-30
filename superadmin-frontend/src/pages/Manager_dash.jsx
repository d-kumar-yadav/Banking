import React, { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, CreditCard, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import axios from '../api/axiosInstance';
import toast from 'react-hot-toast';

import ManagerDashboardHome from '../components/Manager/ManagerDashboardHome';
import ManagerAccounts from '../components/Manager/ManagerAccounts';
import ManagerLoans from '../components/Manager/ManagerLoans';
import ManagerAccountManager from '../components/Manager/ManagerAccountManager';
import ManagerCards from '../components/Manager/ManagerCards';

const Manager_dash = ({ setislogin_manager }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
        const response= await axios.post('/api/employee/logout', {}, { withCredentials: true });
        if(response.status==200){
      toast.success('Logged out successfully');
      if (setislogin_manager) setislogin_manager(false);
      localStorage.removeItem("setislogin_manager");
      navigate('/');
      
        }
        else{
          toast.error('Failed to logout');
        }
    } catch (error) {
      toast.error('Failed to logout due to server error');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/ManagerDashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Pending Accounts', path: '/ManagerDashboard/accounts', icon: <Users size={20} /> },
    { name: 'Loan Applications', path: '/ManagerDashboard/loans', icon: <FileText size={20} /> },
    { name: 'Card Applications', path: '/ManagerDashboard/cards', icon: <CreditCard size={20} /> },
    { name: 'Manage Account', path: '/ManagerDashboard/manage', icon: <ShieldCheck size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
     
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar - Zinc 900 */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col justify-between bg-slate-900 shadow-2xl border-r border-slate-800 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm bg-emerald-600 text-white">
                <ShieldCheck size={20} />
              </div>
              <h1 className="text-base font-bold tracking-tight text-white">Manager Portal</h1>
            </div>
            {/* Close button on mobile */}
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="p-4 space-y-1 mt-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/ManagerDashboard'}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                    isActive 
                      ? 'font-bold bg-emerald-600/10 text-emerald-500 border-l-4 border-emerald-500' 
                      : 'font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-4 border-transparent'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium transition-colors text-slate-400 hover:bg-rose-500/10 hover:text-rose-500"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="text-sm font-semibold text-slate-500 hidden sm:block">Manager Control Center</h2>
          </div>
          <div className="flex items-center space-x-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">System Online</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 z-10">
          <Routes>
            <Route path="/" element={<ManagerDashboardHome />} />
            <Route path="/accounts" element={<ManagerAccounts />} />
            <Route path="/loans" element={<ManagerLoans />} />
            <Route path="/cards" element={<ManagerCards />} />
            <Route path="/manage" element={<ManagerAccountManager />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Manager_dash;
