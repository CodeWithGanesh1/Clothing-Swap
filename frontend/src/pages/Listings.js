import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

export default function Listings() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ type: "", location: "", search: "" });
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    const { data } = await API.get("/clothing", { params });
    setItems(data);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const clearAll = () => {
    setFilters({ type: "", location: "", search: "" });
    setTimeout(fetchItems, 0);
  };

  return (
    <main className="pt-8 pb-20 px-4 md:px-12 max-w-[1280px] mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="glass-card rounded-2xl p-5 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-primary">Filters</h2>
              <button onClick={clearAll} className="text-xs text-outline hover:text-primary underline bg-transparent border-none cursor-pointer">
                Clear all
              </button>
            </div>

            <div className="mb-5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Category / Type</label>
              <input
                placeholder="Shirt, Jeans, Jacket..."
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              />
            </div>

            <div className="mb-5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Location</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">location_on</span>
                <input
                  placeholder="Enter city..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                />
              </div>
            </div>

            <button
              onClick={fetchItems}
              className="w-full py-3 bg-gradient-to-b from-primary-container to-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
            >
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Main content */}
        <section className="flex-grow">
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                placeholder="Search for brands, materials, or styles..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && fetchItems()}
                className="w-full pl-12 pr-4 py-3.5 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary shadow-sm text-sm outline-none"
              />
            </div>
            <span className="text-xs text-on-surface-variant whitespace-nowrap">
              {loading ? "Loading..." : `Showing ${items.length} item${items.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col gap-3">
                  <div className="w-full aspect-[3/4] rounded-2xl bg-surface-container-high"></div>
                  <div className="h-4 w-1/2 bg-surface-container-high rounded"></div>
                  <div className="h-4 w-1/3 bg-surface-container-high rounded"></div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="glass-card rounded-3xl text-center py-20 text-outline">
              <span className="material-symbols-outlined text-5xl mb-2 block">search_off</span>
              <h3 className="font-bold text-on-surface">No listings found</h3>
              <p className="text-sm">Try clearing filters, or be the first to list an item.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <Link to={`/item/${item._id}`} key={item._id} className="group cursor-pointer flex flex-col gap-3">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-container-high shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                    <img
                      src={item.images?.[0] || "https://placehold.co/300x400?text=No+Image"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="glass-card px-3 py-1 rounded-full text-[11px] font-bold text-primary border border-white/40">
                        {item.condition}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="px-6 py-3 bg-white text-primary rounded-xl font-bold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        View Details
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">{item.brand} · {item.size}</p>
                    <h3 className="font-bold text-on-surface text-sm leading-tight">{item.title}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-outline flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>{item.location}
                      </span>
                      <span className="text-xs font-bold text-primary">₹{item.estimatedValue}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
