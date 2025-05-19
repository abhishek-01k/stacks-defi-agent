"use client";

import { useRef, useEffect } from "react";
import { useChat } from "ai/react";

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Suggested queries
  const suggestions = [
    "What's my wallet address?",
    "Show my STX balance",
    "What tokens do I have?",
    "Show my recent transactions",
    "Tell me about Velar protocol",
    "What tokens are available on AlexGo?",
    "Check if I'm enrolled in sBTC incentives"
  ];

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-gray-50">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Stacks DeFi Assistant</h1>
          <p className="text-gray-600 mt-2">Interact with Stacks blockchain protocols through natural language</p>
        </div>
        
        {/* Chat container */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4 h-[500px] overflow-y-auto">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium mb-2">Welcome to Stacks DeFi Assistant</p>
                  <p className="mb-4">Ask questions about your wallet or Stacks DeFi protocols</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.slice(0, 3).map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          const form = document.querySelector('form') as HTMLFormElement;
                          const input = form.querySelector('input') as HTMLInputElement;
                          input.value = suggestion;
                          handleInputChange({ target: { value: suggestion } } as any);
                          form.dispatchEvent(new Event('submit', { cancelable: true }));
                        }}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-100"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-[80%] ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {message.content.split("\n").map((line, i) => (
                      <div key={i}>{line || <br />}</div>
                    ))}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-lg max-w-[80%] bg-gray-200 text-gray-800">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about Stacks DeFi protocols..."
            className="flex-1 p-3 border rounded-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-blue-400"
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </form>
        
        {/* Suggestions */}
        <div className="mt-6">
          <h3 className="text-sm text-gray-600 mb-2">Try asking:</h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  handleInputChange({ target: { value: suggestion } } as any);
                  const form = document.querySelector('form') as HTMLFormElement;
                  form.dispatchEvent(new Event('submit', { cancelable: true }));
                }}
                className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
} 