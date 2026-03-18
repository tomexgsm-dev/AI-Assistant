import { Zap, Crown, AlertTriangle } from "lucide-react";
import { UsageData } from "@/hooks/use-usage";
import { cn } from "@/lib/utils";

interface UsageBannerProps {
  usage: UsageData;
  className?: string;
}

export function UsageBanner({ usage, className }: UsageBannerProps) {
  if (usage.isPro) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold", className)}>
        <Crown className="w-3.5 h-3.5 shrink-0" />
        <span>PRO</span>
      </div>
    );
  }

  const chatPct = usage.chat.used / usage.chat.limit;
  const imgPct = usage.images.used / usage.images.limit;
  const isAlmostOut = chatPct >= 0.8 || imgPct >= 0.8;
  const isOut = usage.chat.used >= usage.chat.limit;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs",
      isOut
        ? "bg-destructive/10 border-destructive/30 text-destructive"
        : isAlmostOut
        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
        : "bg-card border-border text-muted-foreground",
      className
    )}>
      {isOut ? (
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
      ) : (
        <Zap className="w-3.5 h-3.5 shrink-0" />
      )}
      <span>
        {isOut
          ? "Dzienny limit wyczerpany"
          : `${usage.chat.limit - usage.chat.used} czatów / ${usage.images.limit - usage.images.used} obrazów`}
      </span>
      <span className="text-muted-foreground/60 hidden sm:inline">dziś</span>
    </div>
  );
}
