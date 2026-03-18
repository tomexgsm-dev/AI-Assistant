import { useEffect, useRef, useState } from "react";
import { useRoute } from "wouter";
import { useGetOpenaiConversation } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ChatMessage } from "@/components/chat-message";
import { useChatStream } from "@/hooks/use-chat-stream";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const [, params] = useRoute("/c/:id");
  const conversationId = params?.id ? parseInt(params.id) : undefined;

  const { data: conversation, isLoading, isError } = useGetOpenaiConversation(conversationId!, {
    query: { enabled: !!conversationId }
  });

  const { sendMessage, isStreaming, streamingMessage } = useChatStream(conversationId);
  
  const [input, setInput] = useState("");
  const [optimisticUserMsg, setOptimisticUserMsg] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, streamingMessage, optimisticUserMsg]);

  // Clear optimistic UI when real messages load or stream starts
  useEffect(() => {
    if (isStreaming) {
      setOptimisticUserMsg(null);
    }
  }, [isStreaming]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !conversationId) return;

    const content = input.trim();
    setInput("");
    setOptimisticUserMsg(content);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const messages = conversation?.messages || [];

  return (
    <Layout>
      {isLoading ? (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : isError || !conversation ? (
        <div className="flex h-full items-center justify-center text-destructive">
          Failed to load conversation. It may have been deleted.
        </div>
      ) : (
        <div className="flex flex-col h-full absolute inset-0">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto pb-32">
            {messages.length === 0 && !optimisticUserMsg && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6 shadow-lg shadow-black/20 border border-border">
                  <div className="w-8 h-8 bg-primary rounded-full shadow-glow animate-pulse" />
                </div>
                <h2 className="text-2xl font-display font-bold mb-2">How can I help you today?</h2>
                <p className="text-muted-foreground">
                  I'm an intelligent AI assistant. Ask me anything, from coding to writing, or just chat.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {optimisticUserMsg && (
              <ChatMessage message={{ role: "user", content: optimisticUserMsg }} />
            )}

            {(isStreaming || streamingMessage) && (
              <ChatMessage 
                message={{ role: "assistant", content: streamingMessage }} 
                isStreaming={true} 
              />
            )}
            
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Input Area */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4 px-4 md:px-8">
            <div className="max-w-3xl mx-auto relative">
              <form 
                onSubmit={handleSubmit}
                className="relative bg-card border border-border rounded-2xl shadow-xl shadow-black/20 flex items-end p-2 transition-all focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50"
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    autoResize(e);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Nexus AI..."
                  className="w-full max-h-[200px] min-h-[44px] bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none py-3 px-4 text-base"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isStreaming}
                  className={cn(
                    "p-3 rounded-xl flex items-center justify-center shrink-0 mb-1 mr-1 transition-all duration-200",
                    input.trim() && !isStreaming
                      ? "bg-primary text-primary-foreground shadow-glow hover:-translate-y-0.5"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </form>
              <div className="text-center mt-2 text-xs text-muted-foreground/70">
                AI can make mistakes. Consider verifying important information.
              </div>
            </div>
          </div>

        </div>
      )}
    </Layout>
  );
}
