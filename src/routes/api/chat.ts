import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { messages: { role: "user" | "assistant"; content: string }[]; lang?: "es" | "en" };
          const lang = body.lang ?? "es";

          const key = process.env.GOOGLE_GEMINI_API_KEY;
          if (!key) {
            console.error("[chat] Missing GOOGLE_GEMINI_API_KEY");
            return new Response("Missing API key", { status: 500 });
          }

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
            ? `\n\nREGLAS DE FORMATO IMPORTANTES:\n- NUNCA uses markdown. Escribe el email y teléfono como texto plano, sin asteriscos.\n- Email: matugutierrez7@gmail.com\n- Teléfono/WhatsApp: +54 9 11 5937-1225`
            : `\n\nIMPORTANT FORMATTING RULES:\n- NEVER use markdown. Write email and phone as plain text.\n- Email: matugutierrez7@gmail.com\n- Phone/WhatsApp: +54 9 11 5937-1225`;

          const system = lang === "es"
            ? `Eres un asistente IA del portfolio de ${profile?.name ?? "Matías Gutiérrez"}. Responde SIEMPRE en español, en primera persona como si fueras Matías. Sé conciso, amable y profesional. Usa SOLO la siguiente información:\n\nPERFIL:\n${JSON.stringify(profile)}\n\nPROYECTOS:\n${JSON.stringify(projects)}\n\nEXPERIENCIA:\n${JSON.stringify(exp)}\n\nHABILIDADES:\n${JSON.stringify(skills)}\n\nSi te preguntan algo que no está en estos datos, di amablemente que no tienes esa información y sugiere contactar por el formulario.${formatRules}`
            : `You are an AI assistant for ${profile?.name ?? "Matías Gutiérrez"}'s portfolio. Always answer in English, in first person as if you were Matías. Be concise, friendly and professional. Use ONLY the following information:\n\nPROFILE:\n${JSON.stringify(profile)}\n\nPROJECTS:\n${JSON.stringify(projects)}\n\nEXPERIENCE:\n${JSON.stringify(exp)}\n\nSKILLS:\n${JSON.stringify(skills)}\n\nIf asked about something not in this data, kindly say you don't have that info and suggest using the contact form.${formatRules}`;

          // Convert messages to Google format
          const contents = body.messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));

          const googleBody = {
            contents,
            systemInstruction: { parts: [{ text: system }] },
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          };

          console.log("[chat] Calling Gemini API...");

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${key}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(googleBody),
            },
          );

          if (!res.ok) {
            const errText = await res.text();
            console.error("[chat] Gemini API error:", res.status, errText);
            return new Response(`Gemini API error: ${res.status}`, { status: 500 });
          }

          // Stream the SSE response back to the client as plain text
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            async start(controller) {
              const reader = res.body!.getReader();
              const decoder = new TextDecoder();
              let buffer = "";
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";
                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const data = line.slice(6).trim();
                    if (data === "[DONE]") continue;
                    try {
                      const parsed = JSON.parse(data);
                      const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
                      if (text) controller.enqueue(encoder.encode(text));
                    } catch {
                      // skip malformed lines
                    }
                  }
                }
              }
              controller.close();
            },
          });

          return new Response(stream, {
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