import React from 'react';
import { Message } from '../types';
import { ShiningText } from './ui/shining-text';
import { WhatsappButtons } from './WhatsappButtons';
import { Bell, ArrowRight, Sparkles } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
  onMonitorClick?: () => void;
  onExplainClick?: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onMonitorClick, onExplainClick }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex items-center justify-center my-8 w-full gap-4 max-w-3xl mx-auto px-4">
        <div className="flex-1 h-px bg-slate-800/80" />
        <div className="px-4 py-1.5 rounded-full bg-indigo-950/40 border border-purple-500/30 text-purple-300 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-pulse text-purple-400">
            <g clipPath="url(#clip0_3261_13817_custom_sys)">
              <path d="M19.34 19.23L18.11 19.51C17.23 19.71 16.54 20.4 16.34 21.28L16.06 22.51C16.03 22.64 15.84 22.64 15.81 22.51L15.53 21.28C15.33 20.4 14.64 19.71 13.76 19.51L12.53 19.23C12.4 19.2 12.4 19.01 12.53 18.98L13.76 18.7C14.64 18.5 15.33 17.81 15.53 16.93L15.81 15.7C15.84 15.57 16.03 15.57 16.06 15.7L16.34 16.93C16.54 17.81 17.23 18.5 18.11 18.7L19.34 18.98C19.47 19.01 19.47 19.2 19.34 19.23Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" />
              <path d="M10.66 21.4001C9.69999 21.2601 8.77999 20.9801 7.91999 20.5801C7.62999 20.4401 7.15999 20.3801 6.84999 20.4501C6.18999 20.6101 5.07999 20.8801 4.13999 21.1001C3.23999 21.3201 2.67999 20.7601 2.89999 19.8601L3.54999 17.1601C3.62999 16.8501 3.54999 16.3701 3.41999 16.0801C2.61999 14.4001 2.29999 12.4501 2.62999 10.4001C3.26999 6.46005 6.44999 3.27005 10.39 2.62005C16.89 1.57005 22.43 7.11005 21.37 13.6101C21.21 14.5701 20.92 15.4801 20.51 16.3101" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14.09 6.58008C15.63 7.18008 16.85 8.41008 17.43 9.96008" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs>
              <clipPath id="clip0_3261_13817_custom_sys">
                <rect width="24" height="24" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          {message.content}
        </div>
        <div className="flex-1 h-px bg-slate-800/80" />
      </div>
    );
  }

  // Handle Explain with AI Suggestion Card
  if (message.isExplainAi) {
    return (
      <div className="flex w-full mb-6 justify-start">
        <div className="max-w-[85%] md:max-w-[75%] rounded-2xl p-6 shadow-xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-purple-500/30 rounded-bl-none overflow-hidden relative group">
           {/* Animated Background Effect */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-purple-500/20 transition-all duration-700" />
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                 <div className="size-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0">
                      <g clipPath="url(#clip0_3261_13817_custom_title)">
                        <path d="M19.34 19.23L18.11 19.51C17.23 19.71 16.54 20.4 16.34 21.28L16.06 22.51C16.03 22.64 15.84 22.64 15.81 22.51L15.53 21.28C15.33 20.4 14.64 19.71 13.76 19.51L12.53 19.23C12.4 19.2 12.4 19.01 12.53 18.98L13.76 18.7C14.64 18.5 15.33 17.81 15.53 16.93L15.81 15.7C15.84 15.57 16.03 15.57 16.06 15.7L16.34 16.93C16.54 17.81 17.23 18.5 18.11 18.7L19.34 18.98C19.47 19.01 19.47 19.2 19.34 19.23Z" stroke="#fff" strokeWidth="1.5" strokeMiterlimit="10" />
                        <path d="M10.66 21.4001C9.69999 21.2601 8.77999 20.9801 7.91999 20.5801C7.62999 20.4401 7.15999 20.3801 6.84999 20.4501C6.18999 20.6101 5.07999 20.8801 4.13999 21.1001C3.23999 21.3201 2.67999 20.7601 2.89999 19.8601L3.54999 17.1601C3.62999 16.8501 3.54999 16.3701 3.41999 16.0801C2.61999 14.4001 2.29999 12.4501 2.62999 10.4001C3.26999 6.46005 6.44999 3.27005 10.39 2.62005C16.89 1.57005 22.43 7.11005 21.37 13.6101C21.21 14.5701 20.92 15.4801 20.51 16.3101" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14.09 6.58008C15.63 7.18008 16.85 8.41008 17.43 9.96008" stroke="#fff" strokeWidth="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      </g>
                      <defs>
                        <clipPath id="clip0_3261_13817_custom_title">
                          <rect width="24" height="24" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                 </div>
                 <h4 className="text-white font-black text-lg leading-tight">Traduzir com IA</h4>
              </div>
              
              <p className="text-slate-300 text-sm mb-6 leading-relaxed font-medium">
                {message.content}
              </p>
              
              <button
                onClick={onExplainClick}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-900/40"
              >
                <span>Explicar com IA Jurídica</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0">
                  <g clipPath="url(#clip0_3261_13817_custom)">
                    <path d="M19.34 19.23L18.11 19.51C17.23 19.71 16.54 20.4 16.34 21.28L16.06 22.51C16.03 22.64 15.84 22.64 15.81 22.51L15.53 21.28C15.33 20.4 14.64 19.71 13.76 19.51L12.53 19.23C12.4 19.2 12.4 19.01 12.53 18.98L13.76 18.7C14.64 18.5 15.33 17.81 15.53 16.93L15.81 15.7C15.84 15.57 16.03 15.57 16.06 15.7L16.34 16.93C16.54 17.81 17.23 18.5 18.11 18.7L19.34 18.98C19.47 19.01 19.47 19.2 19.34 19.23Z" stroke="#fff" strokeWidth="1.5" strokeMiterlimit="10" />
                    <path d="M10.66 21.4001C9.69999 21.2601 8.77999 20.9801 7.91999 20.5801C7.62999 20.4401 7.15999 20.3801 6.84999 20.4501C6.18999 20.6101 5.07999 20.8801 4.13999 21.1001C3.23999 21.3201 2.67999 20.7601 2.89999 19.8601L3.54999 17.1601C3.62999 16.8501 3.54999 16.3701 3.41999 16.0801C2.61999 14.4001 2.29999 12.4501 2.62999 10.4001C3.26999 6.46005 6.44999 3.27005 10.39 2.62005C16.89 1.57005 22.43 7.11005 21.37 13.6101C21.21 14.5701 20.92 15.4801 20.51 16.3101" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0_3261_13817_custom">
                      <rect width="24" height="24" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </button>
           </div>
        </div>
      </div>
    );
  }

  // Handle URL Explain Suggestion Card
  if (message.isUrlExplainSuggestion) {
    return (
      <div className="flex w-full mb-6 justify-start">
        <div className="max-w-[85%] md:max-w-[75%] rounded-2xl p-6 shadow-xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-purple-500/30 rounded-bl-none overflow-hidden relative group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-purple-500/20 transition-all duration-700" />
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                 <div className="size-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/50">
                    <Sparkles size={20} />
                 </div>
                 <h4 className="text-white font-black text-lg leading-tight">Explicação com IA</h4>
              </div>
              
              <p className="text-slate-300 text-sm mb-6 leading-relaxed font-medium">
                {message.content}
              </p>
              
              <button
                onClick={onExplainClick}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-900/40"
              >
                <span>Sim, quero a explicação com IA</span>
                <Sparkles size={18} />
              </button>
           </div>
        </div>
      </div>
    );
  }

  // Handle Monitor Suggestion Card
  if (message.isMonitorSuggestion) {
    return (
      <div className="flex w-full mb-6 justify-start">
        <div className="max-w-[85%] md:max-w-[75%] rounded-2xl p-6 shadow-xl bg-slate-900 border border-primary/30 rounded-bl-none overflow-hidden relative group">
           {/* Animated Background Effect */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                 <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-deep-indigo shadow-lg shadow-primary/20">
                    <Bell size={20} className="animate-pulse" />
                 </div>
                 <h4 className="text-white font-black text-lg leading-tight">Acompanhe seu processo</h4>
              </div>
              
              <p className="text-slate-300 text-sm mb-6 leading-relaxed font-medium">
                {message.content}
              </p>
              
              <button
                onClick={onMonitorClick}
                className="w-full bg-primary hover:bg-primary/90 text-deep-indigo font-black py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20"
              >
                <span>Sim quero</span>
                <ArrowRight size={18} />
              </button>
           </div>
        </div>
      </div>
    );
  }

  // Handle Special Contact Bubble
  if (message.isContact) {
    return (
      <div className="flex w-full mb-6 justify-start">
        <div className="max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-5 shadow-sm bg-card border border-primary/30 rounded-bl-none">
           <p className="mb-4 font-semibold text-foreground/90">{message.content}</p>
           <WhatsappButtons />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
          isUser
            ? 'bg-primary text-secondary rounded-br-none font-medium'
            : 'bg-card text-foreground border border-border rounded-bl-none'
        }`}
      >
        {message.isLoading ? (
          <div className="flex items-center min-h-6">
             <ShiningText text={message.content || "Carregando..."} />
          </div>
        ) : (
          <div className={`prose prose-sm max-w-none ${!isUser && 'text-foreground'}`}>
             <div className="whitespace-pre-wrap leading-relaxed">
                {message.content.split('\n').map((line, i) => {
                    // Adaptative Heading Colors
                    if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-black mt-2 mb-1 text-foreground dark:text-white">{line.replace('## ', '')}</h2>;
                    if (line.startsWith('### ')) return <h3 key={i} className="text-md font-black mt-3 mb-2 text-primary uppercase tracking-wide">{line.replace('### ', '')}</h3>;
                    if (line.startsWith('- ')) return <li key={i} className="ml-4">{line.replace('- ', '')}</li>;
                    
                    const matchLink = line.match(/\[(.*?)\]\((.*?)\)/);
                    if (matchLink) {
                        const parts = line.split(/(\[.*?\]\(.*?\))/g);
                        return (
                            <p key={i} className="mb-2">
                                {parts.map((part, k) => {
                                    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
                                    if (linkMatch) {
                                        return (
                                            <a 
                                                key={k} 
                                                href={linkMatch[2]} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-primary underline hover:opacity-80 transition-opacity"
                                            >
                                                {linkMatch[1]}
                                            </a>
                                        );
                                    }
                                    return part.split(/(\*\*.*?\*\*)/g).map((subPart, m) => {
                                        if (subPart.startsWith('**') && subPart.endsWith('**')) {
                                            return <strong key={`${k}-${m}`} className="font-bold text-foreground dark:text-white">{subPart.slice(2, -2)}</strong>;
                                        }
                                        return subPart;
                                    });
                                })}
                            </p>
                        );
                    }

                    return (
                        <p key={i} className="mb-2">
                            {line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={j} className="font-bold text-foreground dark:text-white">{part.slice(2, -2)}</strong>;
                                }
                                return part;
                            })}
                        </p>
                    );
                })}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};