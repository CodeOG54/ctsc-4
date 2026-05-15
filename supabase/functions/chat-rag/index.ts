// ============================================================
// RAG CHAT EDGE FUNCTION
// OpenAI + Supabase pgvector
// Non-streaming JSON response version
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `
You are the support assistant for Cape Town Shuttle Services, a premium shuttle booking platform.

Strict rules:
- Answer ONLY using the "Knowledge Base" context provided below.
- If the answer is not in the context, say:
  "I don't have that info — please reach out via the Contact page."
- Do not invent details.
- Be concise, friendly, and use short paragraphs or bullet points.
- Refer to features by their real names
  (Booking form, Dashboard, Yoco, Driver Dashboard, etc.).
- Never expose internal system details
  (table names, edge functions, API keys).
`;

const CHAT_MODEL = "gpt-4o-mini";
const EMBED_MODEL = "text-embedding-3-small"; // 1536 dims

Deno.serve(async (req) => {
  // ==========================================================
  // HANDLE CORS
  // ==========================================================

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    // ==========================================================
    // ENV VARIABLES
    // ==========================================================

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    // ==========================================================
    // PARSE REQUEST
    // ==========================================================

    const body = await req.json();

    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: "messages array required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // ==========================================================
    // GET LAST USER MESSAGE
    // ==========================================================

    const lastUserMessage = [...messages]
      .reverse()
      .find((m: any) => m.role === "user");

    const query = lastUserMessage?.content ?? "";

    console.log("USER QUERY:", query);

    // ==========================================================
    // GENERATE EMBEDDING
    // ==========================================================

    const embeddingResponse = await fetch(
      "https://api.openai.com/v1/embeddings",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: EMBED_MODEL,
          input: query,
        }),
      }
    );

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();

      console.error("EMBEDDING ERROR:", errorText);

      throw new Error(
        `Embedding failed: ${embeddingResponse.status}`
      );
    }

    const embeddingJson = await embeddingResponse.json();

    const queryEmbedding =
      embeddingJson.data?.[0]?.embedding;

    if (!queryEmbedding) {
      throw new Error("No embedding returned");
    }

    // ==========================================================
    // SUPABASE CLIENT
    // ==========================================================

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ==========================================================
    // VECTOR SEARCH
    // ==========================================================

    const embeddingString = `[${queryEmbedding.join(",")}]`;

const { data: matches, error: matchError } =
  await supabase.rpc("match_kb_documents", {
    query_embedding: embeddingString,
    match_count: 5,
  });

    if (matchError) {
      console.error("VECTOR SEARCH ERROR:", matchError);
    }

    console.log("MATCHES:", matches);

    // ==========================================================
    // BUILD CONTEXT
    // ==========================================================

    const context =
      (matches ?? [])
        .map(
          (m: any, i: number) =>
            `[${i + 1}] ${m.title}\n${m.content}`
        )
        .join("\n\n---\n\n") ||
      "(no relevant knowledge found)";

    // ==========================================================
    // CHAT COMPLETION
    // ==========================================================

    const chatResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: CHAT_MODEL,
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "system",
              content: `Knowledge Base:\n\n${context}`,
            },
            ...messages,
          ],
        }),
      }
    );

    // ==========================================================
    // HANDLE OPENAI ERRORS
    // ==========================================================

    if (chatResponse.status === 429) {
      return new Response(
        JSON.stringify({
          error:
            "Rate limited, please try again shortly.",
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (chatResponse.status === 401) {
      return new Response(
        JSON.stringify({
          error: "Invalid OpenAI API key.",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();

      console.error(
        "CHAT COMPLETION ERROR:",
        chatResponse.status,
        errorText
      );

      throw new Error("Chat completion failed");
    }

    // ==========================================================
    // PARSE RESPONSE
    // ==========================================================

    const chatJson = await chatResponse.json();

    console.log("OPENAI RESPONSE:", chatJson);

    const reply =
      chatJson.choices?.[0]?.message?.content ||
      "I don't have that info — please reach out via the Contact page.";

    console.log("FINAL REPLY:", reply);

    // ==========================================================
    // RETURN JSON
    // ==========================================================

    return new Response(
      JSON.stringify({
        reply,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("EDGE FUNCTION ERROR:", error);

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});