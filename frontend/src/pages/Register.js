import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", location: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await API.post("/auth/register", form);
      login(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const field = (label, name, type = "text", required = true) => (
    <div>
      <label className="block text-xs font-bold text-primary uppercase tracking-wide mb-1.5">{label}</label>
      <input
        type={type} name={name} required={required} value={form[name]} onChange={handleChange}
        className="w-full px-4 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
      />
    </div>
  );

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md glass-card rounded-3xl p-8">
        <h1 className="text-2xl font-bold text-primary mb-1">Join ReWear</h1>
        <p className="text-sm text-on-surface-variant mb-6">Start swapping sustainably.</p>
        {error && <p className="text-error text-sm mb-4 bg-error-container/40 px-3 py-2 rounded-lg">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {field("Full Name", "name")}
          {field("Email", "email", "email")}
          {field("Password", "password", "password")}
          {field("Phone", "phone", "text", false)}
          {field("Location (city)", "location")}
          <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-b from-primary-container to-primary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
            Create Account
          </button>
        </form>
        <p className="text-sm text-on-surface-variant mt-5 text-center">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Login</Link>
        </p>
      </div>
    </main>
  );
}
