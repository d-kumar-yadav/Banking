import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Check, X, Eye, FileText, User } from 'lucide-react';
import toast from 'react-hot-toast';

const ManagerAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
    
      const res = await axios.get('http://localhost:4000/api/accounts/Manager/pending-accounts', { withCredentials: true });
      setAccounts(res.data.pendingaccounts || []);
    } catch (error) {
      toast.error('Failed to fetch pending accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleApprove = async (userId, refNumber) => {
    try {
      await axios.post(`http://localhost:4000/api/accounts/Manager/approve-account/${userId}/${refNumber}`, {}, { withCredentials: true });
      toast.success('Account approved successfully');
      fetchAccounts(); setSelectedUser(null);
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to approve account'); }
  };

  const handleReject = async (userId, refNumber) => {
    try {
      await axios.post(`http://localhost:4000/api/accounts/Manager/reject-account/${userId}/${refNumber}`, {}, { withCredentials: true });
      toast.success('Account request rejected');
      fetchAccounts(); setSelectedUser(null);
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to reject account'); }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-slate-900">Pending Account Approvals</h1>
          <p className="text-slate-500">Review KYC documents and approve or reject account creation requests.</p>
        </div>
        <div className="px-4 py-2 rounded-lg text-sm bg-white border border-slate-200 shadow-sm">
          <span className="text-slate-500">Total Pending: </span>
          <span className="font-bold text-emerald-600">{accounts.length}</span>
        </div>
      </div>

      <div className="bg-white flex-1 rounded-2xl overflow-hidden flex flex-col border border-slate-200 shadow-sm">
        {accounts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-500">
            <User size={48} className="mb-4 opacity-30 text-slate-400" />
            <p className="text-lg font-medium">No pending accounts to review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Reference No.</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">User Name</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Account Type</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Status</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc) => (
                  <tr key={acc._id} className="transition-colors hover:bg-slate-50/50">
                    <td className="p-4 font-mono text-sm text-slate-500">{acc.refrencenumber}</td>
                    <td className="p-4 font-medium text-slate-900">{acc.user?.name || 'Unknown User'}</td>
                    <td className="p-4 capitalize text-slate-700">{acc.account_type}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200/50">Pending</span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => setSelectedUser(acc)} className="p-2 rounded-lg transition-colors bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200" title="View Details"><Eye size={18} /></button>
                        <button onClick={() => handleApprove(acc.user._id, acc.refrencenumber)} className="p-2 rounded-lg transition-colors bg-emerald-50 border border-emerald-200/50 text-emerald-600 hover:bg-emerald-100" title="Approve"><Check size={18} /></button>
                        <button onClick={() => handleReject(acc.user._id, acc.refrencenumber)} className="p-2 rounded-lg transition-colors bg-rose-50 border border-rose-200/50 text-rose-600 hover:bg-rose-100" title="Reject"><X size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Review KYC Documents</h2>
                <p className="text-slate-500 text-sm mt-1">Ref: <span className="font-mono bg-slate-200/50 px-1.5 py-0.5 rounded text-slate-700">{selectedUser.refrencenumber}</span></p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Applicant Info */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Applicant Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Full Name', val: selectedUser.user?.name },
                    { label: 'Phone Number', val: selectedUser.user?.phone },
                    { label: 'PAN Number', val: selectedUser.user?.pan_id, upper: true },
                    { label: 'Aadhaar Number', val: selectedUser.user?.adhar_id },
                  ].map(({ label, val, upper }) => (
                    <div key={label} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                      <p className={`font-medium text-slate-900 ${upper ? 'uppercase' : ''}`}>{val || 'N/A'}</p>
                    </div>
                  ))}
                  <div className="col-span-2 md:col-span-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Residential Address</p>
                    <p className="font-medium text-slate-900">{selectedUser.user?.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Document Images */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Verification Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'PAN Card Image', src: selectedUser.user?.pan_image, alt: 'PAN' },
                    { label: 'Aadhaar Card Image', src: selectedUser.user?.adhar_image, alt: 'Aadhaar' },
                    { label: 'User Photograph', src: selectedUser.user?.image, alt: 'User' },
                    { label: 'Authorized Signature', src: selectedUser.user?.signature, alt: 'Signature' },
                  ].map(({ label, src, alt }) => (
                    <div key={label} className="flex flex-col">
                      <p className="text-sm font-semibold text-slate-700 mb-2">{label}</p>
                      <div className="h-48 rounded-xl flex items-center justify-center overflow-hidden bg-slate-50 border border-slate-200">
                        {src ? (
                          <img src={src} alt={alt} className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="flex flex-col items-center text-slate-400">
                            <FileText size={32} className="mb-2 opacity-50" />
                            <span className="text-sm">Not Provided</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3 sticky bottom-0 z-10">
              <button onClick={() => setSelectedUser(null)} className="px-6 py-2.5 rounded-xl font-medium text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleReject(selectedUser.user._id, selectedUser.refrencenumber)} className="px-6 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold transition-colors flex items-center space-x-2">
                <X size={18} strokeWidth={2.5} /><span>Reject Request</span>
              </button>
              <button onClick={() => handleApprove(selectedUser.user._id, selectedUser.refrencenumber)} className="px-8 py-2.5 rounded-xl text-white font-bold transition-all bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 flex items-center space-x-2">
                <Check size={18} strokeWidth={2.5} /><span>Approve Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerAccounts;
