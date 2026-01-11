import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é um especialista em gamificação e criação de missões para programas de mentoria para advogadas na área imobiliária.

Crie missões práticas e desafiadoras baseadas no conteúdo fornecido.

REGRAS IMPORTANTES:
1. Missões devem ser PRÁTICAS (não apenas "assistir" ou "ler")
2. Devem ter um ENTREGÁVEL claro (postar, criar, configurar, implementar)
3. Títulos devem começar com "Missão" + nome criativo e impactante
4. XP entre 100-250 baseado na dificuldade (missões simples: 100-150, médias: 150-200, complexas: 200-250)
5. gamification_title deve seguir o padrão: "[Título Aspiracional]" - exemplo: "Autoridade Reconhecida", "Mestre da Prospecção"
6. Recompensas devem ser práticas e motivadoras (selos, feedbacks personalizados, templates exclusivos)
7. Use linguagem empoderada e motivadora voltada para advogadas empreendedoras

ESTRUTURA DOS 3 MESES:
- Mês 1 (Semanas 1-4): FUNDAÇÃO - Posicionamento, identidade, primeiros passos
- Mês 2 (Semanas 5-8): CONVERSÃO - Vendas, precificação, scripts, negociação
- Mês 3 (Semanas 9-12): ESCALA - Autoridade, sistemas, delegação, crescimento

Retorne APENAS JSON válido (sem markdown, sem \`\`\`json):
{
  "week_number": 1,
  "month_number": 1,
  "month_title": "Fundação e Posicionamento",
  "title": "Missão Nome Criativo",
  "challenge_description": "Descrição clara do que fazer (2-3 frases)...",
  "why_do": "Por que isso é importante para sua carreira...",
  "gamification_emoji": "🎯",
  "gamification_title": "Título Aspiracional",
  "gamification_reward": "Selo ou benefício prático...",
  "xp_reward": 150
}

Para gerar 12 missões, retorne um array de objetos no formato acima.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, courseId, weekNumber, generateAll } = await req.json();
    
    console.log("Generating mission with context:", { context, courseId, weekNumber, generateAll });

    let userPrompt = "";
    
    if (generateAll) {
      userPrompt = `Gere 12 missões completas para um programa de aceleração de advogadas na área imobiliária.

Contexto adicional: ${context || "Programa padrão de 12 semanas"}

Retorne um array JSON com 12 objetos de missão, uma para cada semana.
Cada missão deve ser progressiva e construir sobre a anterior.

IMPORTANTE: Retorne APENAS o array JSON, sem texto adicional.`;
    } else {
      userPrompt = `Gere UMA missão para a semana ${weekNumber || 1} de um programa de aceleração para advogadas imobiliárias.

${context ? `Contexto do conteúdo: ${context}` : "Gere uma missão baseada na fase do programa (mês 1: fundação, mês 2: conversão, mês 3: escala)"}

Retorne APENAS um objeto JSON com a missão, sem texto adicional.`;
    }

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    console.log("AI response content:", content);

    if (!content) {
      throw new Error("Empty response from AI");
    }

    // Clean the response - remove markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }

    // Parse the JSON
    const parsed = JSON.parse(cleanedContent);

    if (generateAll && Array.isArray(parsed)) {
      return new Response(
        JSON.stringify({ missions: parsed }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (Array.isArray(parsed)) {
      // If we got an array but didn't ask for all, return first item
      return new Response(
        JSON.stringify({ mission: parsed[0] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ mission: parsed }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error: unknown) {
    console.error("Error in generate-mission:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
