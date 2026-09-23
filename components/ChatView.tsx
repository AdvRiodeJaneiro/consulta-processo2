"use client";

import React, { useRef, useEffect } from 'react';
import { ChatBubble } from './ChatBubble';
import WelcomeScreen from './WelcomeScreen';
import { cn } from '../lib/utils';

interface ChatViewProps {
  showWelcome: boolean;
  messages: any[];
  input: string;
  setInput: (val: string) => void;
  isProcessing: boolean;
  debugInfo: any;
  setDebugInfo: (val: any) => void;
  handleWelcomeSubmit: (text: string) => void;
  handleSend: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleTransitionToMonitor: () => void;
  handleExplainAi?: () => void;
}

export function ChatView({
  showWelcome,
  messages,
  input,
  setInput,
  isProcessing,
  debugInfo,
  setDebugInfo,
  handleWelcomeSubmit,
  handleSend,
  handleKeyDown,
  handleTransitionToMonitor,
  handleExplainAi
}: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, debugInfo]);

  if (showWelcome) {
    return <WelcomeScreen onSubmit={handleWelcomeSubmit} />;
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 dark overflow-hidden relative">
      <main className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="flex flex-col space-y-2 max-w-3xl mx-auto w-full pb-24">
          {debugInfo && (
            <div className="w-full rounded-xl p-4 mb-6 text-xs font-mono overflow-x-auto border border-red-200 bg-red-50 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-red-200/50">
                <span className="font-bold uppercase tracking-wider">DEBUG API</span>
                <button onClick={() => setDebugInfo(null)} className="hover:opacity-50 font-bold">&times;</button>
              </div>
              <pre className="whitespace-pre-wrap">{debugInfo.content}</pre>
            </div>
          )}

          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              onMonitorClick={handleTransitionToMonitor}
              onExplainClick={() => {
                if (msg.isUrlExplainSuggestion) {
                  sessionStorage.setItem('auto_explain', 'true');
                  handleWelcomeSubmit(msg.processNumber);
                } else if (handleExplainAi) {
                  handleExplainAi();
                }
              }}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-slate-900/80 backdrop-blur-md p-6 border-t border-slate-800 sticky bottom-0 z-10">
        <div className="max-w-3xl mx-auto w-full">
          <div className="relative flex items-end gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-200">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte algo sobre o processo..."
              className="w-full bg-transparent border-none text-white placeholder-slate-400 focus:ring-0 resize-none max-h-32 py-3 px-2 text-sm md:text-base scrollbar-hide leading-relaxed font-medium"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              className={cn(
                "p-3 rounded-lg flex-shrink-0 mb-0.5 transition-all duration-200",
                input.trim() && !isProcessing
                  ? "bg-primary text-deep-indigo shadow-lg hover:scale-105"
                  : "bg-slate-700 text-slate-400 cursor-not-allowed"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}