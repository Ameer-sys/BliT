import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

export default function AuthLayout({ children, eyebrow, title, text }) {
  return (
    <main className="auth-page">
      <section className="auth-brand">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{text}</p>
        <div className="auth-preview" aria-hidden="true">
          <div className="mini-blister">
            <span>Breakfast</span>
            <b />
            <em>Taken</em>
          </div>
          <div className="mini-blister pending">
            <span>Dinner</span>
            <b />
            <em>Pending</em>
          </div>
        </div>
      </section>
      <section className="auth-card">
        <Logo stacked className="auth-logo" />
        {children}
        <Link className="quiet-link" to="/">
          Back to welcome
        </Link>
      </section>
    </main>
  );
}
