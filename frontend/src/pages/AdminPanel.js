import { useEffect, useState } from "react";
import API from "../api/axios";

export default function AdminPanel() {
  const [tab, setTab] = useState("analytics");
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [swaps, setSwaps] = useState([]);

  const load = async () => {
    const [u, l, a, s] = await Promise.all([
      API.get("/admin/users"),
      API.get("/admin/listings"),
      API.get("/admin/analytics"),
      API.get("/admin/swaps"),
    ]);
    setUsers(u.data);
    setListings(l.data);
    setAnalytics(a.data);
    setSwaps(s.data);
  };

  useEffect(() => { load(); }, []);

  const toggleBlock = async (id) => { await API.put(`/admin/users/${id}/block`); load(); };
  const removeListing = async (id) => {
    if (!window.confirm("Remove this listing?")) return;
    await API.delete(`/admin/listings/${id}`);
    load();
  };
  const resolveDispute = async (id, finalStatus) => {
    const resolution = window.prompt("Resolution note:", "Reviewed by admin");
    if (resolution === null) return;
    await API.put(`/admin/swaps/${id}/resolve`, { resolution, finalStatus });
    load();
  };

  const statCards = analytics ? [
    { label: "New Users", value: analytics.totalUsers, icon: "person_add", bg: "bg-primary-fixed-dim/30", text: "text-primary" },
    { label: "Total Listings", value: analytics.totalListings, icon: "inventory_2", bg: "bg-secondary-container", text: "text-secondary" },
    { label: "Successful Swaps", value: analytics.successfulSwaps, icon: "sync_alt", bg: "bg-tertiary-fixed-dim/30", text: "text-tertiary" },
    { label: "Conversion Rate", value: analytics.conversionRate, icon: "trending_up", bg: "bg-primary-fixed-dim/30", text: "text-primary" },
  ] : [];

  const tabs = [
    { key: "analytics", label: "Analytics" },
    { key: "users", label: "Users" },
    { key: "listings", label: "Listings" },
    { key: "swaps", label: "Swaps" },
  ];

  const badgeClass = { pending: "bg-tertiary-fixed text-on-tertiary-fixed-variant", accepted: "bg-secondary-container text-on-secondary-container", rejected: "bg-error-container text-error", completed: "bg-primary text-white" };

  return (
    <main className="pt-8 pb-20 px-4 md:px-12 max-w-[1280px] mx-auto">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Overview</p>
          <h1 className="text-3xl font-bold text-on-surface">Admin Panel</h1>
        </div>
        <div className="flex bg-surface-container p-1 rounded-xl gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t.key ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:bg-surface"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {tab === "analytics" && analytics && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((s) => (
            <div key={s.label} className="glass-card p-5 rounded-2xl flex flex-col justify-between">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.text} mb-4`}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
              <p className="text-on-surface-variant text-xs">{s.label}</p>
              <h3 className="text-2xl font-bold text-on-surface">{s.value}</h3>
            </div>
          ))}
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-error-container flex items-center justify-center text-error mb-4">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <p className="text-on-surface-variant text-xs">Pending Swaps</p>
            <h3 className="text-2xl font-bold text-on-surface">{analytics.pendingSwaps}</h3>
          </div>
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-secondary mb-4">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <p className="text-on-surface-variant text-xs">Total Swap Requests</p>
            <h3 className="text-2xl font-bold text-on-surface">{analytics.totalSwapRequests}</h3>
          </div>
        </section>
      )}

      {tab === "users" && (
        <section className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
              <tr><th className="text-left p-4">Name</th><th className="text-left p-4">Email</th><th className="text-left p-4">Location</th><th className="text-left p-4">Status</th><th className="text-left p-4">Action</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-outline-variant/20">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-on-surface-variant">{u.email}</td>
                  <td className="p-4 text-on-surface-variant">{u.location}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.isBlocked ? "bg-error-container text-error" : "bg-secondary-container text-on-secondary-container"}`}>
                      {u.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggleBlock(u._id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${u.isBlocked ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-error"}`}>
                      {u.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === "listings" && (
        <section className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
              <tr><th className="text-left p-4">Title</th><th className="text-left p-4">Owner</th><th className="text-left p-4">Status</th><th className="text-left p-4">Value</th><th className="text-left p-4">Action</th></tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l._id} className="border-t border-outline-variant/20">
                  <td className="p-4 font-medium">{l.title}</td>
                  <td className="p-4 text-on-surface-variant">{l.owner?.name}</td>
                  <td className="p-4 text-on-surface-variant capitalize">{l.status}</td>
                  <td className="p-4 font-bold text-primary">₹{l.estimatedValue}</td>
                  <td className="p-4">
                    <button onClick={() => removeListing(l._id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-error-container text-error">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === "swaps" && (
        <section className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 text-xs text-on-surface-variant border-b border-outline-variant/20">
            All swap activity platform-wide. Disputed swaps are highlighted for review.
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
              <tr><th className="text-left p-4">Requester</th><th className="text-left p-4">Receiver</th><th className="text-left p-4">Offered</th><th className="text-left p-4">Requested</th><th className="text-left p-4">Status</th><th className="text-left p-4">Dispute</th><th className="text-left p-4">Action</th></tr>
            </thead>
            <tbody>
              {swaps.length === 0 ? (
                <tr><td colSpan="7" className="text-center p-8 text-outline">No swap activity yet</td></tr>
              ) : swaps.map((s) => (
                <tr key={s._id} className={`border-t border-outline-variant/20 ${s.isDisputed ? "bg-error-container/20" : ""}`}>
                  <td className="p-4">{s.requester?.name}</td>
                  <td className="p-4">{s.receiver?.name}</td>
                  <td className="p-4">{s.itemOffered?.title}</td>
                  <td className="p-4">{s.itemRequested?.title}</td>
                  <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeClass[s.status]}`}>{s.status}</span></td>
                  <td className="p-4">
                    {s.isDisputed ? (
                      <span className="text-error font-semibold text-xs">⚠ {s.disputeReason}</span>
                    ) : s.disputeResolution ? (
                      <span className="text-xs text-on-surface-variant">Resolved: {s.disputeResolution}</span>
                    ) : "—"}
                  </td>
                  <td className="p-4">
                    {s.isDisputed && (
                      <div className="flex gap-2">
                        <button onClick={() => resolveDispute(s._id, "completed")} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white">Complete</button>
                        <button onClick={() => resolveDispute(s._id, "rejected")} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-error-container text-error">Cancel</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
