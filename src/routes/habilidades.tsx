import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { TechLogo } from "@/components/tech-badges";

export const Route = createFileRoute("/habilidades")({
  head: () => ({ meta: [{ title: "Habilidades — Matías Gutiérrez" }, { name: "description", content: "Habilidades técnicas." }] }),
  component: Habilidades,
});

const CAT_META: Record<string, { es: string; en: string; tag: string }> = {
  frontend: { es: "Frontend", en: "Frontend", tag: "ui" },
  backend: { es: "Backend", en: "Backend", tag: "srv" },
  devops: { es: "DevOps / Cloud", en: "DevOps / Cloud", tag: "ops" },
  design: { es: "Diseño", en: "Design", tag: "dsg" },
  tools: { es: "Herramientas", en: "Tools", tag: "tool" },
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
      <div className="flex items-center gap-2 text-xs font-mono text-green-400/80 uppercase tracking-widest">
        <span className="size-1.5 rounded-full bg-green-300 animate-pulse" /> {t.nav.skills}
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold mt-2 font-mono">
        <span className="text-green-400">$</span> stack --tree
      </h1>
      <p className="text-muted-foreground mt-2 text-sm font-mono">
        {lang === "es"
          ? `// agrupado automáticamente por categoría`
          : `// auto-grouped by category`}
      </p>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        {Object.entries(grouped).map(([cat, items]) => {
          const meta = CAT_META[cat] ?? { es: cat, en: cat, tag: cat.slice(0, 3) };
          return (
            <div
              key={cat}
              className="rounded-xl border border-border bg-card/60 overflow-hidden hover:border-green-400/30 transition"
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/60 bg-black/40">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-green-300" />
                  <span className="font-mono text-xs uppercase tracking-widest text-green-300">
                    {lang === "es" ? meta.es : meta.en}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground/60">
                  ~/{meta.tag} · {(items ?? []).length}
                </span>
              </div>
              <div className="p-3 flex flex-wrap gap-2">
                {(items ?? []).map((s: any) => (
                  <div
                    key={s.id}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border/70 bg-background/60 hover:border-green-400/40 transition"
                  >
                    <TechLogo name={s.name} size={16} />
                    <span className="font-mono text-xs">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </SiteLayout>
  );
}