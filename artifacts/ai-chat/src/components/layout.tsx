import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { MessageSquare, Plus, Trash2, Menu, X, Command, Sparkles, Image, LayoutGrid } from "lucide-react";
import { 
  useListOpenaiConversations, 
  useCreateOpenaiConversation, 
  useDeleteOpenaiConversation,
  getListOpenaiConversationsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

const APP_EMOJIS: Record<string, string> = {
  writer: "✍️", coder: "💻", translator: "🌍", analyst: "📊",
  marketing: "📣", email: "📧", summarizer: "📝", brainstorm: "💡",
  diet: "🥗", travel: "✈️", fitness: "💪", law: "⚖️",
  canva: "🎨", asana: "📋", clickup: "⚡", brand24: "📡",
  quiz: "🧠", knowledgegraph: "🗺️", sales: "💼", leads: "🎯",
  meetings: "🤝", expenses: "💰", website: "🌐", appbuilder: "🏗️",
  sentiment: "📈", pdf: "📄", airtable: "🗃️",
};

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const { data: conversations, isLoading } = useListOpenaiConversations();

  const createMutation = useCreateOpenaiConversation({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        setLocation(`/c/${data.id}`);
        setIsSidebarOpen(false);
      }
    }
  });

  const deleteMutation = useDeleteOpenaiConversation({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        if (location === `/c/${variables.id}`) {
          setLocation('/');
        }
      }
    }
  });

  const handleNewChat = () => {
    createMutation.mutate({
      data: { title: `New Chat ${format(new Date(), "HH:mm")}` }
    });
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-primary selection:text-primary-foreground">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 shadow-2xl md:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center gap-2 font-display font-bold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-glow">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>Nexus AI</span>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 space-y-1">
          <button
            onClick={handleNewChat}
            disabled={createMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl text-sm font-medium transition-all duration-200 shadow-inner-glow border border-border/50 disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {t.sidebar.newConversation}
          </button>
          <Link
            href="/images"
            className={cn(
              "w-full flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 border",
              location === "/images"
                ? "bg-sidebar-accent text-sidebar-accent-foreground border-border/50"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground border-transparent"
            )}
          >
            <Image className="w-4 h-4 shrink-0" />
            {t.sidebar.images}
          </Link>
          <Link
            href="/apps"
            className={cn(
              "w-full flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 border",
              location === "/apps"
                ? "bg-sidebar-accent text-sidebar-accent-foreground border-border/50"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground border-transparent"
            )}
          >
            <LayoutGrid className="w-4 h-4 shrink-0" />
            {t.sidebar.apps}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-xs font-semibold text-sidebar-foreground px-3 py-2 uppercase tracking-wider">
            {t.sidebar.history}
          </div>
          
          {isLoading ? (
            <div className="space-y-2 px-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-sidebar-accent/50 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : conversations?.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              {t.sidebar.noConversations}
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {conversations?.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(conv => {
                const isActive = location === `/c/${conv.id}`;
                return (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className={cn(
                        "group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-sm",
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                      )}
                    >
                      <Link href={`/c/${conv.id}`} className="flex-1 flex items-center gap-3 truncate">
                        {conv.appId && APP_EMOJIS[conv.appId] ? (
                          <span className="shrink-0 text-base leading-none">{APP_EMOJIS[conv.appId]}</span>
                        ) : (
                          <MessageSquare className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                        )}
                        <span className="truncate">{conv.title}</span>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate({ id: conv.id });
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/20 hover:text-destructive rounded-md transition-all text-muted-foreground"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
        
        <div className="p-4 border-t border-sidebar-border text-xs text-muted-foreground flex items-center justify-between">
          <span>{t.sidebar.poweredBy}</span>
          <Command className="w-3 h-3" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
          <button onClick={toggleSidebar} className="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-lg md:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="font-display font-semibold ml-2 md:hidden">Nexus AI</div>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
}
