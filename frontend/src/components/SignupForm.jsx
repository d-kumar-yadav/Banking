import React, { useState, useEffect } from 'react';
import { Mail, Lock, Phone, ArrowRight, User, Key, Users, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import toast from 'react-hot-toast';

const SignupForm = ({ setislogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    password: '',
    otp: ''
  });
  const [isAgreed, setIsAgreed] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!formData.email && !formData.phone) {
      toast.error("Please enter Email or Phone to receive OTP");
      return;
    }

    try {
      const payload = {};
      if (formData.email) payload.email = formData.email;
      if (formData.phone) payload.phone = formData.phone;

      await axios.post("/api/auth/send-otp", payload);
      setIsOtpSent(true);
      setOtpTimer(30);
      toast.success("OTP sent successfully!");
    } catch (error) {
      console.error("Failed to send OTP:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/register", formData);
      if (response.status === 200 || response.status === 201) {
        toast.success("Successfully Registered!");

        if (setislogin) setislogin(true);
        navigate('/Dashboard');
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.response?.data?.message || "Registration failed due to server error.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Full Name</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#5B0A1C] transition-colors">
            <User size={18} />
          </div>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] transition-all"
            placeholder="Dheeraj Kumar"
          />
        </div>
      </div>

      {/* Email & Phone Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
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
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] transition-all"
              placeholder="name@company.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Mobile Number</label>
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
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] transition-all"
              placeholder="1234567890"
            />
          </div>
        </div>
      </div>

      {/* Select Gender */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 tracking-wide">Gender</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#5B0A1C] transition-colors">
            <Users size={18} />
          </div>
          <select
            name="gender"
            required
            value={formData.gender}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] transition-all appearance-none cursor-pointer"
          >
            <option value="" disabled>Select your gender</option>
            <option value="Male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* OTP & Password Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Verification OTP</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#5B0A1C] transition-colors">
              <Key size={18} />
            </div>
            <input
              type="text"
              name="otp"
              required
              maxLength="6"
              value={formData.otp}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] transition-all tracking-widest font-mono"
              placeholder="123456"
            />
            {/* OTP Button with timer tracking */}
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={otpTimer > 0}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase transition-colors px-2 py-1 rounded ${otpTimer > 0 ? 'text-slate-400 bg-slate-100 cursor-not-allowed' : 'text-[#5B0A1C] hover:text-amber-600 bg-rose-50 shadow-sm'}`}
            >
              {otpTimer > 0 ? `Wait ${otpTimer}s` : (isOtpSent ? "Resend OTP" : "Get OTP")}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Create Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#5B0A1C] transition-colors">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B0A1C]/20 focus:border-[#5B0A1C] transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#5B0A1C] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="pt-2 flex items-start gap-3">
        <input
          type="checkbox"
          required
          id="terms"
          checked={isAgreed}
          onChange={(e) => setIsAgreed(e.target.checked)}
          className="mt-1 w-4 h-4 rounded text-[#5B0A1C] focus:ring-[#5B0A1C] border-slate-300 cursor-pointer"
        />
        <label htmlFor="terms" className="text-xs text-slate-500 font-medium leading-relaxed">
          By creating an account, you agree to our <a href="#" className="font-bold text-[#5B0A1C] hover:text-amber-600 transition-colors">Terms of Service</a> and <a href="#" className="font-bold text-[#5B0A1C] hover:text-amber-600 transition-colors">Privacy Policy</a>.
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isAgreed}
        className={`w-full mt-2 py-4 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 group border border-transparent ${!isAgreed ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#5B0A1C] text-white shadow-[0_10px_20px_-10px_rgba(91,10,28,0.5)] hover:bg-[#420714] hover:-translate-y-0.5 hover:border-amber-500/50'}`}
      >
        Submit Application <ArrowRight size={16} className={`group-hover:translate-x-1 transition-transform ${!isAgreed ? 'text-slate-400' : 'text-amber-400'}`} />
      </button>
    </form>
  );
};

export default SignupForm;

