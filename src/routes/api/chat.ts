import { createFileRoute } from "@tanstack/react-router";
import Groq from "groq-sdk";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { messages: { role: "user" | "assistant"; content: string }[]; lang?: "es" | "en" };
          const lang = body.lang ?? "es";
          const apiKey = process.env.GROQ_API_KEY;
          if (!apiKey) {
            return new Response("GROQ_API_KEY not configured", { status: 500 });
          }
          const groq = new Groq({ apiKey });
          const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
          const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
          if (!supabaseUrl || !supabaseKey) {
            return new Response("Supabase not configured", { status: 500 });
          }
          const { createClient } = await import("@supabase/supabase-js");
          const supa = createClient(supabaseUrl, supabaseKey, {
            auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
          });
          const [{ data: profile }, { data: projects }, { data: exp }, { data: skills }] = await Promise.all([
            supa.from("profiles").select("*").limit(1).maybeSingle(),
            supa.from("projects").select("title,description_es,description_en,category,stack,demo_url"),
            supa.from("experiences").select("company,role_es,role_en,description_es,description_en,start_date,end_date"),
            supa.from("skills").select("name,category,level"),
          ]);
          const formatRules =
            lang === "es"
              ? "\n\nREGLAS DE FORMATO IMPORTANTES:\n- NUNCA uses markdown. Escribe el email y teléfono como texto plano, sin asteriscos.\n- Email: matugutierrez7@gmail.com\n- Teléfono/WhatsApp: +54 9 11 5937-1225"
              : "\n\nIMPORTANT FORMATTING RULES:\n- NEVER use markdown. Write email and phone as plain text.\n- Email: matugutierrez7@gmail.com\n- Phone/WhatsApp: +54 9 11 5937-1225";
          const system =
            lang === "es"
              ? `Eres un asistente IA del portfolio de ${profile?.name ?? "Matías Gutiérrez"}. Responde SIEMPRE en español, en primera persona como si fueras Matías. Sé conciso, amable y profesional. Usa SOLO la siguiente información:\n\nPERFIL:\n${JSON.stringify(profile)}\n\nPROYECTOS:\n${JSON.stringify(projects)}\n\nEXPERIENCIA:\n${JSON.stringify(exp)}\n\nHABILIDADES:\n${JSON.stringify(skills)}\n\nSi te preguntan algo que no está en estos datos, di amablemente que no tienes esa información y sugiere contactar por el formulario.${formatRules}`
              : `You are an AI assistant for ${profile?.name ?? "Matías Gutiérrez"}'s portfolio. Always answer in English, in first person as if you were Matías. Be concise, friendly and professional. Use ONLY the following information:\n\nPROFILE:\n${JSON.stringify(profile)}\n\nPROJECTS:\n${JSON.stringify(projects)}\n\nEXPERIENCE:\n${JSON.stringify(exp)}\n\nSKILLS:\n${JSON.stringify(skills)}\n\nIf asked about something not in this data, kindly say you don't have that info and suggest using the contact form.${formatRules}`;
          const messages = [
            { role: "system" as const, content: system },
            ...body.messages.map((m) => ({ role: m.role === "assistant" ? ("assistant" as const) : ("user" as const), content: m.content })),
          ];
          let stream: AsyncIterable<any>;
          try {
            stream = await groq.chat.completions.create({
              model: "openai/gpt-oss-20b",
              messages,
              stream: true,
            });
          } catch {
            stream = await groq.chat.completions.create({
              model: "openai/gpt-oss-120b",
              messages,
              stream: true,
            });
          }
          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            async start(controller) {
              try {
                for await (const chunk of stream) {
                  const text = chunk.choices?.[0]?.delta?.content || "";
                  if (text) controller.enqueue(encoder.encode(text));
                }
              } catch (err) {
                console.error("[chat] Groq stream error:", err);
              } finally {
                controller.close();
              }
            },
          });
          return new Response(readable, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        } catch (err) {
          console.error("[chat] Unhandled error:", err);
          return new Response("Server error", { status: 500 });
        }
      },
    },
  },
});
