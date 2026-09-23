import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({children}) => {

    const {auth} =useAuth();
    
    if(!auth.token){
        return<Navigate to ="/login"/>;
    }


  return children;
}

export default ProtectedRoute
