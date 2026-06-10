import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";

export default function Welcome() {
  return (
    <main className="welcome-page">
      <nav className="welcome-nav">
        <Logo />
        <div>
          <Link to="/login">Log in</Link>
          <Link className="dark-link" to="/signup">
            Get access
          </Link>
        </div>
      </nav>

      <section className="welcome-hero">
        <div className="hero-copy">
          <p className="eyebrow">Patient-centered health timeline</p>
          <h1>Your meds and medical records, packed into one calm app.</h1>
          <p>
            BliT lets doctors and pharmacists create patient profiles, add
            prescriptions and records, then gives patients a simple digital
            blister pack for everyday care.
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
            <span>BliT</span>
          </div>
          <div className="preview-card">
            <p>Good morning, Sarah</p>
            <strong>2 / 4 doses completed</strong>
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
