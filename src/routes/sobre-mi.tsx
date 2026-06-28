import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export const Route = createFileRoute("/sobre-mi")({
  head: () => ({
    meta: [
      { title: "Sobre mí — Matías Gutiérrez" },
      { name: "description", content: "Conoce a Matías Gutiérrez, desarrollador full stack." },
    ],
  }),
  component: SobreMi,
});

function SobreMi() {
  const { t, lang } = useI18n();
  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await supabase.from("profiles").select("*").limit(1).maybeSingle()).data,
  });
  return (
    <SiteLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
        <div className="text-foreground text-sm uppercase tracking-widest font-medium">{t.nav.about}</div>
        <h1 className="text-4xl sm:text-5xl font-bold mt-2">{data?.name}</h1>
        <p className="mt-2 text-xl text-muted-foreground">{lang === "es" ? data?.title_es : data?.title_en}</p>
        <div className="prose prose-invert mt-8 text-foreground/90 leading-relaxed">
          <p>{lang === "es" ? data?.bio_es : data?.bio_en}</p>
          <p className="mt-4 text-muted-foreground">
            {lang === "es"
              ? "Mi pasión es construir productos digitales que combinan diseño cuidado, código limpio y experiencias excepcionales. Trabajo con stacks modernos enfocados en escalabilidad y mantenibilidad."
              : "My passion is building digital products that combine careful design, clean code and exceptional experiences. I work with modern stacks focused on scalability and maintainability."}
          </p>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Email</div>
            <div className="mt-1 font-medium">{data?.email ?? "—"}</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground uppercase tracking-widest">{lang === "es" ? "Ubicación" : "Location"}</div>
            <div className="mt-1 font-medium">{data?.location ?? "—"}</div>
          </div>
        </div>
      </motion.div>
    </SiteLayout>
  );
}