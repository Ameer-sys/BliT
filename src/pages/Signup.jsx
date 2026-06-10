import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { auth, db } from "../firebase.js";

export default function Signup() {
  const navigate = useNavigate();
  const { refreshUserProfile } = useAuth();
  const [role, setRole] = useState("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignup(event) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password,
      );
      await updateProfile(credential.user, { displayName: name });

      await setDoc(doc(db, "users", credential.user.uid), {
        name,
        email: email.trim().toLowerCase(),
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (role === "patient") {
        await setDoc(doc(db, "patients", credential.user.uid), {
          name,
          email: email.trim().toLowerCase(),
          linkedUserId: credential.user.uid,
          patientCode: `BLT-${credential.user.uid.slice(0, 6).toUpperCase()}`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      await refreshUserProfile(credential.user);
      navigate(role === "provider" ? "/provider" : "/patient", { replace: true });
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Create account"
      title="Join BliT as a patient or doctor"
      text="For the MVP, anyone can create either account type. Later, doctor accounts can require verification."
    >
      <form className="auth-form" onSubmit={handleSignup}>
        <div className="role-tabs" aria-label="Choose account type">
          <button
            className={role === "patient" ? "active" : ""}
            type="button"
            onClick={() => setRole("patient")}
          >
            Patient
          </button>
          <button
            className={role === "provider" ? "active" : ""}
            type="button"
            onClick={() => setRole("provider")}
          >
            Doctor
          </button>
        </div>
        <label>
          Full name
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
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
            autoComplete="new-password"
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : `Create ${role === "provider" ? "doctor" : "patient"} account`}
        </button>
        {status && <p className="helper-text error-text">{status}</p>}
      </form>
      <p className="auth-switch">
        Already have access? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
