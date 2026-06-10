import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";

export default function Welcome() {
  return (
    <main className="welcome-page">
      <nav className="welcome-nav">
        <span className="welcome-nav-spacer" aria-hidden="true" />
        <div>
          <Link to="/login">Log in</Link>
          <Link className="dark-link" to="/signup">
            Get access
          </Link>
        </div>
      </nav>

      <section className="welcome-hero">
        <div className="hero-copy">
          <img className="brand-art hero-logo" src="/blit-hero-logo.png" alt="BliT logo: Your health. Connected." />
          <p className="eyebrow">Patient-centered health timeline</p>
          <h1>Your meds and medical records, in one calm place.</h1>
          <p>
            Doctors manage care. Patients stay informed. Every medication,
            record, and health milestone organized in one timeline.
          </p>
          <div className="hero-actions">
            <Link className="primary-link" to="/login">
              Sign in
            </Link>
            <Link className="secondary-link" to="/signup">
              Create patient access
            </Link>
          </div>
        </div>

        <div className="phone-preview" aria-label="BliT patient app preview">
          <div className="phone-top">
            <span>9:41</span>
            <Logo compact />
          </div>
          <div className="preview-card">
            <p>Today in BliT</p>
            <strong>Digital blister pack</strong>
            <div className="progress-track">
              <span style={{ width: "50%" }} />
            </div>
          </div>
          <div className="preview-blister">
            {["Breakfast", "Lunch", "Dinner", "Bedtime"].map((slot, index) => (
              <div className={index < 2 ? "done" : ""} key={slot}>
                <span>{slot}</span>
                <b />
                <em>{index < 2 ? "Taken" : "Pending"}</em>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
