import React, { useState, useRef } from "react";
import { ID, FileStream, Group } from "jazz-tools";
import { VoiceMessage } from "../schema";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { useAccount } from "jazz-react";

const VoiceRecorder: React.FC<{ chatID?: ID<VoiceMessage> }> = (props) => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const navigate = useNavigate();
  const { me } = useAccount({ resolve: { profile: true, root: true } });

  const startRecording = async () => {
    setError(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);
    audioChunks.current = [];

    recorder.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      setAudioURL(URL.createObjectURL(audioBlob));
    };

    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  const resetRecording = () => {
    setAudioURL(null);
    setMediaRecorder(null);
    audioChunks.current = [];
    setMessageId(null);
    setProgress(0);
    setError(null);
  };

  const uploadVoiceMessage = async () => {
    if (!audioURL) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      // Create a public group for this message
      const publicGroup = Group.create();
      publicGroup.addMember("everyone", "reader");

      const response = await fetch(audioURL);
      const blob = await response.blob();
      // FileStream owned by the public group
      const fileStream = await FileStream.createFromBlob(blob, {
        owner: publicGroup,
        onProgress: (p: number) => setProgress(Math.round(p * 100)),
      });
      await fileStream.waitForSync();
      // VoiceMessage owned by the public group
      const message = VoiceMessage.create({
        audio: fileStream,
        createdAt: new Date(),
        creator: me?.profile,
      }, { owner: publicGroup });
      navigate(`/message/${message.id}`);
      setMessageId(message.id);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto">
      <CardHeader>
        <CardTitle>Voice Recorder</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!recording && !audioURL && (
          <Button onClick={startRecording} className="w-full">Record</Button>
        )}
        {recording && (
          <Button onClick={stopRecording} variant="destructive" className="w-full">Stop</Button>
        )}
        {audioURL && !recording && (
          <div className="flex flex-col gap-3 items-center">
            <audio src={audioURL} controls className="w-full" />
            <div className="flex gap-2 w-full">
              <Button onClick={resetRecording} disabled={uploading} variant="secondary" className="flex-1">Re-record</Button>
              <Button onClick={uploadVoiceMessage} disabled={uploading} className="flex-1">
                {uploading ? "Uploading..." : "Save & Share"}
              </Button>
            </div>
            {uploading && (
              <div className="w-full mt-2">
                <Progress value={progress} />
                <div className="text-xs text-muted-foreground mt-1 text-center">Uploading: {progress}%</div>
              </div>
            )}
          </div>
        )}
        {messageId && (
          <div className="flex flex-col gap-2 items-center mt-2">
            <Badge variant="secondary">Voice message uploaded!</Badge>
            <div className="text-xs">Message ID: <Badge variant="outline">{messageId}</Badge></div>
            <div className="text-xs break-all">
              Shareable link: <a href={`/message/${messageId}`} className="underline text-primary">{window.location.origin}/message/{messageId}</a>
            </div>
          </div>
        )}
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter />
    </Card>
  );
};

export default VoiceRecorder; 