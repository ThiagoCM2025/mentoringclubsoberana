import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, contextType, contextId, contextTitle } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt based on context
    let systemPrompt = `Você é a Assistente IA da Soberana, uma plataforma de cursos para advogadas sobre marketing jurídico.

Seu papel é:
- Ajudar alunas com dúvidas sobre as aulas e conteúdos
- Resumir tópicos quando solicitado
- Sugerir próximos passos de estudo
- Responder de forma clara, objetiva e amigável
- Usar linguagem profissional mas acessível
- Sempre se referir às usuárias no feminino (são advogadas)

Regras importantes:
- Seja concisa e direta nas respostas
- Use emojis com moderação para tornar a conversa mais leve
- Se não souber algo específico sobre o conteúdo do curso, sugira que a aluna consulte o material ou entre em contato com a mentora
- Mantenha o foco em marketing jurídico, posicionamento profissional e desenvolvimento de carreira para advogadas`;

    if (contextType === "lesson" && contextTitle) {
      systemPrompt += `\n\nContexto atual: A aluna está assistindo a aula "${contextTitle}". Foque suas respostas neste conteúdo específico quando relevante.`;
    } else if (contextType === "course" && contextTitle) {
      systemPrompt += `\n\nContexto atual: A aluna está no curso "${contextTitle}". Considere este contexto nas suas respostas.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA insuficientes. Entre em contato com o suporte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

    console.log("AI Assistant response generated successfully");

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("AI Assistant error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
