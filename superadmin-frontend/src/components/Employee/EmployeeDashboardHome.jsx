import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { User, Building2, Phone, Mail, MapPin, Hash, Briefcase, Calendar, Lock, X } from 'lucide-react';

const InfoCard = ({ icon: Icon, label, value, highlight }) => (
  <div className={`p-4 rounded-xl flex items-start space-x-4 border ${highlight ? 'bg-violet-50 border-violet-100' : 'bg-white border-zinc-100 shadow-sm'}`}>
    <div className={`p-2 rounded-lg ${highlight ? 'bg-violet-100 text-violet-600' : 'bg-zinc-50 text-zinc-500'}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${highlight ? 'text-violet-600' : 'text-zinc-500'}`}>{label}</p>
      <p className={`font-medium ${highlight ? 'text-lg text-zinc-900 font-bold' : 'text-base text-zinc-800'}`}>{value || 'N/A'}</p>
    </div>
  </div>
);

const EmployeeDashboardHome = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get('/api/employee/me', { withCredentials: true });
        setEmployeeData(response.data.employee);
      } catch (error) {
        toast.error("Failed to load employee details");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeData();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters long");
    }
    try {
      setPasswordLoading(true);
      const res = await axios.put('/api/employee/update-password', passwordForm, { withCredentials: true });
      if (res.data.success) {
        toast.success(res.data.message || "Password updated successfully");
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
    </div>
  );

  if (!employeeData) return (
    <div className="flex h-full items-center justify-center text-zinc-500">
      <p>Failed to load profile. Please try refreshing.</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto h-full flex flex-col space-y-8">
      
      {/* Header Profile Section */}
      <div className="bg-white rounded-2xl p-8 border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
        <div className="w-28 h-28 rounded-full bg-violet-50 flex items-center justify-center border-4 border-violet-100 shadow-sm shrink-0">
          <User size={48} className="text-violet-600" />
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold text-zinc-900 mb-1">{employeeData.name}</h1>
          <p className="text-lg font-mono text-violet-600 mb-3">{employeeData.employeeId}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-bold text-zinc-600 uppercase tracking-wide">
              {employeeData.role}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${employeeData.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {employeeData.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center border-b border-zinc-100 pb-4">
            <User className="mr-2 text-violet-600" size={24} /> 
            Personal Details
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <InfoCard icon={Mail} label="Email Address" value={employeeData.email} />
            <InfoCard icon={Phone} label="Phone Number" value={employeeData.phone} />
            <InfoCard icon={Briefcase} label="Role" value={employeeData.role} />
            <InfoCard icon={Calendar} label="Joined On" value={new Date(employeeData.createdAt).toLocaleDateString()} />
          </div>
          <div className="mt-6 pt-6 border-t border-zinc-100 flex justify-end">
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl flex items-center transition-colors"
            >
              <Lock size={16} className="mr-2" />
              Update Password
            </button>
          </div>
        </div>

        {/* Assigned Branch Details */}
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center border-b border-zinc-100 pb-4">
            <Building2 className="mr-2 text-violet-600" size={24} /> 
            Assigned Branch
          </h2>
          {employeeData.branch ? (
            <div className="grid grid-cols-1 gap-4">
              <InfoCard icon={Building2} label="Branch Name" value={employeeData.branch.branchName} highlight={true} />
              <InfoCard icon={Hash} label="Branch Code" value={employeeData.branch.branchCode} />
              <InfoCard icon={Phone} label="Branch Phone" value={employeeData.branch.branchPhone} />
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 col-span-1">
                 <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Full Address</p>
                 <p className="text-zinc-800 font-medium leading-relaxed">{employeeData.branch.address}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
              <Building2 size={48} className="mb-4 opacity-30" />
              <p className="text-lg font-medium text-zinc-500">No branch assigned</p>
            </div>
          )}
        </div>
      </div>
      
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-900 flex items-center">
                <Lock className="mr-2 text-violet-600" size={24} />
                Update Password
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-zinc-400 hover:text-zinc-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Current Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                  placeholder="Enter current password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">New Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                  placeholder="Enter new password (min 6 characters)"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-zinc-600 font-medium hover:bg-zinc-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={passwordLoading}
                  className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? 'Updating...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboardHome;
