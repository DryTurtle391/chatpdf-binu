// import { OpenAIApi, Configuration } from "openai-edge";
import { Message, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getContext } from "@/lib/context";

/* export const runtime = "edge";
 */
const config = {
  apiKey: process.env.OPENAI_API_KEY,
};

const openai = createOpenAI(config);

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    const _chats = await db.select().from(chats).where(eq(chatId, chats.id));

    if (!_chats) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }
    const lastMessage = messages[messages.length - 1];

    const context = await getContext(lastMessage.content, _chats[0].fileKey);
    console.log(lastMessage.content, _chats[0].fileKey);
    const prompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
    };

    console.log("PROMPT: ", prompt);

    const result = await streamText({
      model: openai("gpt-3.5-turbo"),
      messages: [
        prompt,
        ...messages.filter((message: Message) => message.role === "user"),
      ],
      onFinish: async (completion) => {
        if (userChat) {
          await db.insert(_messages).values({
            chatId,
            content: completion.text,
            role: "system",
          });

          console.log("FINISHED: ", completion);
        }
      },
    });

    const userChat = await db.insert(_messages).values({
      chatId,
      content: lastMessage.content,
      role: "user",
    });
    console.log("STARTED!");

    return result.toDataStreamResponse();
  } catch (error) {
    console.log("ERROR IN RESPONSE GENERATION: ", error);
    throw error;
  }
}
