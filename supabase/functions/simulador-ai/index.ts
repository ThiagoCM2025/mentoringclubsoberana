import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é uma consultora estratégica especializada em negócios jurídicos para advogadas de elite no Brasil.

Sua função é analisar a meta de faturamento mensal informada e criar 3 cenários estratégicos diferentes, cada um com uma abordagem distinta:

## CENÁRIO CONSERVADOR
- Menor investimento em tráfego
- Ticket médio mais acessível
- Operação focada em volume moderado
- Ideal para advogadas iniciantes ou com orçamento limitado
- Menor risco, retorno mais previsível

## CENÁRIO EQUILIBRADO  
- Investimento balanceado
- Ticket médio intermediário baseado em benchmarks do mercado
- Taxas de conversão realistas para operações bem estruturadas
- Ideal para a maioria das advogadas com operação estabelecida
- Melhor relação custo-benefício

## CENÁRIO AGRESSIVO
- Maior investimento em tráfego qualificado
- Ticket médio premium (posicionamento de autoridade)
- Foco em alta qualificação de leads
- Ideal para advogadas com marca pessoal forte
- Maior potencial de retorno, requer estrutura comercial robusta

## BENCHMARKS DO MERCADO JURÍDICO BRASILEIRO

Ticket Médio por Posicionamento:
- Iniciante/Volume: R$ 2.000 a R$ 8.000
- Intermediário: R$ 8.000 a R$ 25.000
- Premium/Autoridade: R$ 25.000 a R$ 80.000

CPL (Custo por Lead) por Nível de Qualificação:
- Leads frios (menor qualificação): R$ 15 a R$ 50
- Leads mornos (média qualificação): R$ 50 a R$ 150
- Leads quentes (alta qualificação): R$ 150 a R$ 350

Taxas de Conversão:
- Lead → Reunião: 8% a 45% (média de mercado: 18-25%)
- Reunião → Contrato: 12% a 55% (média de mercado: 25-35%)

## INSTRUÇÕES IMPORTANTES
- Ajuste os valores proporcionalmente à meta informada
- Metas menores (até R$ 30k) devem usar tickets mais baixos
- Metas altas (acima de R$ 100k) justificam tickets premium
- Seja específica nas análises e recomendações
- Forneça um relatório geral contextualizando o mercado
- Cada cenário deve ter uma análise estratégica clara
- A conclusão deve recomendar o cenário mais adequado para advogadas de elite`;

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

    console.log("Analisando meta de faturamento para criar cenários:", meta);

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
            content: `A advogada tem uma meta de faturamento mensal de R$ ${meta.toLocaleString('pt-BR')}. 
            
Crie 3 cenários estratégicos diferentes (conservador, equilibrado e agressivo) com valores otimizados para cada um.

Para cada cenário, calcule valores realistas de:
- Ticket médio
- CPL (Custo por Lead)
- Taxa de conversão Lead → Reunião
- Taxa de conversão Reunião → Contrato

