import { useEffect, useRef, useState, useCallback } from "react";
import { useRoute } from "wouter";
import { useGetOpenaiConversation, getGetOpenaiConversationQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { ChatMessage } from "@/components/chat-message";
import { useChatStream } from "@/hooks/use-chat-stream";
import { Send, Loader2, Brain, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

const API_BASE = "/api";
const MAX_IMAGE_SIZE_MB = 10;

export default function ChatPage() {
  const [, params] = useRoute("/c/:id");
  const conversationId = params?.id ? parseInt(params.id) : undefined;
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const { data: conversation, isLoading, isError } = useGetOpenaiConversation(conversationId!, {
    query: { enabled: !!conversationId }
  });

  const { sendMessage, isStreaming, streamingMessage } = useChatStream(conversationId);
  
  const [input, setInput] = useState("");
  const [optimisticUserMsg, setOptimisticUserMsg] = useState<string | null>(null);
  const [localRatings, setLocalRatings] = useState<Record<number, 1 | -1 | null>>({});
  
  // Image attachment state
  const [attachedImage, setAttachedImage] = useState<{ base64: string; mimeType: string; previewUrl: string; name: string } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, streamingMessage, optimisticUserMsg]);

  useEffect(() => {
    if (isStreaming) {
      setOptimisticUserMsg(null);
    }
  }, [isStreaming]);

  const handleRate = useCallback(async (messageId: number, rating: 1 | -1 | null) => {
    setLocalRatings(prev => ({ ...prev, [messageId]: rating }));
    try {
      await fetch(`${API_BASE}/openai/messages/${messageId}/rating`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      queryClient.invalidateQueries({ queryKey: getGetOpenaiConversationQueryKey(conversationId!) });
    } catch (_e) {
      setLocalRatings(prev => ({ ...prev, [messageId]: null }));
    }
  }, [conversationId, queryClient]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageError(null);

    if (!file.type.startsWith("image/")) {
      setImageError("Wybierz plik obrazu (JPG, PNG, WEBP, GIF)");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setImageError(`Plik jest za duży. Maksymalny rozmiar: ${MAX_IMAGE_SIZE_MB} MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      // result is like "data:image/jpeg;base64,XXXXX"
      const base64 = result.split(",")[1];
      setAttachedImage({
        base64,
        mimeType: file.type,
        previewUrl: result,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const removeImage = () => {
    setAttachedImage(null);
    setImageError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachedImage) || isStreaming || !conversationId) return;

    const content = input.trim();
    setInput("");
    setOptimisticUserMsg(content || "📷");
    
    const imageToSend = attachedImage;
    setAttachedImage(null);
    setImageError(null);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(content, imageToSend ? {
      imageBase64: imageToSend.base64,
      imageMimeType: imageToSend.mimeType,
    } : undefined);
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

  // Drag & drop support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const fakeEvent = { target: { files: [file], value: "" }, currentTarget: { value: "" } } as unknown as React.ChangeEvent<HTMLInputElement>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleFileSelect({ ...fakeEvent, target: { files: e.dataTransfer.files, value: "" } } as any);
  };

  const messages = conversation?.messages || [];
  const hasSummaries = messages.length >= 10;
  const canSend = (input.trim() || !!attachedImage) && !isStreaming;

  return (
    <Layout>
      {isLoading ? (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : isError || !conversation ? (
        <div className="flex h-full items-center justify-center text-destructive">
          {t.chat.error}
        </div>
      ) : (
        <div className="flex flex-col h-full absolute inset-0">
          
          {hasSummaries && (
            <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-primary/70 bg-primary/5 border-b border-primary/10">
              <Brain className="w-3 h-3" />
              <span>{t.chat.memory}</span>
            </div>
          )}

          <div
            className="flex-1 overflow-y-auto pb-32"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {messages.length === 0 && !optimisticUserMsg && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6 shadow-lg shadow-black/20 border border-border">
                  <div className="w-8 h-8 bg-primary rounded-full shadow-glow animate-pulse" />
                </div>
                {conversation.appId ? (
                  <>
                    <h2 className="text-2xl font-display font-bold mb-2">{conversation.title}</h2>
                    <p className="text-muted-foreground">{t.chat.appEmptySubtitle}</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-display font-bold mb-2">{t.chat.emptyTitle}</h2>
                    <p className="text-muted-foreground">{t.chat.emptySubtitle}</p>
                  </>
                )}
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="group">
                <ChatMessage
                  message={{
                    ...msg,
                    rating: localRatings[msg.id] !== undefined ? localRatings[msg.id] : msg.rating,
                  }}
                  onRate={handleRate}
                />
              </div>
            ))}

            {optimisticUserMsg !== null && (
              <div className="group">
                <ChatMessage message={{ id: 0, role: "user", content: optimisticUserMsg, rating: null }} />
              </div>
            )}

            {(isStreaming || streamingMessage) && (
              <div className="group">
                <ChatMessage 
                  message={{ id: 0, role: "assistant", content: streamingMessage, rating: null }} 
                  isStreaming={true} 
                />
              </div>
            )}
            
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Input area */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4 px-4 md:px-8">
            <div className="max-w-3xl mx-auto relative">

              {/* Image error */}
              {imageError && (
                <div className="mb-2 px-4 py-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2">
                  <X className="w-3.5 h-3.5 shrink-0" />
                  {imageError}
                </div>
              )}

              {/* Image preview */}
              {attachedImage && (
                <div className="mb-2 flex items-start gap-2 px-3 py-2 bg-card border border-border rounded-xl">
                  <img
                    src={attachedImage.previewUrl}
                    alt="Dołączony obraz"
                    className="h-16 w-16 object-cover rounded-lg shrink-0 border border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{attachedImage.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Gotowe do wysłania</p>
                  </div>
                  <button
                    onClick={removeImage}
                    className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form 
                onSubmit={handleSubmit}
                className="relative bg-card border border-border rounded-2xl shadow-xl shadow-black/20 flex items-end p-2 transition-all focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50"
              >
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {/* Attach image button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isStreaming}
                  className={cn(
                    "p-2.5 rounded-xl shrink-0 mb-1 ml-1 transition-colors",
                    attachedImage
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  title="Dołącz obraz"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    autoResize(e);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={attachedImage ? "Dodaj opis do obrazu (opcjonalnie)..." : t.chat.placeholder}
                  className="w-full max-h-[200px] min-h-[44px] bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none py-3 px-3 text-base"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className={cn(
                    "p-3 rounded-xl flex items-center justify-center shrink-0 mb-1 mr-1 transition-all duration-200",
                    canSend
                      ? "bg-primary text-primary-foreground shadow-glow hover:-translate-y-0.5"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </form>
              <div className="text-center mt-2 text-xs text-muted-foreground/70">
                {t.chat.disclaimer}
              </div>
            </div>
          </div>

        </div>
      )}
    </Layout>
  );
}
