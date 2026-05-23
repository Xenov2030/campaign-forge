import OpenAI from "openai";

export const AI_ENABLED = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10);

let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });
  }
  return _openai;
}

export default getOpenAI;
