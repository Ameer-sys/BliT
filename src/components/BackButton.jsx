import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ fallback = -1, label = "Back" }) {
  const navigate = useNavigate();

  return (
    <button className="back-btn" type="button" onClick={() => navigate(fallback)}>
      <ArrowLeft size={18} />
      {label}
    </button>
  );
}
