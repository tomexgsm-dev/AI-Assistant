import { useState } from "react";
import { Layout } from "@/components/layout";
import { useListOpenaiImages, useGenerateOpenaiImage, useDeleteOpenaiImage, getListOpenaiImagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles, Trash2, Download, Loader2, ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n";

const SIZES = [
  { label: "1024×1024", value: "1024x1024" },
  { label: "512×512", value: "512x512" },
  { label: "256×256", value: "256x256" },
] as const;

type StyleKey = "anime" | "photo" | "watercolor" | "pixel" | "oil" | "cinematic";

const STYLE_PROMPTS: { key: StyleKey; prompt: string }[] = [
  { key: "anime", prompt: "anime style portrait" },
  { key: "photo", prompt: "photorealistic, ultra detailed" },
  { key: "watercolor", prompt: "watercolor painting style" },
  { key: "pixel", prompt: "pixel art style" },
  { key: "oil", prompt: "oil painting style" },
  { key: "cinematic", prompt: "cinematic photograph, dramatic lighting" },
];

export default function ImagesPage() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<"1024x1024" | "512x512" | "256x256">("1024x1024");
  const [selectedImage, setSelectedImage] = useState<{ id: number; b64Data: string; prompt: string } | null>(null);
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const { data: images, isLoading } = useListOpenaiImages();

  const generateMutation = useGenerateOpenaiImage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiImagesQueryKey() });
        setPrompt("");
      }
    }
  });

  const deleteMutation = useDeleteOpenaiImage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiImagesQueryKey() });
        setSelectedImage(null);
      }
    }
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || generateMutation.isPending) return;
    generateMutation.mutate({ data: { prompt: prompt.trim(), size } });
  };

  const handleStyleClick = (stylePrompt: string) => {
    setPrompt(prev => prev ? `${prev}, ${stylePrompt}` : stylePrompt);
  };

  const handleDownload = (b64Data: string, imgPrompt: string) => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${b64Data}`;
    link.download = `${imgPrompt.slice(0, 40).replace(/[^a-z0-9]/gi, "_")}.png`;
    link.click();
  };

  return (
    <Layout>
      <div className="flex flex-col h-full absolute inset-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full px-4 md:px-8 py-8 pb-32">

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">{t.images.title}</h1>
            </div>
            <p className="text-muted-foreground text-sm">{t.images.subtitle}</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-lg">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.images.promptLabel}</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t.images.promptPlaceholder}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 min-h-[80px] placeholder:text-muted-foreground"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">{t.images.quickStyles}</label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_PROMPTS.map(s => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => handleStyleClick(s.prompt)}
                      className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg border border-border/50 transition-colors"
                    >
                      {t.images.styles[s.key]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 bg-background border border-border rounded-xl p-1">
                  {SIZES.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setSize(s.value)}
                      className={cn(
                        "px-3 py-1.5 text-xs rounded-lg font-medium transition-all",
                        size === s.value
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!prompt.trim() || generateMutation.isPending}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    prompt.trim() && !generateMutation.isPending
                      ? "bg-primary text-primary-foreground hover:-translate-y-0.5 shadow-md"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.images.generating}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {t.images.generateBtn}
                    </>
                  )}
                </button>
              </div>
            </form>

            {generateMutation.isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 flex items-center gap-3 text-sm text-muted-foreground bg-primary/5 border border-primary/20 rounded-xl px-4 py-3"
              >
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                {t.images.generatingInfo}
              </motion.div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              {t.images.myImages} {images && images.length > 0 && `(${images.length})`}
            </h2>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="aspect-square bg-card border border-border rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !images || images.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <ImageIcon className="w-12 h-12 mb-4 opacity-30" />
                <p className="font-medium">{t.images.noImages}</p>
                <p className="text-sm mt-1">{t.images.noImagesHint}</p>
              </div>
            ) : (
              <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4" layout>
                <AnimatePresence>
                  {[...images].reverse().map(img => (
                    <motion.div
                      key={img.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="group relative aspect-square bg-card border border-border rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow"
                      onClick={() => setSelectedImage({ id: img.id, b64Data: img.b64Data, prompt: img.prompt })}
                    >
                      <img
                        src={`data:image/png;base64,${img.b64Data}`}
                        alt={img.prompt}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end opacity-0 group-hover:opacity-100">
                        <div className="p-3 w-full">
                          <p className="text-white text-xs line-clamp-2 font-medium drop-shadow">{img.prompt}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-card border border-border rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={`data:image/png;base64,${selectedImage.b64Data}`}
                  alt={selectedImage.prompt}
                  className="w-full object-contain max-h-[60vh]"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">{selectedImage.prompt}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(selectedImage.b64Data, selectedImage.prompt)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {t.images.download}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate({ id: selectedImage.id })}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl text-sm font-medium transition-colors"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {t.images.delete}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
