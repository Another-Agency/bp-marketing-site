// app/api/chat/route.ts

import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";

// Optional, but recommended: run on the edge runtime.
// See https://vercel.com/docs/concepts/functions/edge-functions
export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    // Extract the `messages` from the body of the request
    const { messages } = await req.json();
    console.log("Chat API Route", messages);

    // Request the OpenAI API for the response based on the prompt
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: messages,
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);

    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Error in POST function:", error);
    if (error instanceof OpenAI.APIError && error.status === 405) {
      return new Response("Method not allowed", { status: 405 });
    }
    throw error;
  }
}
