import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "./Logo.jsx";

export default function CompleteAccountSetup() {
  const { currentUser, refreshUserProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function chooseRole(role) {
    setIsSaving(true);
    setStatus("");

    try {
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          email: currentUser.email || "",
          name: currentUser.displayName || currentUser.email || "BliT user",
          role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      await refreshUserProfile();
      navigate(role === "provider" ? "/provider" : "/patient", { replace: true });
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <main className="setup-page">
      <section className="setup-card">
        <Logo stacked />
        <p className="eyebrow">Complete account setup</p>
        <h1>Choose how this BliT account should work.</h1>
        <p>
          Tell BliT whether this account belongs to a patient or a doctor so we
          can open the right workspace.
        </p>

        <div className="role-choice-grid">
          <button type="button" disabled={isSaving} onClick={() => chooseRole("patient")}>
            <strong>Patient</strong>
            <span>View my blister pack, records, and care timeline.</span>
          </button>
          <button type="button" disabled={isSaving} onClick={() => chooseRole("provider")}>
            <strong>Provider</strong>
            <span>Create medication schedules and health records.</span>
          </button>
        </div>

        {status && <p className="helper-text error-text">{status}</p>}
        <button className="text-btn" type="button" onClick={handleSignOut}>
          Sign out and use another account
        </button>
      </section>
    </main>
  );
}
