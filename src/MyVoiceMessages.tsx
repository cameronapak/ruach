import { useAccount } from "jazz-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";

export default function MyVoiceMessages() {
  const { me } = useAccount({ resolve: { profile: { messages: true } } });
  const messages = (me?.profile?.messages || []).filter(Boolean);

  return (
    <Card className="max-w-md w-full mx-auto mt-8">
      <CardHeader>
        <CardTitle>My Voice Messages</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
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
      </CardContent>
    </Card>
  );
} 