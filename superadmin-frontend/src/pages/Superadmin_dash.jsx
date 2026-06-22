import React from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Banknote, LogOut } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

import SuperadminDashboardHome from '../components/Superadmin/SuperadminDashboardHome';
import SuperadminBranches from '../components/Superadmin/SuperadminBranches';
import SuperadminEmployees from '../components/Superadmin/SuperadminEmployees';
import SuperadminFunds from '../components/Superadmin/SuperadminFunds';

const Superadmin_dash = ({ setislogin_superadmin }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
        const response= await axios.post('http://localhost:4000/api/employee/logout', {}, { withCredentials: true });
        if(response.status==200){
      toast.success('Logged out successfully');
      if (setislogin_superadmin) setislogin_superadmin(false);
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
    { name: 'Dashboard', path: '/SuperadminDashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Manage Branches', path: '/SuperadminDashboard/branches', icon: <Building2 size={18} /> },
    { name: 'Manage Staff', path: '/SuperadminDashboard/employees', icon: <Users size={18} /> },
    { name: 'Fund Allocation', path: '/SuperadminDashboard/funds', icon: <Banknote size={18} /> },
  ];

  return (
    <div className="flex h-screen text-slate-900 font-sans bg-slate-50">
     
      <div className="w-64 flex flex-col justify-between z-20 shadow-xl bg-slate-900">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 space-x-3 border-b border-white/10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm bg-indigo-500 text-white">
              SA
            </div>
            <h1 className="text-base font-bold tracking-tight text-white">Superadmin Portal</h1>
          </div>

          {/* Nav */}
          <nav className="p-4 space-y-1 mt-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/SuperadminDashboard'}
                onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#ffffff'; } }}
                onMouseLeave={e => { if (!e.currentTarget.classList.contains('active')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; } }}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                    isActive ? 'font-bold active' : 'font-medium'
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isActive ? '#818cf8' : '#94a3b8',
                  borderLeft: isActive ? '3px solid #818cf8' : '3px solid transparent',
                })}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium transition-colors text-slate-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 z-10 sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-600">Superadmin Control Center</h2>
          <div className="flex items-center space-x-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">System Online</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 z-10 bg-slate-50">
          <Routes>
            <Route path="/" element={<SuperadminDashboardHome />} />
            <Route path="/branches" element={<SuperadminBranches />} />
            <Route path="/employees" element={<SuperadminEmployees />} />
            <Route path="/funds" element={<SuperadminFunds />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Superadmin_dash;
