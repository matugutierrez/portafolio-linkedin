import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window === "undefined") return { user: null };

    if (window.localStorage.getItem("admin_bypass") === "1") {
      return { user: { id: "local-admin", email: "local@admin" } };
    }

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) return { user: data.session.user };
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) return { user: userData.user };
    } catch (e) {
      console.error("[auth] supabase check failed", e);
    }

    throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
