import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import { auth, db } from "../firebase.js";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const userSnap = await getDoc(doc(db, "users", credential.user.uid));
      const role = userSnap.data()?.role;

      if (role === "provider") {
        navigate("/provider", { replace: true });
        return;
      }

      if (role === "patient") {
        navigate("/patient", { replace: true });
        return;
      }

      setStatus("Signed in, but this account does not have a BliT role yet.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to BliT"
      text="Patients and providers use separate workspaces after sign-in."
    >
      <form className="auth-form" onSubmit={handleLogin}>
        <label>
          Email
          <input
            type="email"
            value={email}
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
        {status && <p className="helper-text error-text">{status}</p>}
        <p className="helper-text">BliT routes you by the role stored in users/uid.</p>
      </form>
      <p className="auth-switch">
        Need access? <Link to="/signup">Create a patient invite</Link>
      </p>
    </AuthLayout>
  );
}
