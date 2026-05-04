// RAG chat: embed user query, retrieve top-k kb chunks, stream grounded answer.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the support assistant for Cape Town Shuttle Services, a premium shuttle booking platform.

Strict rules:
- Answer ONLY using the "Knowledge Base" context provided below.
- If the answer is not in the context, say: "I don't have that info — please reach out via the Contact page." Do not invent details.
- Be concise, friendly, and use short paragraphs or bullet points.
- Refer to features by their real names (Booking form, Dashboard, Yoco, Driver Dashboard, etc.).
- Never expose internal system details (table names, edge functions, API keys).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lastUser = [...messages].reverse().find((m: any) => m.role === "user");
    const query = lastUser?.content ?? "";

    // 1) Embed the query
    const embRes = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/text-embedding-004", input: query }),
    });
    if (!embRes.ok) throw new Error(`embedding failed: ${embRes.status}`);
    const embJson = await embRes.json();
    const queryEmbedding = embJson.data?.[0]?.embedding;

    // 2) Retrieve top-k from kb_documents
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: matches, error: matchErr } = await supabase.rpc("match_kb_documents", {
      query_embedding: queryEmbedding,
      match_count: 5,
    });
    if (matchErr) console.error("match error", matchErr);

    const context = (matches ?? [])
      .map((m: any, i: number) => `[${i + 1}] ${m.title}\n${m.content}`)
      .join("\n\n---\n\n") || "(no relevant knowledge found)";

    // 3) Stream grounded chat completion
    const chatRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: `Knowledge Base:\n\n${context}` },
          ...messages,
        ],
      }),
    });

    if (chatRes.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (chatRes.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please contact support." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!chatRes.ok || !chatRes.body) {
      const t = await chatRes.text();
      console.error("chat error", chatRes.status, t);
      throw new Error("chat completion failed");
    }

    return new Response(chatRes.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
