import { useAccount } from "jazz-react";
import { Link } from "react-router-dom";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./components/ui/table";
import { formatDistanceToNow } from "date-fns";
export default function MyVoiceMessages() {
  const { me } = useAccount({ resolve: { profile: { messages: true } } });
  const messages = (me?.profile?.messages || []).filter(Boolean);

  return (
    <section className="w-full mx-auto">
      {messages.length === 0 ? (
        <div>You haven't created any voice messages yet.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((msg) => {
              if (!msg) return null;
              return (
                <TableRow key={msg.id}>
                  <TableCell>
                    <Link
                      to={`/message/${msg.id}`}
                      className="font-medium hover:underline"
                    >
                      Voice Message
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : "No date"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </section>
  );
} 