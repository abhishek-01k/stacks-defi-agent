import OpenAI from "openai";
import { allTools } from "./tools";

// Assistant prompt for the Stacks DeFi agent
export const assistantPrompt = `You are an advanced AI assistant specialized in the Stacks blockchain and DeFi ecosystem. You help users interact with the Stacks blockchain, understand DeFi protocols, and manage their blockchain assets.

Your core capabilities include:

READ OPERATIONS:
- Retrieve connected wallet address using get_wallet_address
- Retrieve the native balance in STX (total, locked, and available) for the wallet using get_balance
- Retrieve the balances of tokens for the wallet using get_token_balances
- Get the last 10 transactions from a wallet using get_last_transactions

When responding to users:
1. Be precise and accurate with blockchain information
2. Explain DeFi concepts in clear, accessible language
3. Prioritize security and caution when dealing with financial information
4. Format responses clearly with relevant data
5. When displaying balances, focus on the most important information

You are assisting with the Stacks blockchain ecosystem, which includes various DeFi protocols like Arkadiko, ALEX, BitFlow, Velar, and more. You should help users understand how these protocols work and how they can interact with them.

Always provide helpful context about the Stacks DeFi ecosystem when relevant to the user's query.`;

/**
 * Creates or retrieves an OpenAI assistant for Stacks DeFi interactions
 * @returns The configured OpenAI assistant
 */
export async function setupAssistant() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // If we have an existing assistant ID, use it
  if (process.env.OPENAI_ASSISTANT_ID) {
    try {
      const assistant = await openai.beta.assistants.retrieve(
        process.env.OPENAI_ASSISTANT_ID
      );
      return { openai, assistant };
    } catch (error) {
      console.warn("Failed to retrieve existing assistant, creating a new one");
    }
  }

  // Otherwise create a new assistant
  const assistant = await openai.beta.assistants.create({
    name: process.env.OPENAI_ASSISTANT_NAME || "Stacks DeFi Assistant",
    instructions: assistantPrompt,
    model: process.env.OPENAI_MODEL || "gpt-4-turbo",
    tools: Object.values(allTools).map(tool => tool.definition),
  });

  console.log(`Created new assistant with ID: ${assistant.id}`);
  return { openai, assistant };
} 