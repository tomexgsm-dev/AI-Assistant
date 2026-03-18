import { OpenaiMessage } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";
import { motion } from "framer-motion";

interface ChatMessageProps {
  message: Pick<OpenaiMessage, "role" | "content">;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "py-6 px-4 md:px-8 flex gap-4 md:gap-6 w-full justify-center border-b border-border/40",
        isUser ? "bg-background" : "bg-card/40"
      )}
    >
      <div className="max-w-3xl w-full flex gap-4 md:gap-6">
        <div className="shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border shadow-sm">
              <User className="w-4 h-4 text-secondary-foreground" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-glow">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="font-semibold text-sm text-muted-foreground mb-1">
            {isUser ? "You" : "Nexus AI"}
          </div>
          
          <div className={cn(
            "prose prose-invert prose-p:leading-relaxed prose-pre:p-0",
            isStreaming && !isUser && "after:content-[''] after:inline-block after:w-1.5 after:h-4 after:bg-primary after:ml-1 after:animate-pulse"
          )}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content || (isStreaming ? "" : "...")}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
