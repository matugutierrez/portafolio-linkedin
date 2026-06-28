import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contacto")({
  head: () => ({ meta: [{ title: "Contacto — Matías Gutiérrez" }, { name: "description", content: "Escríbeme para colaborar." }] }),
  component: Contacto,
});

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(5).max(2000),
});

function Contacto() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    setLoading(false);
    if (error) {
      toast.error(t.contact.error);
    } else {
      toast.success(t.contact.sent);
      setForm({ name: "", email: "", subject: "", message: "" });
    }
  };

  return (
    <SiteLayout>
      <div className="text-foreground text-sm uppercase tracking-widest font-medium">{t.nav.contact}</div>
      <h1 className="text-4xl sm:text-5xl font-bold mt-2">{t.contact.title}</h1>
      <p className="mt-2 text-muted-foreground">{t.contact.subtitle}</p>

      <form onSubmit={submit} className="mt-8 max-w-xl space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.contact.name} className="bg-card border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t.contact.email} className="bg-card border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20" />
        </div>
        <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder={t.contact.subject} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20" />
        <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t.contact.message} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20" />
        <Button type="submit" disabled={loading} className="bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90 text-white border-0 gap-2">
          <Send className="size-4" />
          {t.contact.send}
        </Button>
      </form>
    </SiteLayout>
  );
}