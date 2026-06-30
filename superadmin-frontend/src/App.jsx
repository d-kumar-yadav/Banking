import React, { useState, useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from 'react-hot-toast'
import axios from "./api/axiosInstance";

import PortalHome from "./pages/PortalHome"

import ManagerLogin from "./pages/Manager_login"
import ManagerDashboard from "./pages/Manager_dash"
import Private_manager from "./components/PrivateRoute_manager"

import SuperadminLogin from "./pages/SuperadminLogin"
import SuperadminDashboard from "./pages/Superadmin_dash"
import Private_superadmin from "./components/PrivateRoute_superadmin"

import EmployeeLogin from "./pages/EmployeeLogin"
import EmployeeDashboard from "./pages/Employee_dash"
import Private_employee from "./components/PrivateRoute_employee"

axios.defaults.withCredentials = true; 

function App() {
  const [islogin_manager, setislogin_manager] = useState(false);
  const [islogin_superadmin, setislogin_superadmin] = useState(false);
  const [islogin_employee, setislogin_employee] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await axios.get("/api/auth/verify");
        const role = response.data.role?.toLowerCase();
        
        if (role === "manager") setislogin_manager(true);
        if (role === "superadmin") setislogin_superadmin(true);
        if (role === "employee") setislogin_employee(true);
        
      } catch (error) {
        setislogin_manager(false);
        setislogin_superadmin(false);
        setislogin_employee(false);
      } finally {
        setIsLoading(false);
      }
    };
    verifyAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-slate-50">
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<PortalHome />} />
        
        {/* Manager Routes */}
        <Route path="/Manager-login" element={islogin_manager ? <Navigate to="/ManagerDashboard" replace /> : <ManagerLogin setislogin_manager={setislogin_manager} />} />
        <Route path="/ManagerDashboard/*" element={
          <Private_manager islogin_manager={islogin_manager}>
            <ManagerDashboard setislogin_manager={setislogin_manager} />
          </Private_manager > 
        }/>

        {/* Superadmin Routes */}
        <Route path="/Superadmin-login" element={islogin_superadmin ? <Navigate to="/SuperadminDashboard" replace /> : <SuperadminLogin setislogin_superadmin={setislogin_superadmin} />} />
        <Route path="/SuperadminDashboard/*" element={
          <Private_superadmin islogin_superadmin={islogin_superadmin}>
            <SuperadminDashboard setislogin_superadmin={setislogin_superadmin} />
          </Private_superadmin>
        }/>
        
        {/* Employee Routes */}
        <Route path="/Employee-login" element={islogin_employee ? <Navigate to="/EmployeeDashboard" replace /> : <EmployeeLogin setislogin_employee={setislogin_employee} />} />
        <Route path="/EmployeeDashboard/*" element={
          <Private_employee islogin_employee={islogin_employee}>
            <EmployeeDashboard setislogin_employee={setislogin_employee} />
          </Private_employee>
        }/>

      </Routes>
    </div>
  )
}

export default App;