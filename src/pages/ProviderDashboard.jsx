import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Mail, Search, UserPlus, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  findUserByEmail,
  getOrCreatePatientForUser,
  getPatientsForProvider,
} from "../lib/firestoreData.js";

export default function ProviderDashboard() {
  const { currentUser, userProfile } = useAuth();
  const [patients, setPatients] = useState([]);
  const [patientEmail, setPatientEmail] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patients;
    return patients.filter((patient) =>
      [patient.name, patient.email, patient.patientCode]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [patients, search]);

  async function loadPatients() {
    if (!currentUser) return;
    setLoading(true);
    try {
      setPatients(await getPatientsForProvider(currentUser.uid));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, [currentUser]);

  async function handleAddPatient(event) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("");

    try {
      const patientUser = await findUserByEmail(patientEmail);

      if (!patientUser) {
        setStatus("No BliT patient account was found with that email.");
        return;
      }

      if (patientUser.role !== "patient") {
        setStatus("That email belongs to a doctor account. Add a patient account email.");
        return;
      }

      const patientDoc = await getOrCreatePatientForUser({
        patientUser,
        providerId: currentUser.uid,
      });

      await loadPatients();
      setPatientEmail("");
      setStatus(`${patientDoc.name || patientDoc.email} was added.`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return <div className="state-card">Loading doctor dashboard...</div>;
  }

  return (
    <div className="doctor-dashboard page-enter">
      <section className="doctor-hero">
        <div>
          <p className="eyebrow">Doctor dashboard</p>
          <h1>Welcome, Dr. {userProfile?.name || "BliT"}</h1>
          <p>Manage patients, medication schedules, dose history, and care records from one calm workspace.</p>
        </div>
        <div className="doctor-hero-stat">
          <UsersRound size={26} />
          <strong>{patients.length}</strong>
          <span>patients</span>
        </div>
      </section>

      <section className="doctor-controls">
        <form className="compact-form" onSubmit={handleAddPatient}>
          <label>
            Add patient by email
            <div className="input-with-icon">
              <Mail size={18} />
              <input
                type="email"
                value={patientEmail}
                onChange={(event) => setPatientEmail(event.target.value)}
                placeholder="patient@example.com"
                required
              />
            </div>
          </label>
          <button type="submit" disabled={isSaving}>
            <UserPlus size={18} />
            {isSaving ? "Adding..." : "Add"}
          </button>
        </form>

        <label className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search patients"
          />
        </label>
      </section>

      {status && <p className="helper-text status-text">{status}</p>}

      <section className="doctor-patient-grid">
        {filteredPatients.length === 0 ? (
          <article className="empty-panel">
            <h2>No patients yet</h2>
            <p>Add a patient by email after they create a BliT patient account.</p>
          </article>
        ) : (
          filteredPatients.map((patient) => (
            <Link className="doctor-patient-card" key={patient.id} to={`/doctor/patients/${patient.id}`}>
              <span className="patient-avatar">
                {(patient.name || patient.email || "BL").slice(0, 2).toUpperCase()}
              </span>
              <div>
                <strong>{patient.name || patient.email}</strong>
                <p>{patient.email || patient.patientCode || patient.id}</p>
              </div>
              <ArrowRight size={18} />
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
