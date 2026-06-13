import React, { useState } from 'react';
import { Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const LoginForm = ({ setislogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  });
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      password: formData.password,
      email: loginMethod === 'email' ? formData.email : undefined,
      phone: loginMethod === 'phone' ? formData.phone : undefined
    };

    try {
      const response = await axios.post("http://localhost:4000/api/auth/login", payload);
      if (response.status === 200) {
        const role= response.data.role;
        if (role !== 'customer') {
          console.log("Login attempt with non-customer role:", role);
          toast.error("User Doesnot exist.");
          setFormData({ email: '', phone: '', password: '' });
          navigate("/login");
          return; // Stop the customer login process
        }
        
        toast.success("Login Successful!");
        setislogin(true);
        localStorage.setItem("setislogin", "true");
        navigate("/Dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      localStorage.removeItem("setislogin");
      setislogin(false);
      toast.error(error.response?.data?.message || "Login Failed. Please check your credentials.");
      navigate("/login");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Login Toggle Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6 shadow-inner">
        <button
          type="button"
          onClick={() => setLoginMethod('email')}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${loginMethod === 'email' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
        >
          <Mail size={16} className={loginMethod === 'email' ? 'text-[#5B0A1C]' : ''} /> Email
        </button>
        <button
          type="button"
          onClick={() => setLoginMethod('phone')}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${loginMethod === 'phone' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
        >
          <Phone size={16} className={loginMethod === 'phone' ? 'text-[#5B0A1C]' : ''} /> Phone
        </button>
      </div>

      {/* Conditional Input based on method */}
      {loginMethod === 'email' ? (
        <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email Address</label>
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
              placeholder="name@company.com"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Registered Phone</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#5B0A1C] transition-colors">
              <Phone size={18} />
            </div>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] transition-all shadow-sm"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
      )}

      {/* Password Input */}
      <div className="space-y-1.5 pt-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Password</label>
          <a href="#" className="text-xs font-bold text-[#5B0A1C] hover:text-[#831028] transition-colors">Forgot password?</a>
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

      {/* Submit Button */}
      <button
        type="submit" 
        className="w-full mt-6 py-4 bg-[#5B0A1C] text-white rounded-xl font-bold text-sm shadow-[0_10px_20px_-10px_rgba(91,10,28,0.5)] hover:bg-[#420714] hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 group border border-transparent hover:border-amber-500/50"
      >
        Sign In to Portal <ArrowRight size={16} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
      </button>
    </form>
  );
};

export default LoginForm;
