import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCoState } from "jazz-react";
import { VoiceMessage } from "../schema";
import { ID } from "jazz-tools";
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

const VoiceMessagePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const message = useCoState(VoiceMessage, id as ID<VoiceMessage>, { resolve: { audio: true } });

  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudio = async () => {
      if (!message?.audio) {
        setError("Audio not found.");
        setLoading(false);
        return;
      }

      try {
        const blob = await message.audio.toBlob();
        if (blob) {
          setAudioURL(URL.createObjectURL(blob));
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

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Voice Message</CardTitle>
        <CardDescription>
          from {message?.creator?.firstName || "Anonymous"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {loading && (
          <div className="w-full flex flex-col items-center gap-2">
            <Skeleton className="w-full h-12" />
            <div className="text-muted-foreground text-xs">Loading voice message...</div>
          </div>
        )}
        {error && (
          <Alert variant="destructive" className="w-full">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!loading && !error && audioURL && (
          <audio src={audioURL} controls className="w-full" />
        )}
        {!loading && !error && !audioURL && (
          <div className="text-muted-foreground">No audio available.</div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 items-stretch">
        <Button
          variant="outline"
          onClick={async () => {
            if (!message) return;
            const inviteLink = createInviteLink(message, "reader");
            await navigator.clipboard.writeText(inviteLink);
            alert("Invite link copied to clipboard!");
          }}
        >
          Share Invite Link
        </Button>
        <VoiceRecorder isResponse={true} chatID={id as ID<VoiceMessage>} />
      </CardFooter>
    </Card>
  );
};

export default VoiceMessagePlayer; 