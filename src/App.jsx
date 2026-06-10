import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import Login from "./pages/Login.jsx";
import Medications from "./pages/Medications.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";
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
      <Route element={<AppShell />}>
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/provider" element={<ProviderDashboard />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/medications" element={<Medications />} />
        <Route path="/records" element={<Records />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
