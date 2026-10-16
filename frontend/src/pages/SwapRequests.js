import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

export default function SwapRequests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  const fetchAll = async () => {
    const [inc, out] = await Promise.all([API.get("/swap/incoming"), API.get("/swap/outgoing")]);
    setIncoming(inc.data);
    setOutgoing(out.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const updateStatus = async (id, status) => {
    await API.put(`/swap/${id}`, { status });
    fetchAll();
  };

  const badgeClass = {
    pending: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    accepted: "bg-secondary-container text-on-secondary-container",
    rejected: "bg-error-container text-error",
    completed: "bg-primary text-white",
  };

  const Table = ({ title, rows, isIncoming }) => (
    <section className="glass-card rounded-2xl overflow-hidden mb-6">
      <div className="p-4 border-b border-outline-variant/20">
        <h2 className="font-bold text-on-surface">{title}</h2>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
          <tr>
            <th className="text-left p-4">{isIncoming ? "They Offer" : "You Offered"}</th>
            <th className="text-left p-4">{isIncoming ? "Your Item" : "Requested Item"}</th>
            <th className="text-left p-4">{isIncoming ? "From" : "To"}</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan="5" className="text-center p-8 text-outline">No requests</td></tr>
          ) : rows.map((r) => (
            <tr key={r._id} className="border-t border-outline-variant/20">
              <td className="p-4">{r.itemOffered?.title}</td>
              <td className="p-4">{r.itemRequested?.title}</td>
              <td className="p-4 text-on-surface-variant">{isIncoming ? r.requester?.name : r.receiver?.name}</td>
              <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeClass[r.status]}`}>{r.status}</span></td>
              <td className="p-4">
                <div className="flex gap-2 flex-wrap">
                  <Link to={`/chat/${r._id}`} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary-container text-on-secondary-container hover:opacity-80 transition-opacity">Chat</Link>
                  {isIncoming && r.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(r._id, "accepted")} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:opacity-90 transition-opacity">Accept</button>
                      <button onClick={() => updateStatus(r._id, "rejected")} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-error-container text-error hover:opacity-80 transition-opacity">Reject</button>
                    </>
                  )}
                  {r.status === "accepted" && (
                    <button onClick={() => updateStatus(r._id, "completed")} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-tertiary-container text-white hover:opacity-90 transition-opacity">Mark Completed</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );

  return (
    <main className="pt-8 pb-16 px-4 md:px-12 max-w-[1280px] mx-auto">
      <h1 className="text-3xl font-bold text-on-surface mb-6">Swap Requests</h1>
      <Table title="Incoming Requests" rows={incoming} isIncoming />
      <Table title="Outgoing Requests" rows={outgoing} isIncoming={false} />
    </main>
  );
}
