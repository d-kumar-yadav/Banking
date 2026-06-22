import React from 'react';
import { ShieldCheck, Users, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';

const PortalHome = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-2">
            <ShieldCheck className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Official Banking Portal</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Select your authorized role to access the administrative systems.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Manager Login */}
          <Link to="/Manager-login " className="group flex flex-col bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Manager</h2>
            <p className="text-slate-500 mb-8 flex-1">Access branch operations, review loan applications, and manage user KYC requests.</p>
            <div className="font-semibold text-emerald-600 flex items-center">
              Login as Manager <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </Link>

          {/* Employee Login */}
          <Link to="/Employee-login" className="group flex flex-col bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-7 h-7 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Employee</h2>
            <p className="text-slate-500 mb-8 flex-1">Handle customer queries, process transactions, and assist with daily operations.</p>
            <div className="font-semibold text-amber-600 flex items-center">
              Login as Employee <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </Link>

          {/* Superadmin Login */}
          <Link to="/Superadmin-login" className="group flex flex-col bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <LockKeyhole className="w-7 h-7 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Superadmin</h2>
            <p className="text-slate-500 mb-8 flex-1">Full system access, audit logs, employee management, and global configurations.</p>
            <div className="font-semibold text-indigo-600 flex items-center">
              Login as Superadmin <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PortalHome;
