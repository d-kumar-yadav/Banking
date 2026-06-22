import React from "react"
import { Navigate } from "react-router-dom"

const PrivateRoute_superadmin = ({ children, islogin_superadmin }) => {
  return islogin_superadmin ? children : <Navigate to="/Superadmin-login" replace />
}

export default PrivateRoute_superadmin
