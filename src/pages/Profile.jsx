import { useEffect, useState } from "react";
import BackButton from "../components/BackButton.jsx";
import { BrandSymbol } from "../components/Logo.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getPatientForUser, getPatientsForProvider, updatePatient, updateUserProfile } from "../lib/firestoreData.js";

export default function Profile() {
  const { currentUser, role, userProfile, refreshUserProfile } = useAuth();
  const [patient, setPatient] = useState(null);
  const [patientCount, setPatientCount] = useState(0);
  const [profileForm, setProfileForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");
  const name = userProfile?.name || currentUser?.displayName || currentUser?.email || "BliT user";
  const isPatient = role === "patient";

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser) return;
      setLoading(true);

      try {
        if (isPatient) {
          const patientDoc = await getPatientForUser(currentUser.uid);
          setPatient(patientDoc);
          setProfileForm({
            name: userProfile?.name || currentUser.displayName || "",
            phone: userProfile?.phone || patientDoc?.phone || "",
            dob: patientDoc?.dob || "",
            emergencyContact: patientDoc?.emergencyContact || "",
            emergencyPhone: patientDoc?.emergencyPhone || "",
          });
        } else {
          const patients = await getPatientsForProvider(currentUser.uid);
          setPatientCount(patients.length);
          setProfileForm({
            name: userProfile?.name || currentUser.displayName || "",
            phone: userProfile?.phone || "",
            clinicName: userProfile?.clinicName || "",
            specialty: userProfile?.specialty || "",
            license: userProfile?.license || "",
          });
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [currentUser, isPatient]);

  function updateField(field, value) {
    setProfileForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSaveProfile(event) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("");

    try {
      await updateUserProfile(currentUser.uid, {
        name: profileForm.name,
        phone: profileForm.phone,
        ...(isPatient
          ? {}
          : {
              clinicName: profileForm.clinicName,
              specialty: profileForm.specialty,
              license: profileForm.license,
            }),
      });

      if (isPatient && patient?.id) {
        await updatePatient(patient.id, {
          name: profileForm.name,
          phone: profileForm.phone,
          dob: profileForm.dob,
          emergencyContact: profileForm.emergencyContact,
          emergencyPhone: profileForm.emergencyPhone,
        });
        setPatient(await getPatientForUser(currentUser.uid));
      }

      await refreshUserProfile();
      setStatus("Profile updated.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  }

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
        action={<BackButton fallback={isPatient ? "/patient" : "/provider"} />}
      />
      <section className="profile-layout">
        <div className="profile-hero">
          <div className="avatar">
            <BrandSymbol alt="BliT medical icon" />
          </div>
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

      <form className="panel-form profile-form" onSubmit={handleSaveProfile}>
        <div>
          <p className="eyebrow">Editable profile</p>
          <h2>Keep your care identity current</h2>
        </div>
        <div className="two-column">
          <label>
            Full name
            <input value={profileForm.name || ""} onChange={(event) => updateField("name", event.target.value)} />
          </label>
          <label>
            Phone
            <input value={profileForm.phone || ""} onChange={(event) => updateField("phone", event.target.value)} />
          </label>
        </div>
        <label>
          Email
          <input value={currentUser.email || ""} disabled />
        </label>
        <label>
          Role
          <input value={isPatient ? "Patient" : "Doctor"} disabled />
        </label>

        {isPatient ? (
          <>
            <label>
              Date of birth
              <input type="date" value={profileForm.dob || ""} onChange={(event) => updateField("dob", event.target.value)} />
            </label>
            <div className="two-column">
              <label>
                Emergency contact
                <input value={profileForm.emergencyContact || ""} onChange={(event) => updateField("emergencyContact", event.target.value)} />
              </label>
              <label>
                Emergency phone
                <input value={profileForm.emergencyPhone || ""} onChange={(event) => updateField("emergencyPhone", event.target.value)} />
              </label>
            </div>
          </>
        ) : (
          <>
            <label>
              Clinic name
              <input value={profileForm.clinicName || ""} onChange={(event) => updateField("clinicName", event.target.value)} />
            </label>
            <div className="two-column">
              <label>
                Specialty
                <input value={profileForm.specialty || ""} onChange={(event) => updateField("specialty", event.target.value)} />
              </label>
              <label>
                License placeholder
                <input value={profileForm.license || ""} onChange={(event) => updateField("license", event.target.value)} placeholder="MVP verification later" />
              </label>
            </div>
          </>
        )}
        <button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save profile"}
        </button>
        {status && <p className="helper-text status-text">{status}</p>}
      </form>
    </>
  );
}
