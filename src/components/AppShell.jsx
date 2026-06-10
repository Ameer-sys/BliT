import { CalendarDays, Home, LogOut, Pill, ScrollText, UserRound } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
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
  { to: "/provider", label: "Dashboard", icon: Home },
  { to: "/timeline", label: "Timeline", icon: CalendarDays },
  { to: "/medications", label: "Meds", icon: Pill },
  { to: "/records", label: "Records", icon: ScrollText },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export default function AppShell() {
  const { role, signOut } = useAuth();
  const navigate = useNavigate();
  const navItems = role === "provider" ? providerNavItems : patientNavItems;

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <main className="app-frame">
      <aside className="side-nav">
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
      <section className="content-panel">
        <Outlet />
      </section>
    </main>
  );
}
