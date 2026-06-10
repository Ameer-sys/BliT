import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import { auth, db } from "../firebase.js";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(roleChoice) {
    setStatus("");
    setIsSubmitting(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const userSnap = await getDoc(doc(db, "users", credential.user.uid));
      const role = userSnap.data()?.role;

      if (role === roleChoice) {
        navigate(roleChoice === "provider" ? "/provider" : "/patient", { replace: true });
        return;
      }

      setStatus(
        role
          ? `This account is registered as ${role}. Use the ${role === "provider" ? "doctor" : "patient"} sign in.`
          : "Signed in, but this account does not have a BliT role yet.",
      );
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
      text="Choose the workspace that matches your account. Your dashboard opens with the right care tools after sign-in."
    >
      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
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
          <span className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        <div className="split-actions">
          <button type="button" disabled={isSubmitting} onClick={() => handleLogin("patient")}>
            {isSubmitting ? "Signing in..." : "Sign in as patient"}
          </button>
          <button type="button" disabled={isSubmitting} onClick={() => handleLogin("provider")}>
            {isSubmitting ? "Signing in..." : "Sign in as doctor"}
          </button>
        </div>
        {status && <p className="helper-text error-text">{status}</p>}
        <p className="helper-text">Use patient sign-in for your blister pack, or doctor sign-in for patient management.</p>
      </form>
      <p className="auth-switch">
        Need an account? <Link to="/signup">Create one</Link>
      </p>
    </AuthLayout>
  );
}
