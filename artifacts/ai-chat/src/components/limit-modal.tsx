import { AlertTriangle, Crown, Zap, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LimitModalProps {
  open: boolean;
  type: "chat" | "image";
  onClose: () => void;
}

export function LimitModal({ open, type, onClose }: LimitModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-400" />
            </div>

            <h2 className="text-xl font-bold text-center mb-2">Dzienny limit wyczerpany</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              {type === "chat"
                ? "Wykorzystałeś dzienny limit 20 wiadomości w planie FREE. Limit odnawia się o północy."
                : "Wykorzystałeś dzienny limit 3 obrazów w planie FREE. Limit odnawia się o północy."}
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <Crown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-amber-400">Plan PRO</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Nielimitowane wiadomości i obrazy — wkrótce dostępny</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                <RefreshCw className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm">Plan FREE</div>
                  <div className="text-xs text-muted-foreground mt-0.5">20 wiadomości + 3 obrazy dziennie · odnawia się o północy</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-primary">Limit odnowi się jutro</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Wróć jutro, aby dalej korzystać za darmo</div>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-5 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl text-sm font-medium transition-colors"
            >
              Rozumiem
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
