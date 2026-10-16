import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Profile() {
  const [form, setForm] = useState({ name: "", phone: "", location: "", password: "" });
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    API.get("/user/me").then((res) => {
      setForm({ name: res.data.name, phone: res.data.phone || "", location: res.data.location, password: "" });
      setEmail(res.data.email);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await API.put("/user/me", payload);
      setMessage("Profile updated successfully!");
      setForm({ ...form, password: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <main className="pt-8 pb-16 px-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-on-surface mb-6">My Profile</h1>
      <div className="glass-card rounded-3xl p-8">
        {message && <p className="text-primary text-sm mb-4 bg-secondary-container/50 px-3 py-2 rounded-lg">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wide mb-1.5">Email (cannot be changed)</label>
            <input value={email} disabled className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-sm text-outline" />
          </div>
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wide mb-1.5">Full Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="w-full px-4 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wide mb-1.5">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wide mb-1.5">Location</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required
              className="w-full px-4 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wide mb-1.5">New Password (leave blank to keep current)</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-b from-primary-container to-primary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
            Save Changes
          </button>
        </form>
      </div>
    </main>
  );
}