Forneça também um relatório geral sobre o contexto do mercado para essa meta, análise estratégica de cada cenário, e uma conclusão recomendando o melhor caminho.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_financial_scenarios",
              description: "Cria 3 cenários financeiros estratégicos com relatório completo para advogadas",
              parameters: {
                type: "object",
                properties: {
                  relatorioGeral: {
                    type: "string",
                    description: "Análise geral do mercado jurídico para a meta informada, contextualizando as oportunidades e desafios. 2-3 parágrafos.",
                  },
                  cenarios: {
                    type: "array",
                    description: "Array com exatamente 3 cenários: conservador, equilibrado e agressivo",
                    items: {
                      type: "object",
                      properties: {
                        tipo: { 
                          type: "string", 
                          enum: ["conservador", "equilibrado", "agressivo"],
                          description: "Tipo do cenário"
                        },
                        nome: { 
                          type: "string",
                          description: "Nome descritivo do cenário (ex: 'Crescimento Seguro', 'Expansão Estratégica', 'Aceleração Premium')"
                        },
                        ticketMedio: { 
                          type: "number",
                          description: "Ticket médio sugerido em reais (entre 1000 e 100000)"
                        },
                        cpl: { 
                          type: "number",
                          description: "Custo por Lead sugerido em reais (entre 10 e 400)"
                        },
                        taxaLeadReuniao: { 
                          type: "number",
                          description: "Taxa de conversão Lead para Reunião em porcentagem (entre 5 e 50)"
                        },
                        taxaConversao: { 
                          type: "number",
                          description: "Taxa de conversão Reunião para Contrato em porcentagem (entre 10 e 60)"
                        },
                        analise: { 
                          type: "string",
                          description: "Análise estratégica deste cenário explicando por que esses valores fazem sentido (2-3 frases)"
                        },
                        recomendacao: { 
                          type: "string",
                          description: "Para qual perfil de advogada este cenário é ideal (1-2 frases)"
                        }
                      },
                      required: ["tipo", "nome", "ticketMedio", "cpl", "taxaLeadReuniao", "taxaConversao", "analise", "recomendacao"],
                      additionalProperties: false
                    }
                  },
                  conclusao: {
                    type: "string",
                    description: "Recomendação final sobre qual cenário é mais adequado para advogadas de elite que buscam escalar seus resultados de forma sustentável. 2-3 frases.",
                  },
                },
                required: ["relatorioGeral", "cenarios", "conclusao"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_financial_scenarios" } },
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
    if (!toolCall || toolCall.function.name !== "create_financial_scenarios") {
      throw new Error("Resposta inesperada da IA");
    }

    const aiResponse = JSON.parse(toolCall.function.arguments);

    // Validate and sanitize scenarios
    const validatedScenarios = (aiResponse.cenarios || []).map((cenario: any) => ({
      tipo: cenario.tipo || "equilibrado",
      nome: cenario.nome || "Cenário",
      ticketMedio: Math.max(1000, Math.min(100000, cenario.ticketMedio || 5000)),
      cpl: Math.max(10, Math.min(400, cenario.cpl || 50)),
      taxaLeadReuniao: Math.max(5, Math.min(50, cenario.taxaLeadReuniao || 20)),
      taxaConversao: Math.max(10, Math.min(60, cenario.taxaConversao || 30)),
      analise: cenario.analise || "Cenário otimizado para sua meta.",
      recomendacao: cenario.recomendacao || "Ideal para advogadas em crescimento.",
    }));

    // Ensure we have exactly 3 scenarios
    const tiposObrigatorios = ["conservador", "equilibrado", "agressivo"];
    const cenariosFinais = tiposObrigatorios.map((tipo, index) => {
      const existente = validatedScenarios.find((c: any) => c.tipo === tipo);
      if (existente) return existente;
      
      // Fallback values based on type
      const fallbacks: Record<string, any> = {
        conservador: { ticketMedio: 3000, cpl: 30, taxaLeadReuniao: 15, taxaConversao: 25 },
        equilibrado: { ticketMedio: 8000, cpl: 60, taxaLeadReuniao: 20, taxaConversao: 30 },
        agressivo: { ticketMedio: 20000, cpl: 120, taxaLeadReuniao: 25, taxaConversao: 40 },
      };
      
      return {
        tipo,
        nome: tipo === "conservador" ? "Crescimento Seguro" : tipo === "equilibrado" ? "Expansão Estratégica" : "Aceleração Premium",
        ...fallbacks[tipo],
        analise: "Cenário baseado em benchmarks do mercado jurídico.",
        recomendacao: "Analise qual se adequa melhor ao seu perfil.",
      };
    });

    const validatedResponse = {
      relatorioGeral: aiResponse.relatorioGeral || "Análise do mercado jurídico brasileiro para sua meta de faturamento.",
      cenarios: cenariosFinais,
      conclusao: aiResponse.conclusao || "Recomendamos avaliar cada cenário de acordo com sua estrutura atual e objetivos de crescimento.",
    };

    console.log("Resposta validada:", JSON.stringify(validatedResponse));

    return new Response(
      JSON.stringify({ scenarios: validatedResponse }),
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
