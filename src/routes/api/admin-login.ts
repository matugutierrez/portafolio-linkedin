import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin-login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { user?: string; pass?: string };
          const expectedUser = process.env.ADMIN_USER;
          const expectedPass = process.env.ADMIN_PASS;
          if (!expectedUser || !expectedPass) {
            return new Response(JSON.stringify({ error: "Admin credentials not configured" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }
          if (body.user === expectedUser && body.pass === expectedPass) {
            return new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify({ error: "Credenciales incorrectas" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response(JSON.stringify({ error: "Bad request" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
