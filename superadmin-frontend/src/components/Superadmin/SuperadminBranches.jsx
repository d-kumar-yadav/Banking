import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SuperadminBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Popup states
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  
  // Form data
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [formData, setFormData] = useState({
    branchName: '',
    branchPhone: '',
    branchEmail: '',
    address: ''
  });

  const fetchBranches = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/branche', { withCredentials: true });
      setBranches(response.data.branches || []);
    } catch (error) {
      toast.error('Failed to load branches');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/api/branche', formData, { withCredentials: true });
      toast.success('Branch created successfully');
      setIsAddPopupOpen(false);
      setFormData({ branchName: '', branchPhone: '', branchEmail: '', address: '' });
      fetchBranches();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create branch');
      setFormData({ branchName: '', branchPhone: '', branchEmail: '', address: '' });
    }
  };

  const openEditPopup = (branch) => {
    setSelectedBranch(branch);
    setFormData({
      branchName: branch.branchName,
      branchPhone: branch.branchPhone,
      branchEmail: branch.branchEmail,
      address: branch.address
    });
    setIsEditPopupOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:4000/api/branche/${selectedBranch._id}`, formData, { withCredentials: true });
      toast.success('Branch updated successfully');
      setIsEditPopupOpen(false);
      fetchBranches();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update branch');
    }
  };

  const openDeletePopup = (branch) => {
    setSelectedBranch(branch);
    setIsDeletePopupOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/branche/${selectedBranch._id}`, { withCredentials: true });
      toast.success('Branch deleted successfully');
      setIsDeletePopupOpen(false);
      fetchBranches();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete branch');
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Branch Management</h1>
          <p className="text-slate-500">View and manage banking branches.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ branchName: '', branchPhone: '', branchEmail: '', address: '' });
            setIsAddPopupOpen(true);
          }}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Add Branch</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Branch Name</th>
                <th className="p-4 font-semibold">Code / Account</th>
                <th className="p-4 font-semibold">Contact Info</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {branches.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    <Building2 size={48} className="mx-auto mb-3 text-slate-300" />
                    <p>No branches found. Add a new branch to get started.</p>
                  </td>
                </tr>
              ) : (
                branches.map((branch) => (
                  <tr key={branch._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{branch.branchName}</div>
                      <div className="text-xs text-slate-500 max-w-[200px] truncate" title={branch.address}>{branch.address}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-800"><span className="text-slate-500">Code:</span> {branch.branchCode}</div>
                      <div className="text-sm text-slate-800"><span className="text-slate-500">Acc:</span> {branch.branchAccount}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-800">{branch.branchEmail}</div>
                      <div className="text-xs text-slate-500">{branch.branchPhone}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${branch.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {branch.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => openEditPopup(branch)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => openDeletePopup(branch)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                          <Trash2 size={16} />
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

      {/* Add Branch Popup */}
      {isAddPopupOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Add New Branch</h2>
              <button onClick={() => setIsAddPopupOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name</label>
                  <input type="text" name="branchName" required value={formData.branchName} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" placeholder="e.g. Downtown Branch" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" name="branchEmail" required value={formData.branchEmail} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" placeholder="branch@bank.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input type="text" name="branchPhone" required value={formData.branchPhone} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" placeholder="+91 9876543210" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <textarea name="address" required value={formData.address} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none" placeholder="123 Main St, City, State"></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsAddPopupOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">Create Branch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Branch Popup */}
      {isEditPopupOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Edit Branch</h2>
              <button onClick={() => setIsEditPopupOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name</label>
                  <input type="text" name="branchName" required value={formData.branchName} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" name="branchEmail" required value={formData.branchEmail} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input type="text" name="branchPhone" required value={formData.branchPhone} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <textarea name="address" required value={formData.address} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none"></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsEditPopupOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {isDeletePopupOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Delete Branch?</h2>
            <p className="text-slate-500 mb-6">Are you sure you want to delete <span className="font-semibold text-slate-700">{selectedBranch?.branchName}</span>? This action cannot be undone.</p>
            <div className="flex justify-center space-x-3">
              <button onClick={() => setIsDeletePopupOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex-1">Cancel</button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperadminBranches;
