import { Link, useLocation } from "@tanstack/react-router";
import { Home, FolderGit2, Briefcase, Mail, User } from "lucide-react";
import { useHiddenNav } from "@/lib/nav-settings";

export function MobileBottomNav() {
  const loc = useLocation();
  const { data: hidden = [] } = useHiddenNav();
  const all = [
    { to: "/", icon: Home },
    { to: "/sobre-mi", icon: User },
    { to: "/proyectos", icon: FolderGit2 },
    { to: "/experiencia", icon: Briefcase },
    { to: "/contacto", icon: Mail },
  ];
  const items = all.filter((it) => !hidden.includes(it.to));
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-sidebar/95 backdrop-blur flex justify-around py-2">
      {items.map(({ to, icon: Icon }) => {
        const active = loc.pathname === to;
        return (
          <Link key={to} to={to} className={`p-3 rounded-lg ${active ? "text-foreground" : "text-muted-foreground"}`}>
            <Icon className="size-5" />
          </Link>
        );
      })}
    </div>
  );
}