import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getPatientForUser, getPatientsForProvider } from "../lib/firestoreData.js";

function initialsFor(nameOrEmail = "") {
  const parts = nameOrEmail.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return nameOrEmail.slice(0, 2).toUpperCase() || "BL";
}

export default function Profile() {
  const { currentUser, role, userProfile } = useAuth();
  const [patient, setPatient] = useState(null);
  const [patientCount, setPatientCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const name = userProfile?.name || currentUser?.displayName || currentUser?.email || "BliT user";
  const isPatient = role === "patient";

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser) return;
      setLoading(true);

      try {
        if (isPatient) {
          setPatient(await getPatientForUser(currentUser.uid));
        } else {
          const patients = await getPatientsForProvider(currentUser.uid);
          setPatientCount(patients.length);
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [currentUser, isPatient]);

  if (loading) {
    return <div className="state-card">Loading profile...</div>;
  }

  const details = isPatient
    ? [
        ["Account type", "Patient"],
        ["Email", currentUser.email || "Not set"],
        ["Patient ID", patient?.patientCode || patient?.id || "Not linked yet"],
        ["Linked doctor", patient?.createdByProviderId ? "Connected" : "Not connected yet"],
      ]
    : [
        ["Account type", "Doctor"],
        ["Email", currentUser.email || "Not set"],
        ["Patients", String(patientCount)],
        ["Verification", "MVP self-created doctor account"],
      ];

  return (
    <>
      <PageHeader
        eyebrow={isPatient ? "Patient profile" : "Doctor profile"}
        title={name}
        text={
          isPatient
            ? "Your patient account and linked care access."
            : "Your doctor workspace account for managing patient care."
        }
      />
      <section className="profile-layout">
        <div className="profile-hero">
          <div className="avatar">{initialsFor(name)}</div>
          <h2>{name}</h2>
          <p>{currentUser.email}</p>
        </div>
        <div className="details-list">
          {details.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
