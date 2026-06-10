import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import { firebaseReady } from "../firebase.js";

export default function Login() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to BliT"
      text="Patients and providers use separate workspaces after sign-in."
    >
      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          Email
          <input type="email" defaultValue="sarah@example.com" />
        </label>
        <label>
          Password
          <input type="password" defaultValue="password" />
        </label>
        <div className="split-actions">
          <button type="button" onClick={() => navigate("/patient")}>
            Patient login
          </button>
          <button type="button" onClick={() => navigate("/provider")}>
            Provider login
          </button>
        </div>
        <p className="helper-text">
          Firebase auth is {firebaseReady ? "configured" : "ready for configuration"}.
        </p>
      </form>
      <p className="auth-switch">
        Need access? <Link to="/signup">Create a patient invite</Link>
      </p>
    </AuthLayout>
  );
}
