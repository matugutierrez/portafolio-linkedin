import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { formatDateRange } from "@/lib/utils-format";

export const Route = createFileRoute("/educacion")({
  head: () => ({ meta: [{ title: "Educación — Matías Gutiérrez" }, { name: "description", content: "Formación académica." }] }),
  component: Educacion,
});

function Educacion() {
  const { t, lang } = useI18n();
  const { data } = useQuery({
    queryKey: ["education"],
    queryFn: async () => (await supabase.from("education").select("*").order("display_order")).data ?? [],
  });
  return (
    <SiteLayout>
      <div className="text-foreground text-sm uppercase tracking-widest font-medium">{t.nav.education}</div>
      <h1 className="text-4xl sm:text-5xl font-bold mt-2">{lang === "es" ? "Formación académica" : "Academic background"}</h1>
      <div className="mt-10 grid md:grid-cols-2 gap-5">
        {(data ?? []).map((e) => (
          <div key={e.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <GraduationCap className="size-4" /> {e.institution}
            </div>
            <div className="mt-1 text-lg font-semibold">{lang === "es" ? e.degree_es : e.degree_en}</div>
            <div className="text-xs text-muted-foreground mt-1">{formatDateRange(e.start_date, e.end_date, lang)}</div>
            {(e.description_es || e.description_en) && (
              <p className="mt-3 text-sm text-muted-foreground">{lang === "es" ? e.description_es : e.description_en}</p>
            )}
          </div>
        ))}
      </div>
    </SiteLayout>
  );
}