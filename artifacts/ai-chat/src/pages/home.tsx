import { Layout } from "@/components/layout";
import { Sparkles, ArrowRight } from "lucide-react";
import { useCreateOpenaiConversation } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { format } from "date-fns";

export default function Home() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateOpenaiConversation({
    mutation: {
      onSuccess: (data) => {
        setLocation(`/c/${data.id}`);
      }
    }
  });

  const handleStart = () => {
    createMutation.mutate({
      data: { title: `New Chat ${format(new Date(), "HH:mm")}` }
    });
  };

  return (
    <Layout>
      <div className="relative w-full h-full flex flex-col items-center justify-center p-6 overflow-hidden">
        
        {/* Background Image Integration */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img 
            src={`${import.meta.env.BASE_URL}images/empty-state-bg.png`} 
            alt="Abstract minimal background" 
            className="w-full h-full object-cover object-center mix-blend-screen"
          />
        </div>

        <div className="relative z-10 max-w-lg w-full text-center space-y-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-card border border-border shadow-2xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
            <Sparkles className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground">
              Welcome to Nexus AI
            </h1>
            <p className="text-lg text-muted-foreground/80 leading-relaxed max-w-md mx-auto">
              Experience intelligent conversations powered by advanced language models in a distraction-free environment.
            </p>
          </div>

          <button
            onClick={handleStart}
            disabled={createMutation.isPending}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold text-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-glow disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            
            {createMutation.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Initializing...
              </span>
            ) : (
              <span className="flex items-center gap-2 relative z-10">
                Start a New Conversation
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
}
