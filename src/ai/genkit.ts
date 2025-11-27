import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

const MODEL_NAME = "googleai/gemini-2.5-flash";

export const ai = genkit({
  plugins: [googleAI()],
  model: MODEL_NAME,
});
