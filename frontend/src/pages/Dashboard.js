import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyForm = { title: "", type: "", brand: "", size: "", condition: "Good", description: "", location: "", images: "" };

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchMine = async () => {
    const { data } = await API.get("/clothing/user/mine");
    setItems(data);
  };

  useEffect(() => { fetchMine(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, images: form.images ? [form.images] : [] };
    if (editingId) {
      await API.put(`/clothing/${editingId}`, payload);
    } else {
      await API.post("/clothing", payload);
    }
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
    fetchMine();
  };

  const startEdit = (item) => {
    setForm({
      title: item.title,
      type: item.type,
      brand: item.brand,
      size: item.size,
      condition: item.condition,
      description: item.description || "",
      location: item.location,
      images: item.images?.[0] || "",
    });
    setEditingId(item._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this listing?")) return;
    await API.delete(`/clothing/${id}`);
    fetchMine();
  };

  const stats = [
    { label: "Total Listings", value: items.length, icon: "inventory_2", bg: "bg-secondary-container", text: "text-primary" },
    { label: "Available", value: items.filter((i) => i.status === "available").length, icon: "check_circle", bg: "bg-primary-container/20", text: "text-primary" },
    { label: "Pending Swap", value: items.filter((i) => i.status === "pending").length, icon: "pending_actions", bg: "bg-tertiary-container/20", text: "text-tertiary" },
    { label: "Swapped", value: items.filter((i) => i.status === "swapped").length, icon: "eco", bg: "bg-secondary-container", text: "text-primary" },
  ];

  const statusStyle = {
    available: "bg-secondary-container text-on-secondary-container",
    pending: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    swapped: "bg-primary-fixed text-on-primary-fixed-variant",
  };

  return (
    <main className="pt-8 pb-16 px-4 md:px-12 max-w-[1280px] mx-auto">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl mb-6 glass-card p-8 border border-primary/10">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Welcome back, {user?.name}</h1>
            <p className="text-base text-on-surface-variant max-w-lg">
              Every swap keeps a garment out of landfill — here's how your closet is doing.
            </p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) { setForm(emptyForm); setEditingId(null); } }}
            className="px-5 py-3 rounded-xl bg-primary text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0"
          >
            <span className="material-symbols-outlined">{showForm ? "close" : "add"}</span>
            {showForm ? "Cancel" : "Add New Listing"}
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-4 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center ${s.text}`}>
              <span className="material-symbols-outlined text-3xl">{s.icon}</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Add/Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 mb-6">
          <h3 className="text-lg font-bold text-on-surface mb-4">{editingId ? "Edit Listing" : "New Listing"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">Type</label>
              <input required placeholder="Shirt, Jeans, Jacket..." value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">Brand</label>
              <input required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full px-4 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">Size</label>
              <input required value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}
                className="w-full px-4 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">Condition</label>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full px-4 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none">
                <option>New</option><option>Like New</option><option>Good</option><option>Fair</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">Location</label>
              <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-4 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">Image URL (optional)</label>
              <input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })}
                className="w-full px-4 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">Description</label>
              <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
          </div>
          <button type="submit" className="mt-5 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-opacity">
            {editingId ? "Update Listing" : "Publish Listing"}
          </button>
        </form>
      )}

      {/* My Listings */}
      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-lg font-bold text-on-surface mb-4">My Listings</h2>
        {items.length === 0 ? (
          <div className="text-center py-16 text-outline">
            <span className="material-symbols-outlined text-5xl mb-2 block">checkroom</span>
            <p className="font-semibold">No listings yet</p>
            <p className="text-sm">Add your first item to start swapping.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item._id} className="bg-surface-container-low rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={item.images?.[0] || "https://placehold.co/300x200?text=No+Image"}
                    alt={item.title}
                    className="w-full h-40 object-cover"
                  />
                  <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyle[item.status]}`}>
                    {item.status}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-on-surface text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-on-surface-variant mb-3">Swap value: ₹{item.estimatedValue}</p>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(item)} className="flex-1 px-3 py-2 rounded-lg bg-secondary-container text-on-secondary-container text-xs font-semibold hover:opacity-80 transition-opacity">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="flex-1 px-3 py-2 rounded-lg bg-error-container text-error text-xs font-semibold hover:opacity-80 transition-opacity">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
