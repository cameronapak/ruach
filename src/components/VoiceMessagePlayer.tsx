import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCoState } from "jazz-react";
import { VoiceMessage } from "../schema";
import { ID } from "jazz-tools";

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

  if (loading) return <div>Loading voice message...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!audioURL) return <div>No audio available.</div>;

  return (
    <div>
      <h2>Voice Message</h2>
      <audio src={audioURL} controls autoPlay />
    </div>
  );
};

export default VoiceMessagePlayer; 