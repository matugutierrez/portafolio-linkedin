import { createFileRoute } from "@tanstack/react-router";
import Groq from "groq-sdk";

export const Route = createFileRoute("/api/skills-suggest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { prompt?: string; messages?: { role: "user" | "assistant"; content: string }[] };
          let messages: { role: "system" | "user" | "assistant"; content: string }[] = [];
          const system = `Sos un asistente para sugerir habilidades personales y profesionales para un portfolio. Respondé solo con JSON válido. Formato: {"skills": [{"name": string, "category": string, "level": number}]}. Categorías válidas: frontend, backend, devops, tools, design, ai, soft, management. Nivel entre 60 y 95 salvo que el usuario pida explícitamente otro valor. Máximo 8 habilidades. Solo JSON, sin texto extra.`;
          messages.push({ role: "system", content: system });
          if (Array.isArray(body.messages) && body.messages.length > 0) {
            for (const m of body.messages) {
              if (m.role === "user" || m.role === "assistant") {
                messages.push({ role: m.role, content: m.content });
              }
            }
          } else if (body.prompt) {
            messages.push({ role: "user", content: body.prompt.trim() });
          } else {
            return new Response(JSON.stringify({ error: "Prompt requerido" }), { status: 400, headers: { "Content-Type": "application/json" } });
          }
          const apiKey = process.env.GROQ_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: "GROQ_API_KEY not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
          }
          const groq = new Groq({ apiKey });
          const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages,
            temperature: 0.7,
            max_tokens: 900,
          });
          const raw = completion.choices[0]?.message?.content || "";
          const start = raw.indexOf("{");
          const end = raw.lastIndexOf("}");
          if (start === -1 || end === -1) {
            return new Response(JSON.stringify({ error: "Respuesta IA inválida" }), { status: 500, headers: { "Content-Type": "application/json" } });
          }
          const parsed = JSON.parse(raw.slice(start, end + 1));
          const skills = Array.isArray(parsed.skills) ? parsed.skills : [];
          const cleaned = skills
            .filter((s: any) => typeof s.name === "string" && s.name.trim().length > 1)
            .slice(0, 8)
            .map((s: any) => ({
              name: String(s.name).trim(),
              category: typeof s.category === "string" ? s.category : "soft",
              level: typeof s.level === "number" ? Math.min(100, Math.max(0, Math.round(s.level))) : 80,
            }));
          return new Response(JSON.stringify({ skills: cleaned }), { headers: { "Content-Type": "application/json" } });
        } catch (err) {
          console.error(err);
          return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
      },
    },
  },
});
