import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { formatDateRange } from "@/lib/utils-format";
import { motion } from "framer-motion";

export const Route = createFileRoute("/experiencia")({
  head: () => ({ meta: [{ title: "Experiencia — Matías Gutiérrez" }, { name: "description", content: "Trayectoria profesional." }] }),
  component: Experiencia,
});

function Experiencia() {
  const { t, lang } = useI18n();
  const { data } = useQuery({
    queryKey: ["experiences"],
    queryFn: async () => (await supabase.from("experiences").select("*").order("display_order")).data ?? [],
  });
  return (
    <SiteLayout>
      <div className="text-foreground text-sm uppercase tracking-widest font-medium">{t.nav.experience}</div>
      <h1 className="text-4xl sm:text-5xl font-bold mt-2">{lang === "es" ? "Trayectoria profesional" : "Professional journey"}</h1>
      <div className="mt-10 relative pl-8 border-l border-border space-y-8">
        {(data ?? []).map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="relative"
          >
            <div className="absolute -left-[34px] top-1 size-3 rounded-full bg-green-700 ring-4 ring-background" />
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="size-3.5" /> {e.company}
                {e.location && <span>· {e.location}</span>}
              </div>
              <div className="mt-1 text-xl font-semibold">{lang === "es" ? e.role_es : e.role_en}</div>
              <div className="text-xs text-muted-foreground mt-1">{formatDateRange(e.start_date, e.end_date, lang)}</div>
              <p className="mt-3 text-sm text-muted-foreground">{lang === "es" ? e.description_es : e.description_en}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SiteLayout>
  );
}