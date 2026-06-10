import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import DoctorShell from "./components/DoctorShell.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Medications from "./pages/Medications.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";
import PatientDetail from "./pages/PatientDetail.jsx";
import Profile from "./pages/Profile.jsx";
import ProviderDashboard from "./pages/ProviderDashboard.jsx";
import Records from "./pages/Records.jsx";
import Signup from "./pages/Signup.jsx";
import Timeline from "./pages/Timeline.jsx";
import Welcome from "./pages/Welcome.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/medications" element={<Medications />} />
        <Route path="/records" element={<Records />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route
        element={
          <ProtectedRoute allowedRoles={["provider"]}>
            <DoctorShell />
          </ProtectedRoute>
        }
      >
        <Route path="/provider" element={<ProviderDashboard />} />
        <Route path="/doctor/patients/:patientId" element={<PatientDetail />} />
        <Route path="/doctor/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
