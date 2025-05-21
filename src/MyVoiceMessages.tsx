import { useAccount } from "jazz-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import { JazzAccount } from "./schema";
import { Button } from "./components/ui/button";
import Delete from "./components/icons/popicons/Delete";

async function deleteMessage(messageId: string) {
  const { profile } = await JazzAccount.getMe().ensureLoaded({
    resolve: {
      profile: {
        messages: true,
      },
    },
  });

  const index = profile.messages.findIndex((p) => p?.id === messageId);
  if (index > -1) {
    profile.messages.splice(index, 1);
  }
}

export default function MyVoiceMessages() {
  const { me } = useAccount({
    resolve: {
      profile: {
        messages: true,
      },
    },
  });
  const isLoading = Boolean(!me || !me?.profile);
  const messages = (me?.profile?.messages || []).filter(Boolean);
  // sort messages by createdAt
  messages.sort((a, b) => {
    if (!a || !b) return 0;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <section className="w-full mx-auto">
      {!isLoading && messages.length === 0 ? (
        <p className="text-center text-muted-foreground">
          Record your first voice message 👆
        </p>
      ) : (
        <AnimatePresence>
          <motion.div
            className="w-full flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Table>
              {/* <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader> */}
              <TableBody>
                {messages.map((msg) => {
                  if (!msg) return null;
                  return (
                    <TableRow className="group" key={msg.id}>
                      <TableCell className="whitespace-normal align-top">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs text-muted-foreground">
                            {msg.createdAt
                              ? formatDistanceToNow(new Date(msg.createdAt), {
                                  addSuffix: true,
                                })
                              : "No date"}
                          </p>
                          <Link
                            to={`/message/${msg.id}`}
                            className="font-medium hover:underline"
                          >
                            {msg.title || "Untitled"}
                          </Link>
                          {msg.transcription && (
                            <p className="text-sm text-muted-foreground break-words line-clamp-4">
                              {msg.transcription}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          variant="outline"
                          size="icon"
                          onClick={async () =>
                            confirm(
                              "Are you sure you want to delete this message?"
                            ) && (await deleteMessage(msg.id))
                          }
                        >
                          <Delete className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}
