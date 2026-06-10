import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import CompleteAccountSetup from "./CompleteAccountSetup.jsx";
import { BrandSymbol } from "./Logo.jsx";

function routeForRole(role) {
  if (role === "provider") return "/provider";
  if (role === "patient") return "/patient";
  return "/login";
}

export default function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, loading, role, userProfile, authError } = useAuth();

  if (loading) {
    return (
      <div className="state-card loading-brand">
        <BrandSymbol alt="BliT medical icon" />
        <span>Loading your BliT workspace...</span>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (authError) {
    return <div className="state-card error">{authError}</div>;
  }

  if (!userProfile?.role) {
    return <CompleteAccountSetup />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={routeForRole(role)} replace />;
  }

  return children;
}
