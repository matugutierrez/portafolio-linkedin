import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages: { role: "user" | "assistant"; content: string }[]; lang?: "es" | "en" };
        const lang = body.lang ?? "es";

        const key = process.env.GOOGLE_GEMINI_API_KEY;
        if (!key) return new Response("Missing GOOGLE_GEMINI_API_KEY", { status: 500 });

        // Load portfolio context
        const { createClient } = await import("@supabase/supabase-js");
        const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });
        const [{ data: profile }, { data: projects }, { data: exp }, { data: skills }] = await Promise.all([
          supa.from("profiles").select("*").limit(1).maybeSingle(),
          supa.from("projects").select("title,description_es,description_en,category,stack,demo_url"),
          supa.from("experiences").select("company,role_es,role_en,description_es,description_en,start_date,end_date"),
          supa.from("skills").select("name,category,level"),
        ]);

        const formatRules = lang === "es"
          ? `\n\nREGLAS DE FORMATO IMPORTANTES:\n- NUNCA uses markdown (sin **negritas**, sin _cursivas_, sin backticks). Escribe el email y teléfono como texto plano, sin asteriscos.\n- Cuando menciones el email, escríbelo exactamente como: matugutierrez7@gmail.com\n- Cuando menciones el teléfono/WhatsApp, escríbelo exactamente como: +54 9 11 5937-1225\n- No agregues etiquetas html, ni paréntesis con links, solo el texto plano.`
          : `\n\nIMPORTANT FORMATTING RULES:\n- NEVER use markdown (no **bold**, no _italics_, no backticks). Write email and phone as plain text, no asterisks.\n- When mentioning the email, write it exactly as: matugutierrez7@gmail.com\n- When mentioning the phone/WhatsApp, write it exactly as: +54 9 11 5937-1225\n- Don't add html tags or markdown link parentheses, just plain text.`;

        const system = lang === "es"
          ? `Eres un asistente IA del portfolio de ${profile?.name ?? "Matías Gutiérrez"}. Responde SIEMPRE en español, en primera persona como si fueras Matías. Sé conciso, amable y profesional. Usa SOLO la siguiente información:\n\nPERFIL:\n${JSON.stringify(profile)}\n\nPROYECTOS:\n${JSON.stringify(projects)}\n\nEXPERIENCIA:\n${JSON.stringify(exp)}\n\nHABILIDADES:\n${JSON.stringify(skills)}\n\nSi te preguntan algo que no está en estos datos, di amablemente que no tienes esa información y sugiere contactar por el formulario.${formatRules}`
          : `You are an AI assistant for ${profile?.name ?? "Matías Gutiérrez"}'s portfolio. Always answer in English, in first person as if you were Matías. Be concise, friendly and professional. Use ONLY the following information:\n\nPROFILE:\n${JSON.stringify(profile)}\n\nPROJECTS:\n${JSON.stringify(projects)}\n\nEXPERIENCE:\n${JSON.stringify(exp)}\n\nSKILLS:\n${JSON.stringify(skills)}\n\nIf asked about something not in this data, kindly say you don't have that info and suggest using the contact form.${formatRules}`;

        const google = createGoogleGenerativeAI({ apiKey: key });
        const result = streamText({
          model: google("gemini-2.0-flash"),
          system,
          messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
        });

        return result.toTextStreamResponse({
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      },
    },
  },
});