import { useState, useRef, useEffect } from "react";
import { useI18n, Lang } from "@/i18n";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const LANGUAGES: { code: Lang; countryCode: string; label: string }[] = [
  { code: "pl", countryCode: "pl", label: "Polski" },
  { code: "en", countryCode: "gb", label: "English" },
  { code: "es", countryCode: "es", label: "Español" },
  { code: "de", countryCode: "de", label: "Deutsch" },
];

function FlagImg({ countryCode, size = 20 }: { countryCode: string; size?: number }) {
  return (
    <img
      src={`https://flagcdn.com/w${size}/${countryCode}.png`}
      srcSet={`https://flagcdn.com/w${size * 2}/${countryCode}.png 2x`}
      width={size}
      height={Math.round(size * 0.67)}
      alt={countryCode}
      className="rounded-[2px] object-cover shrink-0"
      style={{ display: "inline-block" }}
    />
  );
}

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === lang)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium border border-border/60 bg-card/50 hover:bg-card hover:border-border transition-all"
        title="Change language"
      >
        <FlagImg countryCode={current.countryCode} size={20} />
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{current.code}</span>
        <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-left",
                lang === l.code
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-accent text-foreground"
              )}
            >
              <FlagImg countryCode={l.countryCode} size={24} />
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
