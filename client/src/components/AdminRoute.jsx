import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const AdminRoute = ({ children }) => {
  const { auth } = useAuth();

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }


  if (auth.user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};


export default AdminRoute;