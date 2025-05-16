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
} from "./ui/card";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import VoiceRecorder from "./VoiceRecorder";
import { Button } from "./ui/button";

const VoiceMessagePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const message = useCoState(VoiceMessage, id as ID<VoiceMessage>, { resolve: { audio: true } });
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRecorder, setShowRecorder] = useState(false);

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
    <Card className="max-w-md w-full mx-auto mt-8">
      <CardHeader>
        <CardTitle>Voice Message</CardTitle>
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
        {!showRecorder && !loading && !error && (
          <Button
            className="mt-4"
            onClick={() => setShowRecorder(true)}
          >
            Record a Response
          </Button>
        )}
        {showRecorder && (
          <div className="w-full flex flex-col gap-4 mt-4">
            <VoiceRecorder />
            <Button
              variant="secondary"
              onClick={() => setShowRecorder(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter />
    </Card>
  );
};

export default VoiceMessagePlayer; 