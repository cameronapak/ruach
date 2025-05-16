import { useAccount } from "jazz-react";
import { Link } from "react-router-dom";

export default function MyVoiceMessages() {
  const { me } = useAccount({ resolve: { profile: { messages: true } } });
  const messages = (me?.profile?.messages || []).filter(Boolean);

  return (
    <section className="max-w-md w-full mx-auto">
        {messages.length === 0 && <div>You haven't created any voice messages yet.</div>}
        {messages.map((msg) => {
          if (!msg) return null;
          return (
            <Link
              key={msg.id}
              to={`/message/${msg.id}`}
              className="block p-2 border rounded hover:bg-accent transition"
            >
              <div className="font-medium">Voice Message</div>
              <div className="text-xs text-muted-foreground">
                {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "No date"}
              </div>
            </Link>
          );
        })}
    </section>
  );
} 