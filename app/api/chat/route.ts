import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";
import { setupAssistant } from "../../../lib/agents/openai";
import { allTools } from "../../../lib/agents/tools";

// Convert Vercel AI SDK messages to OpenAI messages
const convertVercelMessageToOpenAIMessage = (message: VercelChatMessage) => {
  return {
    role: message.role,
    content: message.content,
  };
};

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Setup or retrieve the assistant
    const { openai, assistant } = await setupAssistant();

    // Create a thread if one doesn't exist or use the existing one
    const threadId = req.headers.get("thread-id");
    let thread;

    if (threadId) {
      // Use the existing thread
      thread = await openai.beta.threads.retrieve(threadId);
    } else {
      // Create a new thread
      thread = await openai.beta.threads.create();
    }

    // Add the latest user message to the thread
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage.role === "user") {
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: lastUserMessage.content,
      });
    }

    // Create a run to process the thread with the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    // This is a long polling approach to check for the run completion
    // In a production app, you'd use a webhook or background job
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    // Wait for the run to complete or require action
    while (runStatus.status === "queued" || runStatus.status === "in_progress") {
      // Wait for a second before checking again
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    // Handle tool calls if any
    if (runStatus.status === "requires_action" && runStatus.required_action?.type === "submit_tool_outputs") {
      const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
      const toolOutputs = [];

      for (const toolCall of toolCalls) {
        const toolName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        if (allTools[toolName]) {
          try {
            const result = await allTools[toolName].handler(args);
            toolOutputs.push({
              tool_call_id: toolCall.id,
              output: JSON.stringify(result),
            });
          } catch (error) {
            console.error(`Error executing tool ${toolName}:`, error);
            toolOutputs.push({
              tool_call_id: toolCall.id,
              output: JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            });
          }
        } else {
          toolOutputs.push({
            tool_call_id: toolCall.id,
            output: JSON.stringify({ error: `Tool ${toolName} not found` }),
          });
        }
      }

      // Submit tool outputs and wait for completion
      await openai.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
        tool_outputs: toolOutputs,
      });

      // Wait for the run to complete after tool outputs
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      while (runStatus.status === "queued" || runStatus.status === "in_progress") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      }
    }

    // Get the latest assistant message from the thread
    const messagesResponse = await openai.beta.threads.messages.list(thread.id);
    const assistantMessages = messagesResponse.data.filter(
      (message) => message.role === "assistant"
    );

    if (assistantMessages.length > 0) {
      // Get the latest assistant message
      const latestMessage = assistantMessages[0];
      const messageContent = latestMessage.content[0];

      if (messageContent.type === "text") {
        // Return a streaming response with the assistant's message
        return new NextResponse(JSON.stringify({
          threadId: thread.id,
          message: messageContent.text.value,
        }), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    }

    return new NextResponse(JSON.stringify({
      threadId: thread.id,
      message: "I'm sorry, I couldn't process your request properly.",
    }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing chat request:", error);
    return new NextResponse(JSON.stringify({
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
} 