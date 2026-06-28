import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { FolderGit2, Briefcase, GraduationCap, Wrench, Code2, Mail, BarChart3, UserCog, LogOut, ArrowLeft, Menu } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    window.localStorage.removeItem("admin_bypass");
    navigate({ to: "/", replace: true });
  };

  const items = [
    { to: "/admin/proyectos", label: "Proyectos", icon: FolderGit2 },
    { to: "/admin/experiencia", label: "Experiencia", icon: Briefcase },
    { to: "/admin/educacion", label: "Educación", icon: GraduationCap },
    { to: "/admin/habilidades", label: "Habilidades", icon: Wrench },
    { to: "/admin/tecnologias", label: "Tecnologías", icon: Code2 },
    { to: "/admin/mensajes", label: "Mensajes", icon: Mail },
    { to: "/admin/analiticas", label: "Analíticas", icon: BarChart3 },
    { to: "/admin/perfil", label: "Perfil", icon: UserCog },
    { to: "/admin/menu", label: "Menú del sitio", icon: Menu },
  ];

  const [open, setOpen] = useState(false);

  const NavList = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex-1 space-y-1">
      {items.map((it) => {
        const active = loc.pathname.startsWith(it.to);
        const Icon = it.icon;
        return (
          <Link key={it.to} to={it.to} onClick={onClick} className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${active ? "bg-white/5 text-foreground border border-border" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"}`}>
            <Icon className="size-4" /> {it.label}
          </Link>
        );
      })}
    </nav>
  );

  const NavFooter = ({ onClick }: { onClick?: () => void }) => (
    <div className="border-t border-border pt-4 space-y-1">
      <Link to="/" onClick={onClick} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Volver al sitio
      </Link>
      <button onClick={() => { onClick?.(); signOut(); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground w-full">
        <LogOut className="size-4" /> Cerrar sesión
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-border bg-sidebar p-4">
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="size-9 rounded-lg bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white font-bold text-sm">MG</div>
          <div>
            <div className="text-sm font-semibold">Admin</div>
            <div className="text-[10px] text-muted-foreground">Portfolio CMS</div>
          </div>
        </div>
        <NavList />
        <NavFooter />
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur px-4 md:px-6 py-4 sticky top-0 z-20 flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button type="button" aria-label="Menu" className="md:hidden p-1.5 rounded border border-border hover:bg-sidebar-accent">
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar text-sidebar-foreground p-4 flex flex-col">
              <SheetTitle className="text-left">Admin</SheetTitle>
              <div className="mt-4 flex-1 flex flex-col">
                <NavList onClick={() => setOpen(false)} />
                <NavFooter onClick={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg md:text-xl font-bold">{title}</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}