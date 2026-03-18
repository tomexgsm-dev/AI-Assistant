import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { useI18n } from "@/i18n";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4 max-w-md px-4">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
        <h1 className="text-3xl font-bold">{t.notFound.title}</h1>
        <p className="text-muted-foreground">{t.notFound.subtitle}</p>
        <Link href="/" className="inline-block mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity">
          {t.notFound.backHome}
        </Link>
      </div>
    </div>
  );
}
