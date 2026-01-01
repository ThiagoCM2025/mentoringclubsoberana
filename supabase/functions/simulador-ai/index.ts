import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é uma consultora especializada em negócios jurídicos para advogadas de elite no Brasil.

Sua função é analisar a meta de faturamento mensal informada e sugerir valores realistas baseados em benchmarks do mercado jurídico brasileiro.

Considere os seguintes benchmarks:
- Ticket médio em advocacia especializada: R$ 3.000 a R$ 50.000 dependendo da área
- CPL (Custo por Lead) típico para advogadas: R$ 20 a R$ 200
- Taxa Lead → Reunião: 10% a 40% (média 20%)
- Taxa Reunião → Contrato: 15% a 50% (média 30%)

Ajuste suas sugestões com base na meta:
- Metas até R$ 30.000: ticket médio menor, operação mais volume
- Metas de R$ 30.000 a R$ 100.000: ticket médio intermediário
- Metas acima de R$ 100.000: ticket médio premium, operação mais qualificada

Forneça uma explicação breve e estratégica sobre o porquê das suas sugestões.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { meta } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    console.log("Analisando meta de faturamento:", meta);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `A advogada tem uma meta de faturamento mensal de R$ ${meta.toLocaleString('pt-BR')}. Sugira valores otimizados para: ticket médio, CPL, taxa lead→reunião e taxa conversão.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_simulator_values",
              description: "Retorna valores sugeridos para o simulador financeiro baseado na meta de faturamento",
              parameters: {
                type: "object",
                properties: {
                  ticketMedio: {
                    type: "number",
                    description: "Ticket médio sugerido em reais (entre 1000 e 100000)",
                  },
                  cpl: {
                    type: "number",
                    description: "Custo por Lead sugerido em reais (entre 1 e 500)",
                  },
                  taxaLeadReuniao: {
                    type: "number",
                    description: "Taxa de conversão Lead para Reunião em porcentagem (entre 5 e 80)",
                  },
                  taxaConversao: {
                    type: "number",
                    description: "Taxa de conversão Reunião para Contrato em porcentagem (entre 5 e 80)",
                  },
                  explicacao: {
                    type: "string",
                    description: "Explicação estratégica breve sobre as sugestões (máximo 2 frases)",
                  },
                },
                required: ["ticketMedio", "cpl", "taxaLeadReuniao", "taxaConversao", "explicacao"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_simulator_values" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro da API:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Entre em contato com o suporte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    console.log("Resposta da IA:", JSON.stringify(data));

    // Extract tool call arguments
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "suggest_simulator_values") {
      throw new Error("Resposta inesperada da IA");
    }

    const suggestion = JSON.parse(toolCall.function.arguments);

    // Validate and clamp values
    const validatedSuggestion = {
      ticketMedio: Math.max(1000, Math.min(100000, suggestion.ticketMedio || 5000)),
      cpl: Math.max(1, Math.min(500, suggestion.cpl || 50)),
      taxaLeadReuniao: Math.max(5, Math.min(80, suggestion.taxaLeadReuniao || 20)),
      taxaConversao: Math.max(5, Math.min(80, suggestion.taxaConversao || 30)),
      explicacao: suggestion.explicacao || "Valores baseados em benchmarks do mercado jurídico brasileiro.",
    };

    console.log("Sugestão validada:", validatedSuggestion);

    return new Response(
      JSON.stringify({ suggestion: validatedSuggestion }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro no simulador-ai:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
