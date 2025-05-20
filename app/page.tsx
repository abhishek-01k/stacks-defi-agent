"use client";

import Chat from "@/components/chat";

export default function Home() {
  return (
    <main className="flex flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Stacks DeFI AI Agent</h1>
          <p className="text-gray-600 mt-2">Interact with Stacks DeFI protocols through natural language</p>
        </div>
        
        <Chat />
      </div>
    </main>
  );
} 