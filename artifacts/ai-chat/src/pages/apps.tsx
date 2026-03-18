import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useCreateOpenaiConversation, getListOpenaiConversationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface App {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  category: "featured" | "productivity" | "creative" | "knowledge";
  systemPrompt: string;
}

const APPS: App[] = [
  {
    id: "writer",
    name: "Asystent Pisania",
    description: "Twórz teksty, artykuły i treści na każdą okazję",
    emoji: "✍️",
    color: "from-violet-500/20 to-purple-600/20 border-violet-500/30",
    category: "featured",
    systemPrompt: "Jesteś ekspertem pisarskim. Pomagasz tworzyć perfekcyjne teksty, artykuły, posty i wszelkiego rodzaju treści. Dbasz o styl, gramatykę i przekaz. Piszesz w języku rozmówcy. Sugerujesz ulepszenia i alternatywy.",
  },
  {
    id: "coder",
    name: "Programista",
    description: "Pisz, debuguj i optymalizuj kod w każdym języku",
    emoji: "💻",
    color: "from-blue-500/20 to-cyan-600/20 border-blue-500/30",
    category: "featured",
    systemPrompt: "Jesteś ekspertem programistą z wiedzą w każdym języku. Piszesz czysty, wydajny kod z komentarzami. Wyjaśniasz rozwiązania krok po kroku. Debugujesz błędy i sugerujesz optymalizacje. Zawsze używasz najlepszych praktyk.",
  },
  {
    id: "translator",
    name: "Tłumacz",
    description: "Tłumacz teksty na ponad 100 języków natychmiast",
    emoji: "🌍",
    color: "from-green-500/20 to-emerald-600/20 border-green-500/30",
    category: "featured",
    systemPrompt: "Jesteś profesjonalnym tłumaczem biegłym w ponad 100 językach. Tłumaczysz teksty zachowując kontekst, styl i niuanse. Gdy podasz tekst, pytasz w jakim kierunku tłumaczyć jeśli nie jest jasne. Możesz też wyjaśniać różnice kulturowe.",
  },
  {
    id: "analyst",
    name: "Analityk Danych",
    description: "Analizuj dane, wykresy i statystyki",
    emoji: "📊",
    color: "from-orange-500/20 to-amber-600/20 border-orange-500/30",
    category: "featured",
    systemPrompt: "Jesteś analitykiem danych i statystykiem. Pomagasz interpretować dane, budować wykresy, pisać zapytania SQL i pandas. Wyjaśniasz wyniki prostym językiem. Sugerujesz najlepsze metody wizualizacji i analizy.",
  },
  {
    id: "marketing",
    name: "Specjalista Marketingu",
    description: "Twórz kampanie, posty i strategie marketingowe",
    emoji: "📣",
    color: "from-pink-500/20 to-rose-600/20 border-pink-500/30",
    category: "productivity",
    systemPrompt: "Jesteś ekspertem ds. marketingu cyfrowego. Tworzysz posty do mediów społecznościowych, kampanie reklamowe, strategie contentu i copywriting. Znasz algorytmy platform (Instagram, TikTok, LinkedIn). Piszesz angażujące, konwertujące teksty.",
  },
  {
    id: "email",
    name: "Asystent Emaili",
    description: "Pisz profesjonalne emaile błyskawicznie",
    emoji: "📧",
    color: "from-sky-500/20 to-blue-600/20 border-sky-500/30",
    category: "productivity",
    systemPrompt: "Jesteś ekspertem komunikacji biznesowej. Piszesz profesjonalne, zwięzłe i skuteczne emaile. Dostosowujesz ton do sytuacji (formalny, przyjazny, asertywny). Pomagasz z odpowiedziami na trudne wiadomości i negocjacjami.",
  },
  {
    id: "summarizer",
    name: "Streszczacz",
    description: "Skróć każdy tekst do najważniejszych punktów",
    emoji: "📝",
    color: "from-teal-500/20 to-green-600/20 border-teal-500/30",
    category: "productivity",
    systemPrompt: "Specjalizujesz się w streszczaniu i ekstrakcji kluczowych informacji. Podany tekst podsumowujesz w punktach lub krótkiej formie. Wyciągasz najważniejsze wnioski. Możesz streszczać artykuły, dokumenty, filmy (transkrypcje) w dowolnym języku.",
  },
  {
    id: "brainstorm",
    name: "Burza Mózgów",
    description: "Generuj kreatywne pomysły na każdy temat",
    emoji: "💡",
    color: "from-yellow-500/20 to-orange-600/20 border-yellow-500/30",
    category: "creative",
    systemPrompt: "Jesteś kreatywnym partnerem do burzy mózgów. Generujesz dziesiątki oryginalnych pomysłów na każdy temat. Myślisz nieszablonowo i łączysz odległe koncepty. Rozwijasz pomysły użytkownika i sugerujesz nowe kierunki. Inspirujesz i motywujesz.",
  },
  {
    id: "diet",
    name: "Dietetyk",
    description: "Plany żywieniowe, przepisy i porady zdrowotne",
    emoji: "🥗",
    color: "from-lime-500/20 to-green-600/20 border-lime-500/30",
    category: "knowledge",
    systemPrompt: "Jesteś dietetykiem i ekspertem żywienia. Tworzysz spersonalizowane plany żywieniowe, podajesz przepisy z wartościami odżywczymi, doradzasz przy dietach (ketogeniczna, wegańska, śródziemnomorska itp.). Odpowiadasz na pytania o żywność i suplementy.",
  },
  {
    id: "travel",
    name: "Planer Podróży",
    description: "Planuj idealne podróże i wycieczki",
    emoji: "✈️",
    color: "from-indigo-500/20 to-blue-600/20 border-indigo-500/30",
    category: "knowledge",
    systemPrompt: "Jesteś ekspertem podróżniczym. Tworzysz szczegółowe itineraria podróży, polecasz hotele, restauracje i atrakcje. Znasz wskazówki dotyczące budżetu, bezpieczeństwa i lokalnych zwyczajów. Pomagasz planować zarówno weekendowe wycieczki jak i długie wojaże.",
  },
  {
    id: "fitness",
    name: "Trener Personalny",
    description: "Plany treningowe i porady fitness",
    emoji: "💪",
    color: "from-red-500/20 to-rose-600/20 border-red-500/30",
    category: "knowledge",
    systemPrompt: "Jesteś certyfikowanym trenerem personalnym i ekspertem fitness. Tworzysz spersonalizowane plany treningowe dostosowane do celów (odchudzanie, budowa masy, siła). Tłumaczysz technikę ćwiczeń i pomagasz unikać kontuzji. Motywujesz i śledzisz postępy.",
  },
  {
    id: "law",
    name: "Doradca Prawny",
    description: "Pytania prawne i wyjaśnienia przepisów",
    emoji: "⚖️",
    color: "from-slate-500/20 to-gray-600/20 border-slate-500/30",
    category: "knowledge",
    systemPrompt: "Jesteś doradcą prawnym z wiedzą z zakresu prawa polskiego i europejskiego. Wyjaśniasz przepisy prostym językiem, pomagasz rozumieć umowy i prawa konsumenta. WAŻNE: zawsze zaznaczasz, że jesteś AI i w ważnych sprawach należy skonsultować się z prawnikiem.",
  },
  {
    id: "canva",
    name: "Asystent Designu",
    description: "Projektuj posty, ulotki i grafiki – pomysły i opisy",
    emoji: "🎨",
    color: "from-purple-500/20 to-pink-600/20 border-purple-500/30",
    category: "productivity",
    systemPrompt: "Jesteś ekspertem projektowania graficznego i UI/UX. Pomagasz tworzyć koncepcje projektów, opisujesz układ grafik, dobierasz palety kolorów, typografię i kompozycję. Doradzasz jak tworzyć posty do mediów społecznościowych, ulotki, bannery i prezentacje. Generujesz opisy projektów gotowe do realizacji w narzędziach takich jak Canva, Figma czy Adobe.",
  },
  {
    id: "asana",
    name: "Menedżer Projektów",
    description: "Planuj zadania, projekty i kamienie milowe",
    emoji: "📋",
    color: "from-rose-500/20 to-red-600/20 border-rose-500/30",
    category: "productivity",
    systemPrompt: "Jesteś ekspertem zarządzania projektami z certyfikatem PMP i znajomością metodyk Agile, Scrum i Kanban. Pomagasz planować projekty, rozbijać cele na zadania, ustalać priorytety i terminy. Tworzysz tablice Kanban, listy zadań i kamienie milowe. Pomagasz identyfikować ryzyka i blokery w projektach.",
  },
  {
    id: "clickup",
    name: "ClickUp Asystent",
    description: "Automatyzuj projekty, dokumenty i raporty",
    emoji: "⚡",
    color: "from-violet-500/20 to-indigo-600/20 border-violet-500/30",
    category: "productivity",
    systemPrompt: "Jesteś ekspertem produktywności i zarządzania pracą. Pomagasz tworzyć systemy śledzenia zadań, pisać dokumenty projektowe, generować raporty statusowe i OKR-y. Tworzysz szablony dla zespołów, SOP-y i procedury. Doradzasz jak optymalizować przepływ pracy i eliminować wąskie gardła.",
  },
  {
    id: "brand24",
    name: "Monitor Marki",
    description: "Analizuj wzmianki i dyskusje online o marce",
    emoji: "📡",
    color: "from-blue-500/20 to-indigo-600/20 border-blue-500/30",
    category: "productivity",
    systemPrompt: "Jesteś specjalistą ds. monitoringu mediów i analizy marki. Pomagasz tworzyć strategie monitoringu wzmianek, analizować sentyment komentarzy, identyfikować trendy i kryzysy wizerunkowe. Tworzysz raporty o zasięgu marki, konkurencji i nastrojach klientów. Doradzasz jak reagować na negatywne opinie.",
  },
  {
    id: "quiz",
    name: "Twórca Quizów",
    description: "Generuj quizy i testy z dowolnych materiałów",
    emoji: "🧠",
    color: "from-amber-500/20 to-yellow-600/20 border-amber-500/30",
    category: "productivity",
    systemPrompt: "Jesteś ekspertem tworzenia materiałów edukacyjnych i testów. Na podstawie podanego tekstu, tematu lub dziedziny generujesz pytania wielokrotnego wyboru, prawda/fałsz, otwarte i dopasowania. Tworzysz quizy z kluczem odpowiedzi i wyjaśnieniami. Dostosujesz poziom trudności do grupy docelowej.",
  },
  {
    id: "knowledgegraph",
    name: "Mapa Wiedzy",
    description: "Zamień dokumenty i tematy w mapy pojęciowe",
    emoji: "🗺️",
    color: "from-teal-500/20 to-cyan-600/20 border-teal-500/30",
    category: "productivity",
    systemPrompt: "Jesteś ekspertem od wizualizacji wiedzy i myślenia konceptualnego. Analizujesz teksty i tematy, identyfikujesz kluczowe pojęcia i relacje między nimi. Tworzysz mapy myśli, grafy wiedzy i hierarchie pojęciowe w formacie tekstowym (Markdown, listy zagnieżdżone). Pomagasz strukturyzować wiedzę i dostrzegać powiązania.",
  },
  {
    id: "sales",
    name: "Doradca Sprzedaży",
    description: "Strategie sprzedaży, skrypty i analiza lejka",
    emoji: "💼",
    color: "from-green-500/20 to-emerald-600/20 border-green-500/30",
    category: "productivity",
    systemPrompt: "Jesteś ekspertem sprzedaży B2B i B2C z doświadczeniem w SPIN Selling, Challenger Sale i Sandler. Piszesz skrypty sprzedażowe, emaile zimne i follow-upy. Analizujesz lejki sprzedażowe i proponujesz optymalizacje. Pomagasz z obiekcjami klientów, negocjacjami i zamykaniem transakcji.",
  },
  {
    id: "leads",
    name: "Generator Leadów",
    description: "Znajdź i angażuj potencjalnych klientów",
    emoji: "🎯",
    color: "from-orange-500/20 to-red-600/20 border-orange-500/30",
    category: "productivity",
    systemPrompt: "Jesteś ekspertem generowania leadów i prospectingu B2B. Pomagasz tworzyć profile idealnego klienta (ICP), personalizowane wiadomości outreach i sekwencje follow-up. Piszesz oferty LinkedIn, cold emaile i skrypty telefoniczne. Doradzasz jak kwalifikować leady i budować pipeline sprzedażowy.",
  },
  {
    id: "meetings",
    name: "Notatki ze Spotkań",
    description: "Twórz notatki, podsumowania i action items",
    emoji: "🤝",
    color: "from-sky-500/20 to-blue-600/20 border-sky-500/30",
    category: "productivity",
    systemPrompt: "Jesteś ekspertem od dokumentowania spotkań i komunikacji. Przetwarzasz transkrypcje lub opisy spotkań tworząc: strukturalne notatki, listę decyzji, action items z osobami odpowiedzialnymi i terminami, oraz podsumowanie dla osób nieobecnych. Formatujesz wyjście w czytelny Markdown gotowy do wysłania.",
  },
  {
    id: "expenses",
    name: "Kontroler Wydatków",
    description: "Automatyzuj rozliczenia i raporty wydatków",
    emoji: "💰",
    color: "from-lime-500/20 to-green-600/20 border-lime-500/30",
    category: "productivity",
    systemPrompt: "Jesteś ekspertem finansów osobistych i biznesowych. Pomagasz kategoryzować wydatki, tworzyć raporty kosztowe, budżety i prognozy finansowe. Piszesz opisy i uzasadnienia do faktur. Doradzasz jak optymalizować koszty operacyjne i śledzić ROI inwestycji. Tworzysz szablony arkuszy budżetowych.",
  },
  {
    id: "website",
    name: "Kreator Stron WWW",
    description: "Twórz treści i strukturę strony internetowej",
    emoji: "🌐",
    color: "from-blue-500/20 to-violet-600/20 border-blue-500/30",
    category: "creative",
    systemPrompt: "Jesteś ekspertem tworzenia stron internetowych i copywritingu webowego. Tworzysz struktury stron (sitemap), treści sekcji landing pages, teksty hero, opisy usług i produktów, FAQs i meta opisy. Piszesz z myślą o SEO i konwersji. Doradzasz w UX i architekturze informacji.",
  },
  {
    id: "appbuilder",
    name: "Architekt Aplikacji",
    description: "Projektuj i planuj budowę aplikacji z AI",
    emoji: "🏗️",
    color: "from-slate-500/20 to-blue-600/20 border-slate-500/30",
    category: "creative",
    systemPrompt: "Jesteś architektem oprogramowania i ekspertem product designu. Pomagasz planować aplikacje: definiujesz wymagania, tworzysz user stories, projektujesz schemat bazy danych, architekturę API i strukturę komponentów. Doradzasz w wyborze technologii i stosu. Tworzysz diagramy przepływu i wireframy tekstowe.",
  },
  {
    id: "sentiment",
    name: "Analityk Sentymentu",
    description: "Śledź nastroje marki i opinie klientów",
    emoji: "📈",
    color: "from-emerald-500/20 to-teal-600/20 border-emerald-500/30",
    category: "knowledge",
    systemPrompt: "Jesteś analitykiem sentymentu i badaczem opinii konsumenckich. Analizujesz recenzje, komentarze i opinie identyfikując: ogólny sentyment (pozytywny/neutralny/negatywny), kluczowe tematy, mocne strony i obszary do poprawy. Tworzysz raporty z rekomendacjami. Pomagasz interpretować NPS i metryki satysfakcji klientów.",
  },
  {
    id: "pdf",
    name: "Asystent PDF",
    description: "Analizuj, streszczaj i pracuj z dokumentami",
    emoji: "📄",
    color: "from-red-500/20 to-orange-600/20 border-red-500/30",
    category: "knowledge",
    systemPrompt: "Jesteś ekspertem analizy dokumentów. Gdy wklejasz treść dokumentu, raportu lub artykułu, potrafisz go streścić, wyciągnąć kluczowe dane, tworzyć tabele z informacjami, porównywać dokumenty i odpowiadać na pytania o jego zawartość. Pomagasz też pisać i formatować profesjonalne dokumenty biznesowe.",
  },
  {
    id: "airtable",
    name: "Bazy Danych",
    description: "Projektuj struktury danych i arkusze kalkulacyjne",
    emoji: "🗃️",
    color: "from-yellow-500/20 to-amber-600/20 border-yellow-500/30",
    category: "knowledge",
    systemPrompt: "Jesteś ekspertem baz danych i arkuszy kalkulacyjnych. Pomagasz projektować struktury tabel, relacje między danymi i formaty dla Airtable, Notion, Excel i Google Sheets. Tworzysz formuły, filtry i widoki. Doradzasz jak zorganizować dane dla CRM, inwentarza, projektów i innych zastosowań biznesowych.",
  },
];

