import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Eye, FileText, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLoans = () => {
  const [loans, setLoans] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [activeTab, setActiveTab] = useState('review');

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [reviewRes, allRes] = await Promise.all([
        axios.get('http://localhost:4000/api/loan/admin/review', { headers }),
        axios.get('http://localhost:4000/api/loan/admin/all', { headers })
      ]);
      setLoans(reviewRes.data.reviewloan || []);
      setAllLoans(allRes.data.loans || []);
    } catch (error) {
      toast.error('Failed to fetch loan applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleApprove = async (loanId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:4000/api/loan/admin/approve/${loanId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Loan approved successfully');
      fetchLoans(); setSelectedLoan(null);
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to approve loan'); }
  };

  const handleReject = async (loanId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:4000/api/loan/admin/reject/${loanId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Loan request rejected');
      fetchLoans(); setSelectedLoan(null);
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to reject loan'); }
  };

  const getRiskColor = (prob) => {
    if (prob > 0.7) return 'text-rose-700 bg-rose-50 border border-rose-200';
    if (prob > 0.4) return 'text-amber-700 bg-amber-50 border border-amber-200';
    return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
  };

  const displayedLoans = activeTab === 'review' ? loans : allLoans;

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#C8854A' }}></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col p-2" style={{ background: '#FDF8F2' }}>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#1C1208' }}>Loan Management</h1>
          <p style={{ color: '#523A22' }}>Review loan applications and AI-generated risk assessments.</p>
        </div>
        <div className="flex space-x-2 bg-white p-1 rounded-xl" style={{ border: '1px solid #EDE0CE' }}>
          {['review', 'all'].map(tab => (
            <button key={tab}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={activeTab === tab
                ? { background: '#3D2810', color: '#FDF8F2' }
                : { background: 'transparent', color: '#523A22' }}
              onClick={() => setActiveTab(tab)}>
              {tab === 'review' ? `Needs Review (${loans.length})` : `All Loans (${allLoans.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white flex-1 rounded-xl overflow-hidden flex flex-col" style={{ border: '1px solid #EDE0CE', boxShadow: '0 1px 4px rgba(61,40,16,0.06)' }}>
        {displayedLoans.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center" style={{ color: '#523A22' }}>
            <FileText size={48} className="mb-4" style={{ color: '#EDE0CE' }} />
            <p className="text-lg font-medium">No loan applications found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: '#FAF5EF', borderBottom: '1px solid #EDE0CE' }}>
                  {['Loan ID','User Name','Amount','Purpose','Default Risk','Status','Actions'].map((h, i) => (
                    <th key={h} className={`p-4 font-medium ${i === 6 ? 'text-right' : ''}`} style={{ color: '#523A22' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedLoans.map((loan) => (
                  <tr key={loan.loan_id} className="transition-colors" style={{ borderBottom: '1px solid #EDE0CE' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAF5EF'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="p-4 font-mono text-sm" style={{ color: '#8B5E3C' }}>{loan.loan_id}</td>
                    <td className="p-4 font-medium" style={{ color: '#1C1208' }}>{loan.user?.name || 'Unknown User'}</td>
                    <td className="p-4 font-bold" style={{ color: '#1C1208' }}>₹{loan.loanAmount?.toLocaleString()}</td>
                    <td className="p-4" style={{ color: '#523A22' }}>{loan.loanPurpose}</td>
                    <td className="p-4">
                      {loan.defaultProbability
                        ? <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(loan.defaultProbability)}`}>{(loan.defaultProbability * 100).toFixed(1)}% Risk</span>
                        : <span style={{ color: '#523A22' }}>N/A</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        loan.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        loan.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {loan.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end">
                        <button onClick={() => setSelectedLoan(loan)} className="p-2 rounded-lg bg-white transition-colors" style={{ border: '1px solid #EDE0CE', color: '#523A22' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F5EDE3'}
                          onMouseLeave={e => e.currentTarget.style.background = 'white'} title="View Details"><Eye size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" style={{ background: 'rgba(28,18,8,0.45)' }}>
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 flex flex-col rounded-2xl shadow-2xl" style={{ border: '1px solid #EDE0CE' }}>
            <div className="flex justify-between items-center mb-6 pb-4" style={{ borderBottom: '1px solid #EDE0CE' }}>
              <h2 className="text-2xl font-bold" style={{ color: '#1C1208' }}>Loan Application Details</h2>
              <button onClick={() => setSelectedLoan(null)} style={{ color: '#523A22' }}><X size={24} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Applicant Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold pb-2" style={{ color: '#1C1208', borderBottom: '1px solid #EDE0CE' }}>Applicant Info</h3>
                <div className="p-4 rounded-xl space-y-3" style={{ background: '#FAF5EF', border: '1px solid #EDE0CE' }}>
                  {[['Name', selectedLoan.user?.name, '#1C1208'], ['Email', selectedLoan.user?.email, '#523A22'],
                    ['Age / Gender', `${selectedLoan.age} / ${selectedLoan.gender}`, '#523A22'],
                    ['Marital Status', selectedLoan.maritalStatus, '#523A22'],
                    ['Education', selectedLoan.educationLevel, '#523A22']].map(([label, val, col]) => (
                    <div key={label}>
                      <p className="text-xs" style={{ color: '#523A22' }}>{label}</p>
                      <p className="font-medium" style={{ color: col }}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Financial Profile */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold pb-2" style={{ color: '#1C1208', borderBottom: '1px solid #EDE0CE' }}>Financial Profile</h3>
                <div className="p-4 rounded-xl space-y-3" style={{ background: '#FAF5EF', border: '1px solid #EDE0CE' }}>
                  <div><p className="text-xs" style={{ color: '#523A22' }}>Employment</p><p className="font-medium" style={{ color: '#1C1208' }}>{selectedLoan.employmentStatus}</p></div>
                  <div><p className="text-xs" style={{ color: '#523A22' }}>Annual Income</p><p className="font-medium text-emerald-600">₹{selectedLoan.annualIncome?.toLocaleString()}</p></div>
                  <div><p className="text-xs" style={{ color: '#523A22' }}>Credit Score</p><p className="font-medium" style={{ color: '#8B5E3C' }}>{selectedLoan.creditScoreAtApplication}</p></div>
                  <div><p className="text-xs" style={{ color: '#523A22' }}>Total Credit Limit</p><p className="font-medium" style={{ color: '#523A22' }}>₹{selectedLoan.totalCreditLimit?.toLocaleString()}</p></div>
                  <div><p className="text-xs" style={{ color: '#523A22' }}>Debt to Income Ratio</p><p className="font-medium text-amber-600">{(selectedLoan.debtToIncomeRatio * 100).toFixed(2)}%</p></div>
                </div>
              </div>
              {/* Loan Request */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold pb-2" style={{ color: '#1C1208', borderBottom: '1px solid #EDE0CE' }}>Loan Request</h3>
                <div className="p-4 rounded-xl space-y-3" style={{ background: '#FAF5EF', border: '1px solid #EDE0CE' }}>
                  <div><p className="text-xs" style={{ color: '#523A22' }}>Amount Requested</p><p className="text-xl font-bold" style={{ color: '#1C1208' }}>₹{selectedLoan.loanAmount?.toLocaleString()}</p></div>
                  <div><p className="text-xs" style={{ color: '#523A22' }}>Term</p><p className="font-medium" style={{ color: '#523A22' }}>{selectedLoan.loanTerm} Months</p></div>
                  <div><p className="text-xs" style={{ color: '#523A22' }}>Purpose</p><p className="font-medium" style={{ color: '#523A22' }}>{selectedLoan.loanPurpose}</p></div>
                </div>
                <div className={`p-4 rounded-xl ${getRiskColor(selectedLoan.defaultProbability)}`}>
                  <div className="flex items-center space-x-2 mb-2"><AlertTriangle size={20} /><h4 className="font-bold">AI Risk Assessment</h4></div>
                  <p className="text-3xl font-bold mb-1">{selectedLoan.defaultProbability ? (selectedLoan.defaultProbability * 100).toFixed(1) : 'N/A'}%</p>
                  <p className="text-xs opacity-80">Predicted Probability of Default</p>
                </div>
              </div>
            </div>
            {selectedLoan.status === 'Review_Required' && (
              <div className="mt-8 flex justify-end space-x-4 pt-4" style={{ borderTop: '1px solid #EDE0CE' }}>
                <button onClick={() => setSelectedLoan(null)} className="px-6 py-2 rounded-lg font-medium transition-colors" style={{ background: '#FAF5EF', border: '1px solid #EDE0CE', color: '#1C1208' }}>Cancel</button>
                <button onClick={() => handleReject(selectedLoan.loan_id)} className="px-6 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center space-x-2 font-medium transition-colors">
                  <X size={18} /><span>Reject Loan</span>
                </button>
                <button onClick={() => handleApprove(selectedLoan.loan_id)} className="px-6 py-2 rounded-lg text-white flex items-center space-x-2 font-medium transition-colors shadow-sm" style={{ background: '#3D2810' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2A1C08'}
                  onMouseLeave={e => e.currentTarget.style.background = '#3D2810'}>
                  <Check size={18} /><span>Approve Loan</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLoans;
