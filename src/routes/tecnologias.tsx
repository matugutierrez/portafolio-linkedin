import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { TechLogo } from "@/components/tech-badges";
import { inferTechCategory } from "@/lib/tech-icons";
import { useState } from "react";

export const Route = createFileRoute("/tecnologias")({
  head: () => ({ meta: [{ title: "Tecnologías — Matías Gutiérrez" }, { name: "description", content: "Tecnologías dominadas." }] }),
  component: Tecnologias,
});

const CAT_LABELS_ES: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  devops: "DevOps / Cloud",
  design: "Diseño",
  tools: "Herramientas",
  ai: "IA",
};
const CAT_LABELS_EN: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  devops: "DevOps / Cloud",
  design: "Design",
  tools: "Tools",
  ai: "AI",
};

function Tecnologias() {
  const { t, lang } = useI18n();
  const { data } = useQuery({
    queryKey: ["tech"],
    queryFn: async () => (await supabase.from("technologies").select("*").order("display_order")).data ?? [],
  });
  const [filter, setFilter] = useState<string>("all");
  const list = data ?? [];
  const labels = lang === "es" ? CAT_LABELS_ES : CAT_LABELS_EN;
  const grouped = list.reduce<Record<string, any[]>>((acc, tech) => {
    const c = inferTechCategory(tech.name);
    (acc[c] ||= []).push(tech);
    return acc;
  }, {});
  const cats = Object.keys(grouped);
  const filtered = filter === "all" ? list : grouped[filter] ?? [];

  return (
    <SiteLayout>
      <div className="flex items-center gap-2 text-xs font-mono text-green-400/80 uppercase tracking-widest">
        <span className="size-1.5 rounded-full bg-green-300 animate-pulse" /> {t.nav.tech}
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold mt-2">
        {lang === "es" ? "Tecnologías" : "Technologies"}
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        {lang === "es"
          ? `${list.length} tecnologías`
          : `${list.length} technologies`}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-md text-xs border transition ${
            filter === "all"
              ? "bg-green-500/15 text-green-300 border-green-400/40"
              : "bg-card text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          {lang === "es" ? "Todos" : "All"} <span className="opacity-50">({list.length})</span>
        </button>
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-md text-xs border transition ${
              filter === c
                ? "bg-green-500/15 text-green-300 border-green-400/40"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {labels[c] ?? c} <span className="opacity-50">({grouped[c].length})</span>
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {filtered.map((tech) => (
          <div
            key={tech.id}
            className="group relative rounded-xl border border-border bg-card/60 p-4 flex flex-col items-center gap-3 hover:border-green-400/40 hover:bg-card hover:-translate-y-0.5 transition-all"
          >
            <TechLogo name={tech.name} src={tech.icon_url} size={40} />
            <div className="text-xs text-center truncate w-full">{tech.name}</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-12">
            {lang === "es" ? "Sin resultados" : "No results"}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}