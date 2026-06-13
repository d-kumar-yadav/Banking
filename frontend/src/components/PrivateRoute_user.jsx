import React from "react"
import { Navigate } from "react-router-dom"

const PrivateRoute_user = ({ children, islogin }) => {
    return islogin ? children : <Navigate to="/Login" replace />
}

export default PrivateRoute_user    
