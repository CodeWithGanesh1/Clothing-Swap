import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Chat() {
  const { swapId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [disputeMsg, setDisputeMsg] = useState("");
  const boxRef = useRef(null);

  const fetchMessages = async () => {
    const { data } = await API.get(`/chat/${swapId}`);
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [swapId]);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await API.post(`/chat/${swapId}`, { text });
    setText("");
    fetchMessages();
  };

  const raiseDispute = async () => {
    const reason = window.prompt("Briefly describe the issue with this swap:");
    if (!reason) return;
    await API.put(`/swap/${swapId}/dispute`, { reason });
    setDisputeMsg("Issue reported. An admin will review this swap.");
  };

  return (
    <main className="pt-8 pb-16 px-4 md:px-12 max-w-2xl mx-auto">
      <div className="glass-card rounded-3xl overflow-hidden flex flex-col" style={{ height: "70vh" }}>
        <div className="h-16 border-b border-outline-variant/20 flex items-center justify-between px-5 shrink-0">
          <div>
            <h3 className="font-bold text-on-surface leading-tight">Negotiation Chat</h3>
            <span className="text-xs text-primary flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
          <button
            onClick={raiseDispute}
            className="flex items-center gap-1 text-xs font-semibold text-error bg-error-container px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">flag</span>
            Report Issue
          </button>
        </div>

        {disputeMsg && <p className="text-center text-xs text-error py-1 bg-error-container/30">{disputeMsg}</p>}

        <div ref={boxRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 bg-white">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-outline mt-8">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((m) => {
              const mine = m.sender._id === user.id;
              return (
                <div key={m._id} className={`flex flex-col gap-1 max-w-[75%] ${mine ? "items-end ml-auto" : "items-start"}`}>
                  <span className="text-[10px] text-outline px-1">{m.sender.name}</span>
                  <div
                    className={
                      mine
                        ? "px-4 py-2.5 rounded-2xl rounded-br-md bg-primary text-white text-sm shadow-md"
                        : "px-4 py-2.5 rounded-2xl rounded-bl-md bg-secondary-container text-on-secondary-container text-sm shadow-sm"
                    }
                  >
                    {m.text}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-outline-variant/20 flex gap-3 shrink-0 bg-white">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-secondary-container/30 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
          />
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity">
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
