import { CalendarDays, Home, Pill, ScrollText, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import Logo from "./Logo.jsx";

const navItems = [
  { to: "/patient", label: "Home", icon: Home },
  { to: "/timeline", label: "Timeline", icon: CalendarDays },
  { to: "/medications", label: "Meds", icon: Pill },
  { to: "/records", label: "Records", icon: ScrollText },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export default function AppShell() {
  return (
    <main className="app-frame">
      <aside className="side-nav">
        <Logo />
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
        <NavLink className="provider-entry" to="/provider">
          Provider workspace
        </NavLink>
      </aside>
      <section className="content-panel">
        <Outlet />
      </section>
    </main>
  );
}
