import { NextRequest } from "next/server";
import { Message, StreamingTextResponse } from "ai";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { tools } from "@/lib/agents/tools";

const sysPrompt = `You are an AI assistant specialized in Stacks blockchain and its DeFi ecosystem. Help users interact with Stacks blockchain protocols like Velar, AlexGo, sBTC, and more.

Your main capabilities include:
1. Getting wallet information (address, balances, tokens, transactions)
2. Retrieving information about Velar protocol (tokens, pools)
3. Retrieving information about AlexGo protocol (fee rates, available tokens, token prices)
4. Managing sBTC incentives (checking enrollment, rewards, cycles)

When explaining DeFi concepts, be clear and concise. Always prioritize security and explain any risks associated with actions.

When showing balances or information, format it in a readable way, focusing on the most important data first.`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  
  // Get only the most recent user message
  const lastUserMessage = messages[messages.length - 1];
  
  // AI chat completion with tool calling
  const result = await streamText({
    model: openai("gpt-4o"),
    system: sysPrompt,
    messages: messages as Message[],
    tools,
    maxSteps: 5, // Allow the model to make up to 5 tool calls in a single interaction
  });
  
  // Return the response as a streaming text response
  return new StreamingTextResponse(result.textStream);
} 