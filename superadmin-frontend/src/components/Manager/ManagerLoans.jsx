import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Check, X, Eye, FileText, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const ManagerLoans = () => {
  const [loans, setLoans] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [activeTab, setActiveTab] = useState('review');
  const [assessedLoans, setAssessedLoans] = useState({});
  const [isAssessing, setIsAssessing] = useState(false);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const [reviewRes, allRes] = await Promise.all([
        axios.get('http://localhost:4000/api/loan/Manager/review', { withCredentials: true }),
        axios.get('http://localhost:4000/api/loan/Manager/all', { withCredentials: true })
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
      await axios.post(`http://localhost:4000/api/loan/Manager/approve/${loanId}`, {}, { withCredentials: true });
      toast.success('Loan approved successfully');
      fetchLoans(); setSelectedLoan(null);
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to approve loan'); }
  };

  const handleReject = async (loanId) => {
    try {
      await axios.post(`http://localhost:4000/api/loan/Manager/reject/${loanId}`, {}, { withCredentials: true });
      toast.success('Loan request rejected');
      fetchLoans(); setSelectedLoan(null);
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to reject loan'); }
  };

  const getRiskColor = (prob) => {
    if (prob > 0.7) return 'text-rose-700 bg-rose-50 border-rose-200';
    if (prob > 0.4) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  };

  const displayedLoans = activeTab === 'review' ? loans : allLoans;

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-slate-900">Loan Management</h1>
          <p className="text-slate-500">Review loan applications and AI-generated risk assessments.</p>
        </div>
        <div className="flex space-x-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {['review', 'all'].map(tab => (
            <button key={tab}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                activeTab === tab 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              onClick={() => setActiveTab(tab)}>
              {tab === 'review' ? `Needs Review (${loans.length})` : `All Loans (${allLoans.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white flex-1 rounded-2xl overflow-hidden flex flex-col border border-slate-200 shadow-sm">
        {displayedLoans.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <FileText size={48} className="mb-4 opacity-30 text-slate-400" />
            <p className="text-lg font-medium">No loan applications found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Ref / Loan ID','User Name','Amount','Purpose','Status','Actions'].map((h, i) => (
                    <th key={h} className={`p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedLoans.map((loan) => (
                  <tr key={loan.loan_id} className="transition-colors hover:bg-slate-50/50">
                    <td className="p-4 font-mono text-sm text-slate-500">{loan.loan_id}</td>
                    <td className="p-4 font-medium text-slate-900">{loan.user?.name || 'Unknown User'}</td>
                    <td className="p-4 font-bold text-slate-900">₹{loan.loanAmount?.toLocaleString()}</td>
                    <td className="p-4 text-slate-700">{loan.loanPurpose}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        loan.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' :
                        loan.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200/50' :
                        'bg-amber-50 text-amber-700 border-amber-200/50'}`}>
                        {loan.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end">
                        <button onClick={() => setSelectedLoan(loan)} className="p-2 rounded-lg transition-colors bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200" title="View Details"><Eye size={18} /></button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Loan Application Details</h2>
                <p className="text-slate-500 text-sm mt-1">Ref / ID: <span className="font-mono bg-slate-200/50 px-1.5 py-0.5 rounded text-slate-700">{selectedLoan.loan_id}</span></p>
              </div>
              <button onClick={() => setSelectedLoan(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Applicant Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Applicant Info</h3>
                <div className="p-4 rounded-xl space-y-4 bg-slate-50 border border-slate-100">
                  {[['Name', selectedLoan.user?.name, 'text-slate-900 font-bold'], ['Email', selectedLoan.user?.email, 'text-slate-700 font-medium'],
                    ['Age / Gender', `${selectedLoan.age} / ${selectedLoan.gender}`, 'text-slate-700 font-medium'],
                    ['Marital Status', selectedLoan.maritalStatus, 'text-slate-700 font-medium'],
                    ['Education', selectedLoan.educationLevel, 'text-slate-700 font-medium']].map(([label, val, className]) => (
                    <div key={label}>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
                      <p className={className}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Financial Profile */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Financial Profile</h3>
                <div className="p-4 rounded-xl space-y-4 bg-slate-50 border border-slate-100">
                  <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Employment</p><p className="font-medium text-slate-900">{selectedLoan.employmentStatus}</p></div>
                  <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Annual Income</p><p className="font-bold text-emerald-600">₹{selectedLoan.annualIncome?.toLocaleString()}</p></div>
                  <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Credit Score</p><p className="font-bold text-emerald-600">{selectedLoan.creditScoreAtApplication}</p></div>
                  <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Credit Limit</p><p className="font-medium text-slate-900">₹{selectedLoan.totalCreditLimit?.toLocaleString()}</p></div>
                  <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Debt to Income Ratio</p><p className="font-bold text-amber-600">{(selectedLoan.debtToIncomeRatio * 100).toFixed(2)}%</p></div>
                </div>
              </div>
              
              {/* Loan Request */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Loan Request</h3>
                <div className="p-4 rounded-xl space-y-4 bg-emerald-50 border-2 border-emerald-100">
                  <div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">Amount Requested</p><p className="text-3xl font-bold text-slate-900">₹{selectedLoan.loanAmount?.toLocaleString()}</p></div>
                  <div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">Term</p><p className="font-bold text-slate-900">{selectedLoan.loanTerm} Months</p></div>
                  <div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">Purpose</p><p className="font-medium text-slate-900">{selectedLoan.loanPurpose}</p></div>
                </div>

                {(selectedLoan.status === 'Active' || selectedLoan.status === 'Closed') && (
                  <div className="p-4 rounded-xl space-y-4 bg-indigo-50 border-2 border-indigo-100">
                    <h4 className="font-bold text-indigo-900">Repayment Status</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">Monthly EMI</p><p className="font-bold text-slate-900">₹{selectedLoan.monthlyEMI?.toLocaleString()}</p></div>
                      <div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">EMIs Paid</p><p className="font-bold text-slate-900">{Math.round((selectedLoan.totalRepaymentAmount - selectedLoan.remainingBalance) / selectedLoan.monthlyEMI)} / {selectedLoan.loanTerm}</p></div>
                      <div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">Remaining Bal</p><p className="font-bold text-rose-600">₹{selectedLoan.remainingBalance?.toLocaleString()}</p></div>
                      <div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">Next Due Date</p><p className="font-bold text-slate-900">{new Date(selectedLoan.nextDueDate).toLocaleDateString()}</p></div>
                    </div>
                  </div>
                )}
                {selectedLoan.status === 'Review_Required' && (
                  <div className={`p-5 rounded-xl border transition-all duration-500 ${assessedLoans[selectedLoan.loan_id || selectedLoan.reference_number] ? getRiskColor(selectedLoan.defaultProbability) : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle size={24} className={assessedLoans[selectedLoan.loan_id || selectedLoan.reference_number] ? '' : 'text-slate-400'} />
                      <h4 className="font-bold text-lg">AI Risk Assessment</h4>
                    </div>
                    
                    {!assessedLoans[selectedLoan.loan_id || selectedLoan.reference_number] ? (
                      <div className="flex flex-col items-start space-y-3">
                        <p className="text-sm text-slate-500">The ML model has generated a default probability prediction for this application. Click below to reveal the assessment.</p>
                        <button 
                          onClick={() => {
                            setIsAssessing(true);
                            setTimeout(() => {
                              setAssessedLoans(prev => ({...prev, [selectedLoan.loan_id || selectedLoan.reference_number]: true}));
                              setIsAssessing(false);
                            }, 1000);
                          }}
                          disabled={isAssessing}
                          className="px-4 py-2 bg-[#5B0A1C] text-white font-bold rounded-lg hover:bg-rose-900 transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                          {isAssessing ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <AlertTriangle size={18} />
                          )}
                          <span>{isAssessing ? 'Running Analysis...' : 'Get Loan Default Probability'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="animate-in fade-in zoom-in duration-500">
                        <p className="text-4xl font-black mb-1">{selectedLoan.defaultProbability != null ? (selectedLoan.defaultProbability * 100).toFixed(1) : 'N/A'}%</p>
                        <p className="text-xs font-bold uppercase tracking-wider opacity-80">Probability of Default</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {selectedLoan.status === 'Review_Required' && (
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3 sticky bottom-0 z-10">
                <button onClick={() => setSelectedLoan(null)} className="px-6 py-2.5 rounded-xl font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleReject(selectedLoan.loan_id)} className="px-6 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold transition-colors flex items-center space-x-2">
                  <X size={18} strokeWidth={2.5} /><span>Reject Loan</span>
                </button>
                <button onClick={() => handleApprove(selectedLoan.loan_id)} className="px-8 py-2.5 rounded-xl text-white font-bold transition-all bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 flex items-center space-x-2">
                  <Check size={18} strokeWidth={2.5} /><span>Approve Loan</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerLoans;
