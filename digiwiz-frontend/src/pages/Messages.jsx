import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get("/messages");
      setMessages(res.data.messages);
    } catch {}
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await api.post("/messages", { content: text.trim() });
      setText("");
      fetchMessages();
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="page messages-page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Messages</h1>
          <p className="page__subtitle">Employee broadcast messages</p>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="messages-empty">No messages yet. Say hello!</div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender?._id === user?._id || m.sender === user?._id;
              return (
                <div key={m._id} className={`message-bubble ${isMe ? "message-bubble--me" : ""}`}>
                  {!isMe && <span className="message-sender">{m.sender?.name}</span>}
                  <p className="message-text">{m.content}</p>
                  <span className="message-time">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="messages-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
          />
          <button className="btn btn--primary" onClick={handleSend} disabled={sending || !text.trim()}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
