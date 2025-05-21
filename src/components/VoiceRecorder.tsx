import React, { useState, useRef } from "react";
import { ID, FileStream, Group } from "jazz-tools";
import { VoiceMessage } from "../schema";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { useAccount, createInviteLink } from "jazz-react";
import RightArrow from "./icons/popicons/RightArrow";
import Copy from "./icons/popicons/Copy";

type VoiceRecorderProps = {
  isResponse?: boolean;
  chatID?: ID<VoiceMessage>;
  onUploaded?: (messageId: string) => void;
};

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isResponse = false,
}) => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const navigate = useNavigate();
  const { me } = useAccount({ resolve: { profile: true } });

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
    setInviteLink(null);
  };

  const uploadVoiceMessage = async () => {
    if (!audioURL) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    setInviteLink(null);
    if (!me?.profile) {
      setError("You must be logged in to create a voice message.");
      setUploading(false);
      return;
    }
    if (!me.profile.messages) {
      setError("Your profile is missing a messages list.");
      setUploading(false);
      return;
    }
    try {
      // Create a private group for this message (no 'everyone' access)
      const privateGroup = Group.create();

      const response = await fetch(audioURL);
      const blob = await response.blob();
      // FileStream owned by the private group
      const fileStream = await FileStream.createFromBlob(blob, {
        owner: privateGroup,
        onProgress: (p: number) => setProgress(Math.round(p * 100)),
      });
      await fileStream.waitForSync();
      // VoiceMessage owned by the private group
      const message = VoiceMessage.create(
        {
          audio: fileStream,
          createdAt: new Date(),
          creator: me.profile,
        },
        { owner: privateGroup }
      );
      me.profile.messages.push(message);
      navigate(`/message/${message.id}`);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="w-full">
      {!recording && !audioURL && (
        <Button size="lg" onClick={startRecording} className="w-full">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.00867 6.20655C8.55973 6.20655 8.19579 6.57113 8.19579 7.02085C8.19579 7.47058 8.55973 7.83515 9.00867 7.83515H10.9913C11.4403 7.83515 11.8042 7.47058 11.8042 7.02085C11.8042 6.57113 11.4403 6.20655 10.9913 6.20655H9.00867Z"
              fill="currentColor"
            ></path>
            <path
              d="M8.51301 8.68918C8.06407 8.68918 7.70012 9.05375 7.70012 9.50348C7.70012 9.9532 8.06407 10.3178 8.51301 10.3178H11.487C11.9359 10.3178 12.2999 9.9532 12.2999 9.50348C12.2999 9.05375 11.9359 8.68918 11.487 8.68918H8.51301Z"
              fill="currentColor"
            ></path>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10 0C8.03698 0 6.53097 0.693023 5.55232 2.06999C4.60918 3.397 4.23048 5.25769 4.23048 7.45896C4.23048 9.66323 4.61052 11.6184 5.5343 13.0453C6.49026 14.522 7.98779 15.3658 10 15.3658C12.0122 15.3658 13.5097 14.522 14.4657 13.0453C15.3895 11.6184 15.7695 9.66323 15.7695 7.45896C15.7695 5.25769 15.3908 3.397 14.4477 2.06999C13.469 0.693023 11.963 0 10 0ZM6.78717 2.91961C7.43517 2.00787 8.43728 1.48256 10 1.48256C11.5627 1.48256 12.5648 2.00787 13.2128 2.91961C13.8963 3.88123 14.2627 5.37938 14.2627 7.45896C14.2627 9.53556 13.8976 11.1632 13.1948 12.2488C12.5242 13.2847 11.5136 13.8832 10 13.8832C8.48637 13.8832 7.47583 13.2847 6.80519 12.2488C6.10238 11.1632 5.7373 9.53556 5.7373 7.45896C5.7373 5.37938 6.10372 3.88123 6.78717 2.91961Z"
              fill="currentColor"
            ></path>
            <path
              d="M2.74916 7.94439C2.33277 7.94439 2 8.29579 2 8.72322C2 10.2183 2.28251 12.507 3.42412 14.4492C4.49885 16.2777 6.31034 17.7488 9.18711 17.9817V19.1857C9.18711 19.6354 9.55105 20 10 20C10.4489 20 10.8129 19.6354 10.8129 19.1857V17.9841C13.666 17.7702 15.4835 16.4233 16.5699 14.6366C17.7216 12.7425 18 10.4424 18 8.72322C18 8.29579 17.6672 7.94439 17.2508 7.94439C16.8344 7.94439 16.5017 8.29579 16.5017 8.72322C16.5017 10.3142 16.2363 12.27 15.3034 13.8043C14.4055 15.281 12.8382 16.4562 10 16.4562C7.18926 16.4562 5.61408 15.1877 4.70263 13.637C3.75962 12.0326 3.49832 10.0654 3.49832 8.72322C3.49832 8.29579 3.16555 7.94439 2.74916 7.94439Z"
              fill="currentColor"
            ></path>
          </svg>
          {isResponse ? "Record a Response" : "Record"}
        </Button>
      )}
      {recording && (
        <Button
          size="lg"
          onClick={stopRecording}
          variant="destructive"
          className="w-full"
        >
          Stop
        </Button>
      )}
      {audioURL && !recording && (
        <div className="flex flex-col gap-3 items-center">
          <audio src={audioURL} controls className="w-full" />
          {!messageId ? (
            <div className="flex gap-2 w-full">
              <Button
                onClick={resetRecording}
                disabled={uploading}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={uploadVoiceMessage}
                disabled={uploading}
                className="flex-1"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M17.174 3.21582C17.0471 3.05402 16.8987 2.91008 16.7328 2.78793C16.3658 2.5177 15.7956 2.40792 14.6345 2.62518C13.4793 2.84133 11.949 3.33697 9.81197 4.03142L8.64277 4.41136C6.63988 5.06222 5.19647 5.53232 4.18845 5.97951C3.14977 6.4403 2.78905 6.78975 2.67073 7.07402C2.50187 7.47974 2.47484 7.92995 2.59398 8.3527C2.67745 8.64891 2.99382 9.03843 3.97003 9.61845C4.83577 10.1328 6.06022 10.7091 7.72301 11.478L10.4809 8.73969C10.7779 8.44484 11.2594 8.44484 11.5563 8.73969C11.8533 9.03454 11.8533 9.51259 11.5563 9.80745L8.79841 12.5457C9.52347 14.0914 10.0682 15.2331 10.5497 16.0481C11.0974 16.9752 11.4601 17.2891 11.7247 17.3806C12.2378 17.5582 12.802 17.5182 13.2845 17.2701C13.5334 17.1421 13.8474 16.7804 14.257 15.7854C14.6533 14.8228 15.0688 13.4577 15.6433 11.5661L16.0841 10.1146C16.7332 7.97713 17.1964 6.44653 17.387 5.29483C17.5785 4.13719 17.4546 3.57378 17.174 3.21582ZM7.31212 12.9537C8.08156 14.5959 8.68978 15.8845 9.23787 16.8121C9.79565 17.7562 10.3957 18.5199 11.2242 18.8065C12.1321 19.1207 13.1302 19.05 13.9839 18.611C14.763 18.2104 15.2477 17.3699 15.6648 16.3568C16.0919 15.3193 16.5276 13.8846 17.0863 12.0449L17.5577 10.4929C18.1855 8.42558 18.6791 6.80044 18.8877 5.53964C19.0973 4.27308 19.0595 3.16234 18.374 2.28817C18.1625 2.01851 17.9152 1.7786 17.6387 1.57503C16.7424 0.915109 15.6232 0.903568 14.3528 1.14128C13.0882 1.3779 11.4634 1.9059 9.39655 2.57756L8.12265 2.99153C6.1767 3.62387 4.65726 4.11762 3.56804 4.60084C2.50073 5.07433 1.62801 5.62553 1.26517 6.4973C0.96641 7.21511 0.918598 8.01163 1.12938 8.75958C1.38537 9.66798 2.18597 10.3182 3.18908 10.9142C4.17446 11.4997 5.55445 12.1418 7.31212 12.9537Z"
                    fill="currentColor"
                  ></path>
                </svg>
                {uploading ? "Uploading..." : "Share"}
              </Button>
            </div>
          ) : null}
          {uploading && (
            <div className="w-full mt-2">
              <Progress value={progress} />
              <div className="text-xs text-muted-foreground mt-1 text-center">
                Uploading: {progress}%
              </div>
            </div>
          )}
        </div>
      )}
      {messageId && (
        <div className="flex flex-col gap-2 items-center mt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/message/${messageId}`)}
            >
              View Message
              <RightArrow className="w-4 h-4" />
            </Button>

            <Button
              variant="default"
              onClick={async () => {
                if (inviteLink) {
                  await navigator.clipboard.writeText(inviteLink);
                  alert("Invite link copied to clipboard!");
                } else {
                  alert("No invite link available.");
                }
              }}
            >
              <Copy className="w-4 h-4" />
              Copy Invite Link
            </Button>
          </div>
        </div>
      )}
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </section>
  );
};

export default VoiceRecorder;
