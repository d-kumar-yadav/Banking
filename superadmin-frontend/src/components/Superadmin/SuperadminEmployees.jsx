import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const SuperadminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Popup states
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  
  // Form data
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'Employee',
    branchid: ''
  });

  const fetchData = async () => {
    try {
      const [empRes, branchRes] = await Promise.all([
        axios.get('http://localhost:4000/api/employee/all', { withCredentials: true }),
        axios.get('http://localhost:4000/api/branche', { withCredentials: true })
      ]);
      setEmployees(empRes.data.employees || []);
      setBranches(branchRes.data.branches || []);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/api/employee/add_employee', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role
      }, { withCredentials: true });
      
      toast.success('Staff created successfully');
      setIsAddPopupOpen(false);
      setFormData({ name: '', email: '', password: '', phone: '' , role:'' });
      // If branch is selected, assign it
      if (formData.branchid && response.data.employee?._id) {
         try {
           await axios.post('http://localhost:4000/api/employee/add_to_branch', {
             employeeid: response.data.employee._id,
             branchid: formData.branchid
           }, { withCredentials: true });
           
           toast.success('Staff assigned to branch');
           setIsAddPopupOpen(false);
      setFormData({ name: '', email: '', password: '', phone: '' , role:'' });
           
         } catch(err) {
           toast.error('Created staff but failed to assign branch');
      setFormData({ name: '', email: '', password: '', phone: '' , role:'' });
         }
      }

      setIsAddPopupOpen(false);
      setFormData({ name: '', email: '', password: '', phone: '', role: 'Employee', branchid: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create staff');
    }
  };

  const openEditPopup = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      branchid: employee.branch?._id || ''
    });
    setIsEditPopupOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:4000/api/employee/update_employee/${selectedEmployee._id}`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        branchid: formData.branchid || null
      }, { withCredentials: true });
      
      // If branch changed, we also need to call add_to_branch to update branch side reference
      if (formData.branchid && formData.branchid !== selectedEmployee.branch?._id) {
         try {
           await axios.post('http://localhost:4000/api/employee/add_to_branch', {
             employeeid: selectedEmployee._id,
             branchid: formData.branchid
           }, { withCredentials: true });
         } catch(err) {
           console.error("Failed to update branch reference");
         }
      }

      toast.success('Staff updated successfully');
      setIsEditPopupOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update staff');
    }
  };

  const openDeletePopup = (employee) => {
    setSelectedEmployee(employee);
    setIsDeletePopupOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/employee/delete_employee/${selectedEmployee._id}`, { withCredentials: true });
      toast.success('Staff deleted successfully');
      setIsDeletePopupOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete staff');
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
          <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
          <p className="text-slate-500">Manage bank employees and their roles.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: '', email: '', password: '', phone: '', role: 'Employee', branchid: '' });
            setIsAddPopupOpen(true);
          }}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Add Staff</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Employee</th>
                <th className="p-4 font-semibold">Contact Info</th>
                <th className="p-4 font-semibold">Role / Branch</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    <Users size={48} className="mx-auto mb-3 text-slate-300" />
                    <p>No staff found. Add new staff to get started.</p>
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{employee.name}</div>
                      <div className="text-xs text-slate-500">ID: {employee.employeeId}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-800">{employee.email}</div>
                      {/* Phone is hidden by default in backend but we show if available */}
                      {employee.phone && <div className="text-xs text-slate-500">{employee.phone}</div>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${employee.role === 'Superadmin' ? 'bg-purple-100 text-purple-700' : employee.role === 'Manager' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                        {employee.role}
                      </span>
                      <div className="text-xs text-slate-500 mt-1">{employee.branch?.branchName || 'Unassigned'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${employee.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {employee.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => openEditPopup(employee)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => openDeletePopup(employee)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
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

      {/* Add Staff Popup */}
      {isAddPopupOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Add New Staff</h2>
              <button onClick={() => setIsAddPopupOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input type="text" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="+91 9876543210" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                    <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                      <option value="Superadmin">Superadmin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign Branch</label>
                    <select name="branchid" value={formData.branchid} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">None</option>
                      {branches.map(b => (
                        <option key={b._id} value={b._id}>{b.branchName}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsAddPopupOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">Create Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Popup */}
      {isEditPopupOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Edit Staff</h2>
              <button onClick={() => setIsEditPopupOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  {/* Phone can be empty during edit since it's hidden in backend GET, but we allow updating it */}
                  <input type="text" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter phone to update..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                    <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                      <option value="Superadmin">Superadmin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign Branch</label>
                    <select name="branchid" value={formData.branchid} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">None</option>
                      {branches.map(b => (
                        <option key={b._id} value={b._id}>{b.branchName}</option>
                      ))}
                    </select>
                  </div>
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
            <h2 className="text-xl font-bold text-slate-800 mb-2">Delete Staff?</h2>
            <p className="text-slate-500 mb-6">Are you sure you want to delete <span className="font-semibold text-slate-700">{selectedEmployee?.name}</span>? This action cannot be undone.</p>
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

export default SuperadminEmployees;
