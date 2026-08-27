import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Save, X } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/image-upload";
import { techIconUrl, resolveTech } from "@/lib/tech-icons";

export const Route = createFileRoute("/_authenticated/admin/tecnologias-nuevas")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ name: "", icon_url: "" });
  const save = useMutation({
    mutationFn: async (row: any) => {
      const t = resolveTech(row.name);
      const icon = row.icon_url || (t ? techIconUrl(t) : `https://cdn.simpleicons.org/${row.name.toLowerCase().replace(/\s+/g, "")}/000000`);
      const { data: existing } = await supabase.from("site_settings").select("value").eq("key", "tech_catalog").maybeSingle();
      const items = Array.isArray((existing?.value as any)?.items) ? (existing?.value as any).items : [];
      const next = [...items, { id: Date.now().toString(), name: row.name, icon_url: icon }];
      const { error } = await supabase.from("site_settings").upsert({ key: "tech_catalog", value: { items: next } as any });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tech_catalog"] });
      qc.invalidateQueries({ queryKey: ["site_settings", "tech_catalog"] });
      toast.success("Guardado");
      setOpen(false);
      setForm({ name: "", icon_url: "" });
    },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <AdminLayout title="Tecnologías nuevas">
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Acá agregás manualmente el lenguaje o tecnología que quieras, por ejemplo NPM v2. Escribí el nombre y subí el icono como el resto. Luego queda disponible como tag para un proyecto nuevo y, si querés, podés agregarla después a tus tecnologías.</p>
        <Button onClick={() => setOpen(true)} className="mt-4 gap-2 bg-primary text-white border-0">
          <Plus className="size-4" /> Agregar
        </Button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-t-3xl sm:rounded-3xl w-full max-w-xl p-6 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Nueva tecnología</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded hover:bg-accent"><X className="size-4" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Nombre *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="ej: NPM v2" />
              </div>
              <ImageUpload value={form.icon_url} onChange={(url) => setForm({ ...form, icon_url: url })} label="Icono" />
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={save.isPending} className="gap-2 bg-primary text-white border-0">
                  <Save className="size-4" /> Guardar
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
