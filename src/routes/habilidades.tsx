import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/habilidades")({
  head: () => ({ meta: [{ title: "Habilidades — Matías Gutiérrez" }, { name: "description", content: "Habilidades técnicas." }] }),
  component: Habilidades,
});

const CAT_META: Record<string, { es: string; en: string }> = {
  frontend: { es: "Frontend", en: "Frontend" },
  backend: { es: "Backend", en: "Backend" },
  devops: { es: "DevOps / Cloud", en: "DevOps / Cloud" },
  design: { es: "Diseño", en: "Design" },
  tools: { es: "Herramientas", en: "Tools" },
  soft: { es: "Blandas", en: "Soft Skills" },
  management: { es: "Gestión", en: "Management" },
  ai: { es: "IA", en: "AI" },
};

function Habilidades() {
  const { t, lang } = useI18n();
  const { data } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => (await supabase.from("skills").select("*").order("display_order")).data ?? [],
  });
  const grouped = (data ?? []).reduce<Record<string, typeof data>>((acc, s) => {
    if (!s) return acc;
    (acc[s.category] ||= [] as any).push(s);
    return acc;
  }, {});

  return (
    <SiteLayout>
      <div className="px-4 sm:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <div className="font-mono text-xs uppercase tracking-widest text-primary">{t.nav.skills}</div>
          <h1 className="mt-3 font-display font-bold uppercase tracking-tight leading-[0.95] text-[clamp(2.5rem,7vw,5.5rem)]">
            {lang === "es" ? "Habilidades" : "Skills"}
          </h1>
          <p className="mt-4 text-base text-muted-foreground max-w-2xl leading-relaxed">
            {lang === "es" ? "Capacidades personales y técnicas organizadas como en un CV profesional, con el mismo lenguaje visual del portfolio." : "Personal and technical capabilities organized like a professional CV, with the same visual language as the portfolio."}
          </p>
        </motion.div>
        <div className="mt-12 space-y-6">
          {Object.entries(grouped).map(([cat, items], idx) => {
            const meta = CAT_META[cat] ?? { es: cat, en: cat };
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                <div className="flex items-baseline justify-between px-6 py-4 border-b border-border bg-card">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-primary tracking-widest">{String(idx + 1).padStart(2, "0")}</span>
                    <span className="font-display font-bold uppercase tracking-tight text-base">{lang === "es" ? meta.es : meta.en}</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{(items ?? []).length} {lang === "es" ? "habilidades" : "skills"}</span>
                </div>
                <div className="divide-y divide-border">
                  {(items ?? []).map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between gap-4 px-6 py-4">
                      <div className="min-w-0">
                        <div className="font-medium text-sm tracking-tight">{s.name}</div>
                        <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-1">{s.category}</div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden sm:block w-24 h-1.5 rounded-full bg-border overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, Number(s.level) || 0))}%` }} />
                        </div>
                        <span className="font-mono text-xs text-muted-foreground w-8 text-right">{s.level}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
          {(data ?? []).length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              {lang === "es" ? "Aún no hay habilidades cargadas." : "No skills yet."}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
