import { OpenAIApi, Configuration } from "openai-edge";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const runtime = "edge";
const config = {
  apiKey: process.env.OPENAI_API_KEY,
};

const openai = createOpenAI(config);

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const result = streamText({
      model: openai("gpt-3.5-turbo"),
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {}
}
