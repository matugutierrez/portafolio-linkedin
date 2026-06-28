import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { ProjectCard } from "@/components/project-card";
import { SiteLayout } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/proyectos")({
  head: () => ({
    meta: [
      { title: "Proyectos — Matías Gutiérrez" },
      { name: "description", content: "Portfolio de proyectos full stack." },
    ],
  }),
  component: Proyectos,
});

function Proyectos() {
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState<string>("all");
  const { data: projects } = useQuery({
    queryKey: ["projects", "all"],
    queryFn: async () => (await supabase.from("projects").select("*").order("display_order")).data ?? [],
  });
  const filters = [
    { id: "all", label: t.sections.all },
    { id: "web", label: t.sections.web },
    { id: "mobile", label: t.sections.mobile },
    { id: "ecommerce", label: t.sections.ecommerce },
    { id: "dashboard", label: t.sections.dashboard },
    { id: "api", label: t.sections.api },
  ];
  const list = (projects ?? []).filter((p) => filter === "all" || p.category === filter);

  return (
    <SiteLayout>
      <div className="text-foreground text-sm uppercase tracking-widest font-medium">{t.nav.projects}</div>
      <h1 className="text-4xl sm:text-5xl font-bold mt-2">{t.sections.featuredTitle}</h1>
      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-sm transition ${
              filter === f.id
                ? "bg-gradient-to-r from-green-600 to-green-700 text-white"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} variant="default" />
        ))}
      </div>
    </SiteLayout>
  );
}