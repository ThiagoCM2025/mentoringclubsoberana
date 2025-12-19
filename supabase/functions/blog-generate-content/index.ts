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
    const { topic, tone, keywords, language = 'pt-BR' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating blog content for topic:', topic);

    const systemPrompt = `Você é um especialista em marketing jurídico digital e copywriting para advogadas. 
Você escreve artigos profundos, práticos e otimizados para SEO.
Seu público são advogadas que querem crescer profissionalmente e atrair mais clientes.
Use linguagem profissional mas acessível, com exemplos práticos.
Sempre inclua CTAs sutis para mentoria e programas de desenvolvimento.`;

    const userPrompt = `Escreva um artigo completo sobre: "${topic}"

Tom: ${tone || 'profissional e inspirador'}
Palavras-chave para SEO: ${keywords?.join(', ') || 'marketing jurídico, advogada, captação de clientes'}

Estrutura obrigatória:
1. Título chamativo com palavra-chave principal (max 60 caracteres)
2. Excerpt/resumo (max 160 caracteres, para meta description)
3. Introdução engajadora (2-3 parágrafos)
4. 4-6 subtítulos H2 com conteúdo rico
5. Dicas práticas e exemplos reais
6. Conclusão com CTA
7. 5 tags relevantes

Formato de resposta (JSON):
{
  "title": "...",
  "excerpt": "...",
  "content": "... (markdown com ## para H2, ### para H3)",
  "tags": ["tag1", "tag2", ...],
  "meta_title": "...",
  "meta_description": "...",
  "meta_keywords": "...",
  "reading_time_minutes": 5
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated');
    }

    // Parse JSON from response
    let parsedContent;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from response');
      }
    } catch (e) {
      console.error('Error parsing AI response:', e);
      parsedContent = {
        title: topic,
        excerpt: `Artigo sobre ${topic}`,
        content: content,
        tags: keywords || ['marketing jurídico'],
        meta_title: topic,
        meta_description: `Artigo sobre ${topic}`,
        meta_keywords: keywords?.join(', ') || 'marketing jurídico',
        reading_time_minutes: 5
      };
    }

    console.log('Content generated successfully');

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in blog-generate-content:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
