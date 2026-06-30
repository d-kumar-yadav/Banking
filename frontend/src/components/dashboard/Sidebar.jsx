import { LayoutDashboard, Send, History, Building, Activity, LogOut, User, CreditCard, TrendingUp, X } from 'lucide-react';
import axios from '../../api/axiosInstance';
import { useNavigate, NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';

const Sidebar = ({ setislogin, setIsSidebarOpen }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
   
    try {
  
      const response = await axios.post('/api/auth/logout', {}, { withCredentials: true });
      
      if(response.status === 200){
        toast.success('Logged out successfully');
        if (setislogin) setislogin(false); // Tell React the user is logged out
        navigate('/');
      }
      else {
        toast.error('Logout failed' );

      }
    }
     catch (err) {
      console.error(err);
      toast.error('Failed to logout due to server error'  ,err);
    }
  };

  const navItems = [
    { path: '/Dashboard', label: 'Accounts Overview', icon: LayoutDashboard },
    { path: '/Dashboard/transfer', label: 'Transfer Money', icon: Send },
    { path: '/Dashboard/history', label: 'Transaction History', icon: History },
    { path: '/Dashboard/loan', label: 'Apply for Loan', icon: Building },
    { path: '/Dashboard/active-loans', label: 'Active Loans', icon: Building },
    { path: '/Dashboard/credit', label: 'Credit Simulator', icon: Activity },
    { path: '/Dashboard/cards', label: 'Credit Cards', icon: CreditCard },
    { path: '/Dashboard/profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="w-72 bg-white/95 md:bg-white/40 backdrop-blur-xl border-r border-white/60 h-screen flex flex-col pt-10 pb-6 px-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-y-auto">
      <div className="flex items-center justify-between mb-12 px-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#5B0A1C] to-[#831028] rounded-xl flex shadow-lg shadow-rose-900/20 items-center justify-center">
            <Building className="text-amber-400 w-6 h-6" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-black tracking-tighter text-[#5B0A1C]">
              MY<span className="text-slate-800">BANK</span>
            </span>
          </div>
        </div>
        
        {/* Mobile Close Button */}
        {setIsSidebarOpen && (
          <button 
            className="md:hidden p-2 text-slate-500 hover:text-rose-600 bg-slate-100 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.path === '/Dashboard'}
            onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium ${
                isActive
                  ? 'bg-[#5B0A1C] text-white shadow-md shadow-rose-900/20'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-[#5B0A1C]'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all font-medium mt-auto"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;

