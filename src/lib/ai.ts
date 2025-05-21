import { experimental_transcribe as transcribe } from 'ai';
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

const groq = createGroq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
});

const transcriptionModel = groq.transcription("distil-whisper-large-v3-en");
const generationModel = groq("llama-3.1-8b-instant");

async function generateAiResponse(prompt: string) {
  const result = await generateText({
    model: generationModel,
    providerOptions: {
      groq: { reasoningFormat: "parsed" },
    },
    prompt: prompt,
  });

  return result;
}

async function generateAiResponseFromAudio(audio: File) {
  const arrayBuffer = await audio.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const result = await transcribe({
    model: transcriptionModel,
    audio: uint8Array,
    providerOptions: { groq: { language: "en" } },
  });
  return result;
}

export { generateAiResponse, generateAiResponseFromAudio };
