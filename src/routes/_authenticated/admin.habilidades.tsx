import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, Save } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { AdminCrud } from "@/components/admin-crud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/habilidades")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ name: string; category: string; level: number }[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [history, setHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  const search = async () => {
    const current = prompt.trim();
    if (!current) return;
    const nextHistory = [...history, { role: "user" as const, content: current }];
    setPrompt("");
    setLoading(true);
    setSuggestions([]);
    setSelected(new Set());
    try {
      const res = await fetch("/api/skills-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      const skills = Array.isArray(data.skills) ? data.skills : [];
      setSuggestions(skills);
      setHistory([...nextHistory, { role: "assistant" as const, content: JSON.stringify({ skills }) }]);
    } catch (e: any) {
      toast.error(e.message || "Error IA");
      setHistory(nextHistory);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (i: number) => {
    const n = new Set(selected);
    if (n.has(i)) n.delete(i);
    else n.add(i);
    setSelected(n);
  };

  const saveSelected = async () => {
    const toSave = Array.from(selected).map((i) => suggestions[i]).filter(Boolean);
    if (toSave.length === 0) return;
    const rows = toSave.map((s, idx) => ({
      name: s.name,
      category: s.category,
      level: s.level,
      display_order: idx,
    }));
    const { error } = await supabase.from("skills" as any).insert(rows);
    if (error) toast.error(error.message);
    else {
      toast.success("Guardado");
      qc.invalidateQueries({ queryKey: ["skills"] });
      setSuggestions([]);
      setSelected(new Set());
    }
  };

  return (
    <AdminLayout title="Habilidades">
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-4 text-primary" />
          <span className="text-sm font-medium">Buscar con IA</span>
        </div>
        <div className="flex gap-2">
          <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ej: dame ideas de habilidades blandas" onKeyDown={(e) => e.key === "Enter" && search()} />
          <Button onClick={search} disabled={loading || !prompt.trim()} className="bg-primary text-primary-foreground">
            {loading ? "..." : "Buscar"}
          </Button>
        </div>
        {suggestions.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="grid gap-2">
              {suggestions.map((s, i) => (
                <label key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" checked={selected.has(i)} onChange={() => toggle(i)} />
                    <span>{s.name}</span>
                    <span className="text-xs text-muted-foreground">{s.category} · {s.level}%</span>
                  </span>
                </label>
              ))}
            </div>
            <Button onClick={saveSelected} disabled={selected.size === 0} className="gap-2 bg-primary text-primary-foreground">
              <Save className="size-4" /> Guardar seleccionadas
            </Button>
          </div>
        )}
      </div>
      <AdminCrud
        table="skills"
        title="Habilidades personales"
        display={(r) => (
          <span className="inline-flex items-center gap-2">
            <span>{r.name}</span>
            <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              {r.category ?? "habilidad"} · {r.level}%
            </span>
          </span>
        )}
        fields={[
          { name: "name", label: "Habilidad (ej: Liderazgo, Comunicación, Resolución de problemas)", required: true },
          { name: "category", label: "Categoría", type: "select", options: [
            { value: "frontend", label: "Frontend" },
            { value: "backend", label: "Backend" },
            { value: "devops", label: "DevOps" },
            { value: "tools", label: "Herramientas" },
            { value: "design", label: "Diseño" },
            { value: "ai", label: "IA" },
            { value: "soft", label: "Blanda" },
            { value: "management", label: "Gestión" },
          ]},
          { name: "level", label: "Nivel (0-100)", type: "number" },
          { name: "display_order", label: "Orden", type: "number" },
        ]} />
    </AdminLayout>
  );
}
