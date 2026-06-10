import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";

export default function Signup() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      eyebrow="Provider-created access"
      title="Create a patient account"
      text="For the MVP, a doctor or pharmacist verifies the patient and generates access."
    >
      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          Patient full name
          <input defaultValue="Sarah Johnson" />
        </label>
        <label>
          Date of birth
          <input type="date" defaultValue="1962-01-14" />
        </label>
        <label>
          Email or phone
          <input defaultValue="sarah@example.com" />
        </label>
        <label>
          Temporary password
          <input defaultValue="BLIT-2048" />
        </label>
        <button type="button" onClick={() => navigate("/provider")}>
          Create patient access
        </button>
      </form>
      <p className="auth-switch">
        Already have access? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
