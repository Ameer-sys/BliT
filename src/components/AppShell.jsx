import { CalendarDays, Home, LogOut, Pill, ScrollText, UserRound, UsersRound } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "./Logo.jsx";

const patientNavItems = [
  { to: "/patient", label: "Home", icon: Home },
  { to: "/timeline", label: "Timeline", icon: CalendarDays },
  { to: "/medications", label: "Meds", icon: Pill },
  { to: "/records", label: "Records", icon: ScrollText },
  { to: "/profile", label: "Profile", icon: UserRound },
];

const providerNavItems = [
  { to: "/provider", label: "Home", icon: Home },
  { to: "/provider", label: "Patients", icon: UsersRound },
  { to: "/records", label: "Records", icon: ScrollText },
  { to: "/medications", label: "Meds", icon: Pill },
  { to: "/doctor/profile", label: "Profile", icon: UserRound },
];

function titleForPath(pathname, role) {
  if (pathname.includes("timeline")) return "Timeline";
  if (pathname.includes("medications")) return "Meds";
  if (pathname.includes("records")) return "Records";
  if (pathname.includes("profile")) return "Profile";
  return role === "provider" ? "Home" : "Home";
}

export default function AppShell() {
  const { role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = role === "provider" ? providerNavItems : patientNavItems;

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <main className="app-frame app-shell">
      <aside className="side-nav desktop-sidebar">
        <Logo compact />
        <nav aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to}>
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <button className="sign-out-btn" type="button" onClick={handleSignOut}>
          <LogOut size={18} />
          Sign out
        </button>
      </aside>
      <header className="mobile-header">
        <Logo compact />
        <strong>{titleForPath(location.pathname, role)}</strong>
        <button type="button" onClick={handleSignOut} aria-label="Sign out">
          <LogOut size={18} />
        </button>
      </header>
      <section className="content-panel app-main">
        <Outlet />
      </section>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {navItems.map((item, index) => {
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
