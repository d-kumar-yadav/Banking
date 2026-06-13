import React from "react"
import { Navigate } from "react-router-dom"

const PrivateRoute_admin = ({ children, islogin_admin }) => {
  return islogin_admin ? children : <Navigate to="/Admin-login" replace />
}

export default PrivateRoute_admin