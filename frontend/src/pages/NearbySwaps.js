import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

// Fix default marker icons (CRA/webpack breaks Leaflet's default icon paths)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const meIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  className: "hue-rotate-90", // visually distinguish "you" marker a bit
});

// Simple free geocoding via OpenStreetMap Nominatim (no API key required)
const geocodeCache = {};
async function geocodeCity(city) {
  const key = city.toLowerCase().trim();
  if (geocodeCache[key]) return geocodeCache[key];
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`);
    const data = await res.json();
    if (data && data[0]) {
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      geocodeCache[key] = coords;
      return coords;
    }
  } catch (e) {
    // ignore, fall through
  }
  return null;
}

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 11);
  }, [center, map]);
  return null;
}

export default function NearbySwaps() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [myCoords, setMyCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [profileRes, itemsRes] = await Promise.all([
        API.get("/user/me"),
        API.get("/clothing"),
      ]);

      const available = itemsRes.data.filter((i) => i.owner?._id !== user.id);

      // Geocode my location + all unique item locations (rate-limited politely)
      const myGeo = await geocodeCity(profileRes.data.location);
      setMyCoords(myGeo);

      const withCoords = [];
      for (const item of available) {
        // small delay to be polite to the free geocoding service
        // eslint-disable-next-line no-await-in-loop
        const coords = await geocodeCity(item.location);
        if (coords) withCoords.push({ ...item, coords });
      }
      setItems(withCoords);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line
  }, [user.id]);

  const defaultCenter = myCoords || { lat: 20.5937, lng: 78.9629 }; // India center fallback

  return (
    <main className="pt-8 pb-16 px-4 md:px-12 max-w-[1280px] mx-auto">
      <h1 className="text-3xl font-bold text-on-surface mb-2">Nearby Swaps</h1>
      <p className="text-on-surface-variant mb-6">
        Real map of swap listings using free OpenStreetMap data — no API key or payment involved.
      </p>

      {loading ? (
        <div className="glass-card rounded-2xl p-16 text-center text-outline">
          <span className="material-symbols-outlined text-4xl mb-2 block animate-pulse">travel_explore</span>
          Locating listings on the map...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl overflow-hidden shadow-md" style={{ height: "520px" }}>
            <MapContainer center={[defaultCenter.lat, defaultCenter.lng]} zoom={11} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <RecenterMap center={myCoords ? [myCoords.lat, myCoords.lng] : null} />

              {myCoords && (
                <Marker position={[myCoords.lat, myCoords.lng]} icon={meIcon}>
                  <Popup>You are here</Popup>
                </Marker>
              )}

              {items.map((item) => (
                <Marker key={item._id} position={[item.coords.lat, item.coords.lng]} eventHandlers={{ click: () => setSelected(item) }}>
                  <Popup>
                    <strong>{item.title}</strong><br />
                    {item.location} · ₹{item.estimatedValue}<br />
                    <Link to={`/item/${item._id}`} className="text-primary font-bold">View item →</Link>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="glass-card rounded-3xl p-5 overflow-y-auto" style={{ maxHeight: "520px" }}>
            <h2 className="font-bold text-primary mb-3">
              Listings on Map ({items.length})
            </h2>
            <div className="space-y-3">
              {items.length === 0 ? (
                <p className="text-sm text-outline">No mappable listings found yet.</p>
              ) : items.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelected(item)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${selected?._id === item._id ? "bg-secondary-container" : "hover:bg-surface-container-low"}`}
                >
                  <img src={item.images?.[0] || "https://placehold.co/60x60?text=No+Image"} alt={item.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{item.title}</p>
                    <p className="text-xs text-on-surface-variant">{item.location}</p>
                  </div>
                  <span className="text-xs font-bold text-primary shrink-0">₹{item.estimatedValue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
