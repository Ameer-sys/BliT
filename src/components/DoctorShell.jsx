import { Home, LogOut, Pill, ScrollText, Settings, UserRound, UsersRound } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "./Logo.jsx";

const providerNavItems = [
  { to: "/provider", label: "Home", icon: Home },
  { to: "/provider", label: "Patients", icon: UsersRound },
  { to: "/records", label: "Records", icon: ScrollText },
  { to: "/medications", label: "Meds", icon: Pill },
  { to: "/doctor/profile", label: "Profile", icon: UserRound },
];

function titleForPath(pathname) {
  if (pathname.includes("/doctor/patients")) return "Patient";
  if (pathname.includes("profile")) return "Profile";
  return "Home";
}

export default function DoctorShell() {
  const { signOut, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <main className="doctor-frame app-shell">
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
      <header className="mobile-header">
        <Logo compact />
        <strong>{titleForPath(location.pathname)}</strong>
        <button type="button" onClick={handleSignOut} aria-label="Sign out">
          <LogOut size={18} />
        </button>
      </header>
      <section className="doctor-content app-main">
        <Outlet />
      </section>
      <nav className="mobile-bottom-nav" aria-label="Provider mobile navigation">
        {providerNavItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink key={`${item.to}-${item.label}-${index}`} to={item.to}>
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </main>
  );
}
