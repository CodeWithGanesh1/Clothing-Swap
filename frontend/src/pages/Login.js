import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await API.post("/auth/login", form);
      login(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md glass-card rounded-3xl p-8">
        <h1 className="text-2xl font-bold text-primary mb-1">Welcome back</h1>
        <p className="text-sm text-on-surface-variant mb-6">Login to continue swapping.</p>
        {error && <p className="text-error text-sm mb-4 bg-error-container/40 px-3 py-2 rounded-lg">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wide mb-1.5">Email</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wide mb-1.5">Password</label>
            <input
              type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-b from-primary-container to-primary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
            Login
          </button>
        </form>
        <p className="text-sm text-on-surface-variant mt-5 text-center">
          New here? <Link to="/register" className="text-primary font-bold hover:underline">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