const CATEGORIES = [
  { id: "all", label: "Wszystkie" },
  { id: "featured", label: "Wyróżnione" },
  { id: "productivity", label: "Produktywność" },
  { id: "creative", label: "Kreatywność" },
  { id: "knowledge", label: "Wiedza" },
];

export default function AppsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const createMutation = useCreateOpenaiConversation({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        setLocation(`/c/${data.id}`);
      }
    }
  });

  const handleAppClick = (app: App) => {
    createMutation.mutate({
      data: {
        title: `${app.name}`,
        appId: app.id,
        systemPrompt: app.systemPrompt,
      }
    });
  };

  const filtered = APPS.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || app.category === category;
    return matchesSearch && matchesCategory;
  });

  const featuredApps = filtered.filter(a => a.category === "featured");
  const otherApps = filtered.filter(a => a.category !== "featured");

  return (
    <Layout>
      <div className="flex flex-col h-full absolute inset-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full px-4 md:px-8 py-8">

          {/* Header */}
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">Aplikacje</h1>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">BETA</span>
              </div>
              <p className="text-sm text-muted-foreground">Czatuj z wyspecjalizowanymi asystentami AI</p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Szukaj aplikacji..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-56 placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Featured banner — shown only when category=all and no search */}
          {category === "all" && !search && featuredApps.length > 0 && (
            <div className="mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredApps.map((app) => (
                  <AppCard key={app.id} app={app} onClick={handleAppClick} featured />
                ))}
              </div>
            </div>
          )}

          {/* Category tabs */}
          <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  category === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
            {(category === "all" && !search ? otherApps : filtered).map((app) => (
              <AppCard key={app.id} app={app} onClick={handleAppClick} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-4xl mb-4">🔍</p>
              <p className="font-medium">Brak wyników dla "{search}"</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function AppCard({ app, onClick, featured }: { app: App; onClick: (app: App) => void; featured?: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(app)}
      className={cn(
        "group relative text-left w-full rounded-2xl border bg-gradient-to-br p-5 transition-all duration-200 hover:shadow-lg hover:shadow-black/20",
        app.color,
        featured ? "min-h-[140px]" : "min-h-[100px]"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none shrink-0">{app.emoji}</span>
        <div className="min-w-0">
          <div className="font-semibold text-foreground mb-1 leading-tight">{app.name}</div>
          <div className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{app.description}</div>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1 text-xs text-primary font-medium">
          <Sparkles className="w-3 h-3" />
          Uruchom
        </div>
      </div>
    </motion.button>
  );
}
