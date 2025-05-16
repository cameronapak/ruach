import React, { useState, useRef } from "react";
import { ID, FileStream, Group } from "jazz-tools";
import { VoiceMessage } from "../schema";

const VoiceRecorder: React.FC<{ chatID?: ID<VoiceMessage> }> = (props) => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioChunks = useRef<Blob[]>([]);

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
      }, { owner: publicGroup });
      setMessageId(message.id);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {!recording && !audioURL && (
        <button onClick={startRecording}>Record</button>
      )}
      {recording && (
        <button onClick={stopRecording}>Stop</button>
      )}
      {audioURL && !recording && (
        <>
          <audio src={audioURL} controls />
          <button onClick={resetRecording} disabled={uploading}>Re-record</button>
          <button onClick={uploadVoiceMessage} disabled={uploading}>
            {uploading ? "Uploading..." : "Save & Share"}
          </button>
          {uploading && <div>Uploading: {progress}%</div>}
        </>
      )}
      {messageId && (
        <div>
          <p>Voice message uploaded!</p>
          <p>Message ID: <code>{messageId}</code></p>
          <p>
            Shareable link: <a href={`/message/${messageId}`}>{window.location.origin}/message/{messageId}</a>
          </p>
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default VoiceRecorder; 