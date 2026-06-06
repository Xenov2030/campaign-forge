import { GoogleGenerativeAI } from "@google/generative-ai";

export const AI_ENABLED = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10);

let _genAI: GoogleGenerativeAI | null = null;

export function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
  }
  return _genAI;
}

export default getGenAI;
