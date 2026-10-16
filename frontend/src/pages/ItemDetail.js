import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    API.get(`/clothing/${id}`).then((res) => setItem(res.data));
    if (user) API.get("/clothing/user/mine").then((res) => setMyItems(res.data.filter((i) => i.status === "available")));
  }, [id, user]);

  const sendSwapRequest = async () => {
    if (!selectedOffer) return setMessage("Select an item to offer first");
    try {
      await API.post("/swap", { itemOffered: selectedOffer, itemRequested: id });
      setMessage("Swap request sent successfully!");
      setTimeout(() => navigate("/swaps"), 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not send request");
    }
  };

  if (!item) return <main className="pt-24 px-4 text-center text-outline">Loading...</main>;

  const offeredItem = myItems.find((mi) => mi._id === selectedOffer);
  const diff = offeredItem ? offeredItem.estimatedValue - item.estimatedValue : 0;
  const fair = offeredItem && Math.abs(diff) <= item.estimatedValue * 0.15;

  return (
    <main className="pt-8 pb-20 px-4 md:px-12 max-w-[1280px] mx-auto">
      <nav className="flex items-center gap-1 text-xs text-on-surface-variant mb-6">
        <Link to="/" className="hover:text-primary">Browse</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-primary font-bold">{item.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Image */}
        <div className="lg:col-span-7">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-sm relative group max-w-lg mx-auto lg:mx-0">
            <img
              src={item.images?.[0] || "https://placehold.co/500x650?text=No+Image"}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 left-4 glass-card px-4 py-1.5 rounded-full text-xs font-bold text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">eco</span>
              SUSTAINABLE CHOICE
            </div>
          </div>
        </div>

        {/* Right: Sticky panel */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30">
            <span className="text-xs font-bold text-secondary tracking-widest">{item.type?.toUpperCase()}</span>
            <h1 className="text-2xl font-bold text-on-surface mt-1 mb-3">{item.title}</h1>

            <div className="flex flex-wrap gap-2 mb-5">
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-medium">Brand: {item.brand}</span>
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-medium">Size: {item.size}</span>
              <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-xs font-medium">Condition: {item.condition}</span>
            </div>

            <div className="bg-surface-container p-4 rounded-xl mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Estimated Swap Value</p>
                  <p className="text-sm font-bold text-primary">Based on brand & condition</p>
                </div>
              </div>
              <span className="text-2xl text-primary font-black">₹{item.estimatedValue}</span>
            </div>

            {item.description && (
              <div className="mb-5">
                <h3 className="font-bold text-on-surface mb-1">Description</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{item.description}</p>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 mb-5">
              <div className="w-11 h-11 rounded-full bg-secondary-container flex items-center justify-center text-primary font-bold">
                {item.owner?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-bold text-on-surface text-sm">{item.owner?.name}</p>
                <p className="text-xs text-secondary flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {item.location}
                </p>
              </div>
            </div>

            {!user && (
              <p className="text-center text-sm text-on-surface-variant">
                <Link to="/login" className="text-primary font-bold hover:underline">Login</Link> to send a swap request.
              </p>
            )}

            {user && user.id !== item.owner?._id && item.status === "available" && (
              <div className="pt-4 border-t border-outline-variant/30">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide block mb-2">Offer one of your items</label>
                <select
                  value={selectedOffer}
                  onChange={(e) => setSelectedOffer(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl text-sm mb-3 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                >
                  <option value="">-- Select your item --</option>
                  {myItems.map((mi) => (
                    <option key={mi._id} value={mi._id}>{mi.title} (₹{mi.estimatedValue})</option>
                  ))}
                </select>

                {offeredItem && (
                  <div className="bg-surface-container-low p-4 rounded-xl mb-4">
                    <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">Value Comparison</p>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Your item: <strong>₹{offeredItem.estimatedValue}</strong></span>
                      <span>Their item: <strong>₹{item.estimatedValue}</strong></span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {fair ? "✅ This looks like a fair swap match." : diff > 0 ? `⚠️ Your item is worth ₹${diff} more.` : `⚠️ Their item is worth ₹${Math.abs(diff)} more.`}
                    </p>
                  </div>
                )}

                <button
                  onClick={sendSwapRequest}
                  className="w-full py-4 bg-gradient-to-b from-primary-container to-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">swap_horiz</span>
                  SEND SWAP REQUEST
                </button>
                {message && <p className="text-center text-sm mt-2 text-primary font-medium">{message}</p>}
              </div>
            )}

            {item.status !== "available" && (
              <p className="text-center text-sm text-error font-medium">This item is currently {item.status}.</p>
            )}
          </div>

          <div className="bg-tertiary-container p-4 rounded-2xl text-on-tertiary-container flex items-center gap-4">
            <span className="material-symbols-outlined text-4xl opacity-80">recycling</span>
            <div>
              <h4 className="font-bold text-sm">Sustainable Choice</h4>
              <p className="text-xs">Swapping keeps this garment in use and out of landfill.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
