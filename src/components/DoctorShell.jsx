import { LogOut, Settings } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "./Logo.jsx";

export default function DoctorShell() {
  const { signOut, userProfile } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <main className="doctor-frame">
      <header className="doctor-topbar">
        <Link to="/provider" aria-label="Doctor dashboard">
          <Logo compact />
        </Link>
        <div className="doctor-actions">
          <span>{userProfile?.name || "Doctor"}</span>
          <Link to="/doctor/profile">
            <Settings size={18} />
            Profile
          </Link>
          <button type="button" onClick={handleSignOut}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </header>
      <section className="doctor-content">
        <Outlet />
      </section>
    </main>
  );
}
