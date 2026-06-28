import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, User } from "lucide-react";
import { CvDownload } from "@/components/cv-download";
import { ProjectCard } from "@/components/project-card";
import { OsTerminal } from "@/components/os-terminal";
import { SiteLayout } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Matías Gutiérrez — Full Stack Developer" },
      { name: "description", content: "Portfolio del desarrollador full stack Matías Gutiérrez. Aplicaciones web modernas, escalables y de alto rendimiento." },
      { property: "og:title", content: "Matías Gutiérrez — Full Stack Developer" },
      { property: "og:description", content: "Portfolio del desarrollador full stack Matías Gutiérrez." },
    ],
  }),
  component: Index,
});

function Index() {
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState<string>("all");

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: projects } = useQuery({
    queryKey: ["projects", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("featured", true)
        .order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const filters = [
    { id: "all", label: t.sections.all },
    { id: "web", label: t.sections.web },
    { id: "mobile", label: t.sections.mobile },
    { id: "ecommerce", label: t.sections.ecommerce },
    { id: "dashboard", label: t.sections.dashboard },
    { id: "api", label: t.sections.api },
  ];

  const filtered = (projects ?? []).filter((p) => filter === "all" || p.category === filter);

  return (
    <SiteLayout>
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-400/20 text-green-400 text-xs">
          <span className="size-2 rounded-full bg-green-300 animate-pulse" />
          {t.hero.available}
        </div>
        <CvDownload variant="hero" />
      </div>

      {/* Hero */}
      <section className="grid gap-10 items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-3xl">
          <div className="text-foreground font-medium mb-2">{t.hero.hello}</div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
            {profile?.name ?? "Matías Gutiérrez"}
          </h1>
          <h2 className="mt-4 text-2xl sm:text-3xl font-semibold">
            <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              {lang === "es" ? profile?.title_es : profile?.title_en}
            </span>
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed max-w-xl">
            {lang === "es" ? profile?.bio_es : profile?.bio_en}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/proyectos">
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90 text-white border-0 gap-2">
                {t.hero.viewProjects} <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/sobre-mi">
              <Button variant="outline" className="gap-2">
                {t.hero.aboutMe} <User className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Unified OS terminal (PowerShell / macOS) */}
      <OsTerminal
        years={profile?.years_experience ?? 2}
        projects={profile?.projects_count ?? 20}
        tech={profile?.technologies_count ?? 15}
        techList={((profile as any)?.featured_technologies ?? []) as string[]}
        commitment="+100%"
        labels={t.stats}
      />

      {/* Featured projects */}
      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-foreground font-medium">{t.sections.featured}</div>
            <h2 className="text-3xl font-bold mt-1">{t.sections.featuredTitle}</h2>
          </div>
          <Link to="/proyectos">
            <Button variant="outline" size="sm" className="gap-2">
              {t.sections.viewAll} <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} variant="compact" />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
