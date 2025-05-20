import { NextRequest } from "next/server";
import { Message, streamText, UIMessage } from "ai";
import { model, type modelID } from "@/ai/providers";
import { tools } from "@/lib/agents/tools";

const sysPrompt = `You are an AI assistant specialized in Stacks blockchain and its DeFi ecosystem. Help users interact with Stacks blockchain protocols like Velar, AlexGo, sBTC, and more.

Your main capabilities include:
1. Getting wallet information (address, balances, tokens, transactions)
2. Retrieving information about Velar protocol (tokens, pools)
3. Retrieving information about AlexGo protocol (fee rates, available tokens, token prices)
4. Managing sBTC incentives (checking enrollment, rewards, cycles)

When explaining DeFi concepts, be clear and concise. Always prioritize security and explain any risks associated with actions.

When showing balances or information, format it in a readable way, focusing on the most important data first.`;

export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    selectedModel,
  }: { messages: UIMessage[]; selectedModel: modelID } = await req.json();

  const result = streamText({
    model: model.languageModel(selectedModel),
    system: sysPrompt,
    messages: messages as Message[],
    tools,
    maxSteps: 5,
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
    getErrorMessage: (error) => {
      if (error instanceof Error) {
        if (error.message.includes("Rate limit")) {
          return "Rate limit exceeded. Please try again later.";
        }
      }
      console.error(error);
      return "An error occurred.";
    },
  });
}
