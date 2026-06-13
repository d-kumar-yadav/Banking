import React from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, CreditCard, LogOut } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

import AdminDashboardHome from '../components/Admin/AdminDashboardHome';
import AdminAccounts from '../components/Admin/AdminAccounts';
import AdminLoans from '../components/Admin/AdminLoans';
import AdminAccountManager from '../components/Admin/AdminAccountManager';

const Admin_dash = ({ setislogin_admin }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
        const response= await axios.post('http://localhost:4000/api/auth/adminlogout', {}, { withCredentials: true });
        if(response.status==200){
      toast.success('Logged out successfully');
      if (setislogin_admin) setislogin_admin(false);
      localStorage.removeItem("setislogin_admin");
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
    { name: 'Dashboard', path: '/AdminDashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Pending Accounts', path: '/AdminDashboard/accounts', icon: <Users size={18} /> },
    { name: 'Loan Applications', path: '/AdminDashboard/loans', icon: <FileText size={18} /> },
    { name: 'Manage Account', path: '/AdminDashboard/manage', icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="flex h-screen text-[#1C1208] font-sans" style={{ background: '#FDF8F2' }}>
     
      <div className="w-64 flex flex-col justify-between z-20 shadow-xl" style={{ background: '#3D2810' }}>
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 space-x-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm" style={{ background: '#C8854A', color: '#1C1208' }}>
              A
            </div>
            <h1 className="text-base font-bold tracking-tight" style={{ color: '#FDF8F2' }}>Admin Portal</h1>
          </div>

          {/* Nav */}
          <nav className="p-4 space-y-1 mt-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/AdminDashboard'}
                onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#FDF8F2'; } }}
                onMouseLeave={e => { if (!e.currentTarget.classList.contains('active')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(253,248,242,0.6)'; } }}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                    isActive ? 'font-bold active' : 'font-medium'
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? 'rgba(200,133,74,0.18)' : 'transparent',
                  color: isActive ? '#C8854A' : 'rgba(253,248,242,0.6)',
                  borderLeft: isActive ? '3px solid #C8854A' : '3px solid transparent',
                })}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium transition-colors"
            style={{ color: 'rgba(253,248,242,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,80,80,0.12)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(253,248,242,0.5)'; }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 z-10 sticky top-0" style={{ background: 'rgba(253,248,242,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #EDE0CE' }}>
          <h2 className="text-sm font-semibold" style={{ color: '#523A22' }}>Admin Control Center</h2>
          <div className="flex items-center space-x-3">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75 mt-0.5 ml-0.5"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 mt-0.5 ml-0.5"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#523A22' }}>System Online</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 z-10" style={{ background: '#FDF8F2' }}>
          <Routes>
            <Route path="/" element={<AdminDashboardHome />} />
            <Route path="/accounts" element={<AdminAccounts />} />
            <Route path="/loans" element={<AdminLoans />} />
            <Route path="/manage" element={<AdminAccountManager />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Admin_dash;
