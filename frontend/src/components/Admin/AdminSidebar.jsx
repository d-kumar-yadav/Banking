import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, CreditCard, LogOut } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminSidebar = ({ setislogin_admin }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:4000/api/auth/adminlogout', {}, { withCredentials: true });
      if (response.status === 200) {
        toast.success('Logged out successfully');
        if (setislogin_admin) setislogin_admin(false);
        localStorage.removeItem("setislogin_admin");
        navigate('/');
      } else {
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
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm hover:bg-white/5 hover:text-[#FDF8F2] ${
                  isActive ? 'font-bold active' : 'font-medium text-[rgba(253,248,242,0.6)]'
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? 'rgba(200,133,74,0.18)' : undefined,
                color: isActive ? '#C8854A' : undefined,
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
          className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium transition-colors text-[rgba(253,248,242,0.5)] hover:bg-[rgba(220,80,80,0.12)] hover:text-[#f87171]"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
