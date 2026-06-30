import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Search, RefreshCw, AlertCircle } from 'lucide-react';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const ManagerCards = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:4000/api/cards/pending', { withCredentials: true });
            if (res.data.success) {
                setApplications(res.data.applications);
            }
        } catch (err) {
            toast.error("Failed to fetch card applications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleApprove = async (id) => {
        setProcessingId(id);
        try {
            const res = await axios.post(`http://localhost:4000/api/cards/approve/${id}`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success('Card application approved and card generated!');
                setApplications(prev => prev.filter(app => app._id !== id));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve application');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id) => {
        setProcessingId(id);
        try {
            const res = await axios.post(`http://localhost:4000/api/cards/reject/${id}`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success('Card application rejected.');
                setApplications(prev => prev.filter(app => app._id !== id));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject application');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredApplications = applications.filter(app => 
        app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Card Applications</h2>
                    <p className="text-slate-500 text-sm mt-1">Review and process credit and debit card requests.</p>
                </div>
                <button 
                    onClick={fetchApplications}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-semibold"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">


                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[800px]">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold">Application Details</th>
                                <th className="px-6 py-4 font-bold">Customer</th>
                                <th className="px-6 py-4 font-bold">Linked Account</th>
                                <th className="px-6 py-4 font-bold">Date</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                                            <span>Loading applications...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredApplications.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                                <AlertCircle className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 font-medium">No pending card applications found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredApplications.map(app => (
                                    <tr key={app._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${app.cardType === 'credit' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    <CreditCard className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{app.cardName}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{app.cardType}</span>
                                                        <span className="text-[10px] text-slate-300">•</span>
                                                        <span className="text-[10px] font-mono text-slate-500">{app.applicationId}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-700">{app.user?.name || 'Unknown'}</p>
                                            <p className="text-xs text-slate-500">{app.user?.email || 'N/A'}</p>
                                            <p className="text-[10px] text-slate-400 mt-1 uppercase">PAN: {app.user?.pan_id || 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-mono font-medium text-slate-600 shadow-sm">
                                                {app.account?.accountNumber || 'Unknown'}
                                            </span>
                                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{app.account?.account_type || 'N/A'} A/C</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(app.createdAt).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleReject(app._id)}
                                                    disabled={processingId === app._id}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Reject"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleApprove(app._id)}
                                                    disabled={processingId === app._id}
                                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {processingId === app._id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                    Approve
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManagerCards;
