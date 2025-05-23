import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCoState, useAccount } from "jazz-react";
import { VoiceMessage } from "../schema";
import { ID } from "jazz-tools";
import { AnimatePresence, motion } from "motion/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "./ui/card";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import VoiceRecorder from "./VoiceRecorder";
import { Button } from "./ui/button";
import { createInviteLink } from "jazz-react";
import Copy from "./icons/popicons/Copy";
import Edit from "./icons/popicons/Edit";
import { Input } from "./ui/input";

async function getTranscription(audioBlob: Blob) {
  const url =
    "https://cameronpak--787d50ae362e11f0b3249e149126039e.web.val.run";
  const endpoint = `${url}/ai/transcribe`;

  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  const result = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  // Try to extract text from result
  const data = await result.json();
  return data.response;
}

const VoiceMessagePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const message = useCoState(VoiceMessage, id as ID<VoiceMessage>, {
    resolve: { audio: true },
  });
  const { me } = useAccount({ resolve: { profile: true } });
  const isLoadingUser = Boolean(!me || !me?.profile);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(message?.title || "");

  async function transcribeAudio() {
    if (!message?.audio) {
      setError("Audio not found.");
      setLoading(false);
      return;
    }

    const blob = await message.audio.toBlob();
    if (!blob) {
      setError("Failed to load audio.");
      setLoading(false);
      return;
    }

    const transcription = await getTranscription(blob);
    if (transcription.trim()) {
      message.transcription = transcription.trim();
    }
  }

  useEffect(() => {
    const fetchAudio = async () => {
      if (!message?.audio) {
        setError("Audio not found.");
        setLoading(false);
        return;
      }

      try {
        const blob = await message.audio.toBlob();
        if (!blob) {
          setError("Failed to load audio.");
          setLoading(false);
          return;
        }

        if (blob) {
          const file = new File([blob], "audio.webm", {
            type: blob.type || "audio/webm",
          });
          setAudioURL(URL.createObjectURL(file));
        } else {
          setError("Failed to load audio.");
        }
      } catch (err) {
        setError("Error loading audio.");
      } finally {
        setLoading(false);
      }
    };
    if (message) fetchAudio();
  }, [message]);

  React.useEffect(() => {
    if (message && !message.transcription) {
      transcribeAudio();
    }
  }, [message]);

  const handleTitleSave = () => {
    if (message && title.trim()) {
      message.title = title.trim();
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (message?.title) {
      setTitle(message.title);
    }
  }, [message?.title]);

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2 w-full">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1"
                placeholder="Untitled..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleTitleSave();
                  }
                }}
              />
              <Button variant="ghost" size="sm" onClick={handleTitleSave}>
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTitle(message?.title || "");
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              {title ? (
                title
              ) : (
                <span className="text-muted-foreground">Untitled...</span>
              )}
              {me?.profile?.id === message?.creator?.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-5 h-5 text-muted-foreground" />
                </Button>
              )}
            </>
          )}
        </CardTitle>
        <CardDescription>
          from {message?.creator?.firstName || "..."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {loading && (
          <div className="w-full flex flex-col items-center gap-2">
            <Skeleton className="w-full h-12" />
            <div className="text-muted-foreground text-xs">
              Loading voice message...
            </div>
          </div>
        )}
        {error && (
          <Alert variant="destructive" className="w-full">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!loading && !error && audioURL && (
          <>
            <audio src={audioURL} controls className="w-full h-[54px]" />
            {error && (
              <Alert variant="destructive" className="w-full mt-2">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message?.transcription && (
              <AnimatePresence>
                <motion.div
                  className="w-full mt-2 p-4 border rounded-sm bg-secondary overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <h3 className="text-sm text-muted-foreground">
                    Transcription
                  </h3>
                  <div className="paragraph m-0">{message.transcription}</div>
                </motion.div>
              </AnimatePresence>
            )}
          </>
        )}
        {!loading && !error && !audioURL && (
          <div className="text-muted-foreground">No audio available.</div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 items-stretch">
        {!isLoadingUser ? (
          <AnimatePresence>
            <motion.div
              className="w-full flex flex-col items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {me?.profile?.id === message?.creator?.id ? (
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!message) return;
                    const inviteLink = createInviteLink(message, "reader");
                    await navigator.clipboard.writeText(inviteLink);
                    alert("Invite link copied to clipboard!");
                  }}
                >
                  <Copy className="w-4 h-4" />
                  Share Invite Link
                </Button>
              ) : (
                <VoiceRecorder
                  isResponse={true}
                  chatID={id as ID<VoiceMessage>}
                />
              )}
            </motion.div>
          </AnimatePresence>
        ) : null}
      </CardFooter>
    </Card>
  );
};

export default VoiceMessagePlayer;
