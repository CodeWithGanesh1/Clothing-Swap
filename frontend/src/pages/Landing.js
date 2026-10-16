import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

export default function Landing() {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    API.get("/clothing").then((res) => setRecent(res.data.slice(0, 4)));
  }, []);

  const steps = [
    { icon: "upload_file", title: "Upload", desc: "Snap a few photos of clothes you no longer wear and list them." },
    { icon: "search", title: "Browse", desc: "Discover pre-loved pieces from people near you." },
    { icon: "swap_horiz", title: "Swap", desc: "Send a swap request, negotiate, and exchange — no money involved." },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-tertiary">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 0, transparent 45%), radial-gradient(circle at 80% 70%, white 0, transparent 40%)" }}></div>
        <div className="relative z-10 text-center px-6 max-w-3xl py-24">
          <h1 className="text-white font-bold text-4xl md:text-6xl leading-tight mb-6">
            Swap Clothes,<br />
            <span className="text-primary-fixed" style={{ color: "#a1d494" }}>Save Money, Save Planet</span>
          </h1>
          <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
            The conscious clothing exchange. Give your wardrobe a second life and discover pre-loved pieces through local swaps — no cash needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-8 py-4 rounded-xl bg-white text-primary font-bold shadow-lg hover:shadow-xl transition-all active:scale-95">
              Start Swapping
            </Link>
            <Link to="/browse" className="px-8 py-4 rounded-xl glass-card text-white font-bold border border-white/40 hover:bg-white/10 transition-all active:scale-95">
              Browse Items
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface-container-low py-16">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Circular Fashion Made Simple</h2>
          <div className="grid md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-outline-variant/30 z-0"></div>
            {steps.map((s) => (
              <div key={s.title} className="relative z-10 group">
                <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-3xl text-primary">{s.icon}</span>
                </div>
                <h4 className="font-bold text-lg mb-1">{s.title}</h4>
                <p className="text-on-surface-variant text-sm max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest listings (real data) */}
      {recent.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-6 py-16">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold">Latest Listings</h2>
            <Link to="/browse" className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all text-sm">
              Browse All <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recent.map((item) => (
              <Link to={`/item/${item._id}`} key={item._id} className="group cursor-pointer">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-surface-container-high shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300 mb-2">
                  <img
                    src={item.images?.[0] || "https://placehold.co/300x400?text=No+Image"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <p className="text-xs text-on-surface-variant">{item.brand}</p>
                <h4 className="font-bold text-sm">{item.title}</h4>
                <span className="text-xs font-bold text-primary">₹{item.estimatedValue}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA footer band */}
      <section className="bg-primary-dark py-14 text-center px-6">
        <h3 className="text-white text-2xl font-bold mb-3">Ready to refresh your style, responsibly?</h3>
        <p className="text-white/80 mb-6">Join the community keeping clothes in circulation.</p>
        <Link to="/register" className="inline-block px-8 py-3 rounded-xl bg-white text-primary font-bold hover:shadow-lg transition-all">
          Create Free Account
        </Link>
      </section>
    </main>
  );
}
