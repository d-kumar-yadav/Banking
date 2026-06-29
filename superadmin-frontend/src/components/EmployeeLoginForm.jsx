import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import toast from 'react-hot-toast';

const EmployeeLoginForm = ({ setislogin_employee }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      const response = await axios.post("http://localhost:4000/api/employee/login", formData);
     if (response.status === 200) {
        const role = response.data.role;
        
        if (role !== 'Employee') {
          toast.error("User Doesnot exist.");
          setFormData({ email: '', password: '' });
          navigate("/Employee-login");
          return; // Stop the customer login process
        }
        else {
        toast.success("Login Successful!");
        setislogin_employee(true);
        localStorage.setItem("setislogin_employee", "true");
        navigate("/EmployeeDashboard");
        }
      }
    } catch (error) {
      console.error("Employee login error:", error);
      if (setislogin_employee) setislogin_employee(false);
      toast.error(error.response?.data?.message || "Unauthorized Access.");
      setFormData({ email: '', password: '' });
      localStorage.removeItem("setislogin_employee");
      navigate("/Employee-login");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3 mb-6">
        <ShieldAlert className="text-amber-500 w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-amber-600/90 leading-relaxed">
          This portal is restricted to authorized administrative personnel only. All access attempts are monitored and logged.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Employee Email</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#5B0A1C] transition-colors">
            <Mail size={18} />
          </div>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] transition-all shadow-sm"
            placeholder="employee@mybank.com"
          />
        </div>
      </div>

      <div className="space-y-1.5 pt-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Password</label>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#5B0A1C] transition-colors">
            <Lock size={18} />
          </div>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] transition-all shadow-sm"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full mt-6 py-4 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-[0_10px_20px_-10px_rgba(15,23,42,0.5)] hover:bg-slate-800 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 group border border-transparent hover:border-amber-500/50"
      >
        Authenticate <ArrowRight size={16} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
      </button>
      
    </form>
  );
};

export default EmployeeLoginForm;
