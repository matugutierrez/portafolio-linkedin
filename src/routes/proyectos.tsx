import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TechBadges } from "@/components/tech-badges";
import { SiteLayout } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

const ease = [0.22, 1, 0.36, 1] as const;

export const Route = createFileRoute("/proyectos")({
  head: () => ({
    meta: [
      { title: "Proyectos — Matías Gutiérrez" },
      { name: "description", content: "Portfolio de proyectos full stack." },
    ],
  }),
  component: Proyectos,
});

function CardMedia({ project, hovered }: { project: any; hovered: boolean }) {
  if (project.video_url) {
    return (
      <motion.video
        src={project.video_url}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        animate={{ scale: hovered ? 1.05 : 1 }}
        transition={{ duration: 0.8, ease }}
      />
    );
  }
  if (project.cover_url) {
    return (
      <motion.img
        src={project.cover_url}
        alt={project.title}
        className="absolute inset-0 w-full h-full object-cover"
        animate={{ scale: hovered ? 1.05 : 1 }}
        transition={{ duration: 0.8, ease }}
      />
    );
  }
  return <div className="absolute inset-0 bg-secondary" />;
}

function MobileDivider({ index, total }: { index: number; total: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease }}
      className="sm:hidden flex items-center gap-3 py-1"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border" />
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2 shrink-0">
        <span className="size-1 rounded-full bg-primary animate-pulse" />
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border" />
    </motion.div>
  );
}

function BentoCard({ project, index, catLabel, hero }: { project: any; index: number; catLabel: string; hero: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const { t, lang } = useI18n();
  const initials = (project.title ?? "").replace(/[^a-zA-Z0-9 ]/g, "").trim().slice(0, 2).toUpperCase();
  const shortDescs = { es: project.description_es, en: project.description_en };
  const longDescs = { es: project.long_description_es, en: project.long_description_en };
  const shortDesc = shortDescs[lang] ?? null;
  const longDesc = longDescs[lang] ?? shortDesc;
  const stack = Array.isArray(project.stack) ? (project.stack as string[]) : [];
  const num = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 2) * 0.08, ease }}
      className={hero ? "col-span-full relative" : "relative"}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label={t.sections.expand}
            className={`group relative block w-full text-left overflow-hidden rounded-[26px] bg-secondary cursor-pointer ${
              hero ? "aspect-[16/8] sm:aspect-[16/6]" : "aspect-[4/3.2] sm:aspect-[4/2.8]"
            }`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
        <CardMedia project={project} hovered={hovered} />

        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        <motion.div
          className="absolute inset-0 bg-black pointer-events-none"
          animate={{ opacity: hovered ? 0.12 : 0 }}
          transition={{ duration: 0.4 }}
        />

        <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 flex items-center gap-3">
          {initials && (
            <div className="size-10 sm:size-11 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-white text-xs sm:text-sm">{initials}</span>
            </div>
          )}
          <div className="leading-tight">
            {project.title && (
              <div className="text-white font-semibold text-sm sm:text-base drop-shadow">{project.title}</div>
            )}
            {catLabel && (
              <motion.div
                className="text-white/60 text-xs sm:text-sm"
                animate={{ y: hovered ? 0 : 2, opacity: hovered ? 1 : 0.75 }}
                transition={{ duration: 0.35 }}
              >
                {catLabel}
              </motion.div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {hovered && Array.isArray(project.stack) && project.stack.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.4, ease }}
              className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 hidden sm:flex flex-wrap justify-end gap-1.5 max-w-[45%] pointer-events-none"
            >
              {(project.stack as string[]).slice(0, 4).map((s) => (
                <span key={s} className="font-mono text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full bg-black/50 backdrop-blur border border-white/20 text-white/90">
                  {s}
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {project.demo_url && (
          <div className="absolute top-5 left-5 sm:top-6 sm:left-6 pointer-events-none">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur border border-white/15 px-3 py-1.5 text-xs font-mono text-white">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Live
            </div>
          </div>
        )}
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="font-mono text-xs text-primary tracking-widest">{num}</div>
            <DialogTitle className="font-display text-2xl tracking-tight">{project.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <div className="relative">
              {project.video_url ? (
                <video
                  src={project.video_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full rounded-lg border border-border"
                />
              ) : project.cover_url ? (
                <img
                  src={project.cover_url}
                  alt={project.title}
                  className="w-full rounded-lg border border-border"
                />
              ) : null}
              {(project.demo_url || project.repo_url) && (
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t.sections.visit}
                      className="size-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
                    >
                      <ArrowUpRight className="size-5" />
                    </a>
                  )}
                  {project.repo_url && (
                    <a
                      href={project.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t.sections.repo}
                      className="size-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
                    >
                      <Github className="size-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
            <p className="mt-4 text-base leading-relaxed text-foreground whitespace-pre-line">
              {longDesc}
            </p>
            {stack.length > 0 && (
              <div className="mt-4">
                <TechBadges stack={stack} size={22} />
              </div>
            )}
            {project.has_readme && (
              <Link
                to="/proyectos/$slug/readme"
                params={{ slug: project.slug }}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wide text-muted-foreground hover:text-foreground transition"
              >
                README
              </Link>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {shortDesc && (
        <div className="mt-3 flex items-start gap-3 px-1 pb-1">
          <span className="font-mono text-xs text-primary tracking-widest shrink-0 pt-0.5">{num}</span>
          <p className="text-sm leading-relaxed text-white/85">{shortDesc}</p>
        </div>
      )}
      {(project.demo_url || project.repo_url) && (
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex flex-col gap-2 z-10">
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.sections.visit}
              className="size-10 sm:size-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
            >
              <ArrowUpRight className="size-5" />
            </a>
          )}
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.sections.repo}
              className="size-10 sm:size-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
            >
              <Github className="size-5" />
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

function Proyectos() {
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState<string>("all");
  const { data: projects } = useQuery({
    queryKey: ["projects", "all"],
    queryFn: async () => (await supabase.from("projects").select("*").order("display_order")).data ?? [],
  });
  const filters = [
  ];
  const catLabel = (id: string) => filters.find((f) => f.id === id)?.label ?? id;
  const list = (projects ?? []).filter((p) => filter === "all" || p.category === filter);

  return (
    <SiteLayout>
      <div className="px-4 sm:px-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
          <div className="font-mono text-xs uppercase tracking-widest text-primary">{t.nav.projects}</div>
          <h1 className="mt-3 font-display font-bold uppercase tracking-tight leading-[0.95] text-[clamp(2.5rem,8vw,6.5rem)]">
            {lang === "es" ? "Mirá mis últimos trabajos" : "Take a look at my latest works"}
          </h1>
          <div className="mt-2 font-mono text-sm text-muted-foreground">({list.length})</div>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
          {list.map((p, i) => (
            <Fragment key={p.id}>
              <BentoCard project={p} index={i} catLabel={catLabel(p.category)} hero={i === 0} />
              {i < list.length - 1 && <MobileDivider index={i} total={list.length} />}
            </Fragment>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
