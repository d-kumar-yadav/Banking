import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Eye, FileText, User } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:4000/api/accounts/admin/pending-accounts');
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
      await axios.post(`http://localhost:4000/api/accounts/admin/approve-account/${userId}/${refNumber}`);
      toast.success('Account approved successfully');
      fetchAccounts(); setSelectedUser(null);
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to approve account'); }
  };

  const handleReject = async (userId, refNumber) => {
    try {
      await axios.post(`http://localhost:4000/api/accounts/admin/reject-account/${userId}/${refNumber}`);
      toast.success('Account request rejected');
      fetchAccounts(); setSelectedUser(null);
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to reject account'); }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#C8854A' }}></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col p-2" style={{ background: '#FDF8F2' }}>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#1C1208' }}>Pending Account Approvals</h1>
          <p style={{ color: '#523A22' }}>Review KYC documents and approve or reject account creation requests.</p>
        </div>
        <div className="px-4 py-2 rounded-lg text-sm bg-white" style={{ border: '1px solid #EDE0CE' }}>
          <span style={{ color: '#523A22' }}>Total Pending: </span>
          <span className="font-bold" style={{ color: '#1C1208' }}>{accounts.length}</span>
        </div>
      </div>

      <div className="bg-white flex-1 rounded-xl overflow-hidden flex flex-col" style={{ border: '1px solid #EDE0CE', boxShadow: '0 1px 4px rgba(61,40,16,0.06)' }}>
        {accounts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16" style={{ color: '#523A22' }}>
            <User size={48} className="mb-4 opacity-30" style={{ color: '#C8854A' }} />
            <p className="text-lg font-medium">No pending accounts to review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: '#FAF5EF', borderBottom: '1px solid #EDE0CE' }}>
                  <th className="p-4 font-medium" style={{ color: '#523A22' }}>Reference No.</th>
                  <th className="p-4 font-medium" style={{ color: '#523A22' }}>User Name</th>
                  <th className="p-4 font-medium" style={{ color: '#523A22' }}>Account Type</th>
                  <th className="p-4 font-medium" style={{ color: '#523A22' }}>Status</th>
                  <th className="p-4 font-medium text-right" style={{ color: '#523A22' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr key={acc._id} className="transition-colors" style={{ borderBottom: '1px solid #EDE0CE' }}
                  //  these two lines are for hoover effect when hoover change background  color
                    onMouseEnter={e => e.currentTarget.style.background = '#FAF5EF'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="p-4 font-mono text-sm" style={{ color: '#8B5E3C' }}>{acc.refrencenumber}</td>
                    <td className="p-4 font-medium" style={{ color: '#1C1208' }}>{acc.user?.name || 'Unknown User'}</td>
                    <td className="p-4 capitalize" style={{ color: '#1C1208' }}>{acc.account_type}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => setSelectedUser(acc)} className="p-2 rounded-lg transition-colors bg-white" style={{ border: '1px solid #EDE0CE', color: '#523A22' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F5EDE3'}
                          onMouseLeave={e => e.currentTarget.style.background = 'white'} title="View Details"><Eye size={18} /></button>
                        <button onClick={() => handleApprove(acc.user._id, acc.refrencenumber)} className="p-2 rounded-lg transition-colors bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100" title="Approve"><Check size={18} /></button>
                        <button onClick={() => handleReject(acc.user._id, acc.refrencenumber)} className="p-2 rounded-lg transition-colors bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100" title="Reject"><X size={18} /></button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" style={{ background: 'rgba(28,18,8,0.45)' }}>
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 flex flex-col rounded-2xl shadow-2xl" style={{ border: '1px solid #EDE0CE' }}>
            <div className="flex justify-between items-center mb-6 pb-4" style={{ borderBottom: '1px solid #EDE0CE' }}>
              <h2 className="text-2xl font-bold" style={{ color: '#1C1208' }}>Review KYC Documents</h2>
              <button onClick={() => setSelectedUser(null)} style={{ color: '#523A22' }}><X size={24} /></button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Name', val: selectedUser.user?.name },
                  { label: 'Phone', val: selectedUser.user?.phone },
                  { label: 'PAN ID', val: selectedUser.user?.pan_id, upper: true },
                  { label: 'Aadhaar ID', val: selectedUser.user?.adhar_id },
                ].map(({ label, val, upper }) => (
                  <div key={label} className="p-4 rounded-xl" style={{ background: '#FAF5EF', border: '1px solid #EDE0CE' }}>
                    <p className="text-sm mb-1" style={{ color: '#523A22' }}>{label}</p>
                    <p className={`font-medium ${upper ? 'uppercase' : ''}`} style={{ color: '#1C1208' }}>{val}</p>
                  </div>
                ))}
                <div className="col-span-2 p-4 rounded-xl" style={{ background: '#FAF5EF', border: '1px solid #EDE0CE' }}>
                  <p className="text-sm mb-1" style={{ color: '#523A22' }}>Address</p>
                  <p className="font-medium" style={{ color: '#1C1208' }}>{selectedUser.user?.address}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'PAN Image', src: selectedUser.user?.pan_image, alt: 'PAN' },
                  { label: 'Aadhaar Image', src: selectedUser.user?.adhar_image, alt: 'Aadhaar' },
                  { label: 'User Image', src: selectedUser.user?.image, alt: 'User' },
                  { label: 'Signature', src: selectedUser.user?.signature, alt: 'Signature' },
                ].map(({ label, src, alt }) => (
                  <div key={label}>
                    <p className="text-sm mb-2" style={{ color: '#523A22' }}>{label}</p>
                    <div className="h-48 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: '#FAF5EF', border: '1px solid #EDE0CE' }}>
                      {src ? <img src={src} alt={alt} className="max-h-full max-w-full object-contain" /> : <FileText size={32} style={{ color: '#EDE0CE' }} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 flex justify-end space-x-4 pt-4" style={{ borderTop: '1px solid #EDE0CE' }}>
              <button onClick={() => setSelectedUser(null)} className="px-6 py-2 rounded-lg font-medium transition-colors" style={{ background: '#FAF5EF', border: '1px solid #EDE0CE', color: '#1C1208' }}>Cancel</button>
              <button onClick={() => handleReject(selectedUser.user._id, selectedUser.refrencenumber)} className="px-6 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors flex items-center space-x-2">
                <X size={18} /><span>Reject Request</span>
              </button>
              <button onClick={() => handleApprove(selectedUser.user._id, selectedUser.refrencenumber)} className="px-6 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2 shadow-sm" style={{ background: '#3D2810' }}
                onMouseEnter={e => e.currentTarget.style.background = '#2A1C08'}
                onMouseLeave={e => e.currentTarget.style.background = '#3D2810'}>
                <Check size={18} /><span>Approve Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccounts;
