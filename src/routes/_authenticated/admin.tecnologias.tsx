import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin-layout";
import { AdminCrud } from "@/components/admin-crud";
import { TechLogo } from "@/components/tech-badges";
import { techIconUrl, resolveTech } from "@/lib/tech-icons";

const techIcon = (label: string) => {
  const t = resolveTech(label);
  return t ? techIconUrl(t) : `https://cdn.simpleicons.org/${label.toLowerCase().replace(/\s+/g, "")}/000000`;
};

export const Route = createFileRoute("/_authenticated/admin/tecnologias")({ component: Page });

function Page() {
  return (
    <AdminLayout title="Tecnologías">
      <AdminCrud
        table="technologies"
        title="Tecnologías y lenguajes"
        beforeSave={(row) => {
          const t = resolveTech(row.name);
          return {
            ...row,
            icon_url: row.icon_url || (t ? techIconUrl(t) : `https://cdn.simpleicons.org/${row.name.toLowerCase().replace(/\s+/g, "")}/000000`),
            color: row.color || (t ? `#${t.color}` : null),
          };
        }}
        display={(r) => (
          <span className="inline-flex items-center gap-2">
            <TechLogo name={r.name} src={r.icon_url || techIcon(r.name) || undefined} size={16} />
            <span>{r.name}</span>
          </span>
        )}
        fields={[
          { name: "name", label: "Tecnología / Lenguaje (ej: JWT, WebSockets, Go, Rust)", required: true },
          { name: "icon_url", label: "Icono (opcional, se genera automático o subí miniatura)", type: "image" },
          { name: "display_order", label: "Orden", type: "number" },
        ]} />
    </AdminLayout>
  );
}
