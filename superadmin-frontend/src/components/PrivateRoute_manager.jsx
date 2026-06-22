import React from "react"
import { Navigate } from "react-router-dom"

const PrivateRoute_manager = ({ children, islogin_manager }) => {
  return islogin_manager ? children : <Navigate to="/Manager-login" replace />
}

export default PrivateRoute_manager