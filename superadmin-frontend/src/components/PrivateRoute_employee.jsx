import React from "react"
import { Navigate } from "react-router-dom"

const PrivateRoute_employee = ({ children, islogin_employee }) => {
  return islogin_employee ? children : <Navigate to="/Employee-login" replace />
}

export default PrivateRoute_employee
