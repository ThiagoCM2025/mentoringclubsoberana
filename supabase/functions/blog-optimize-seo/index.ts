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
    const { title, content, currentSeo } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Optimizing SEO for:', title);

    const systemPrompt = `Você é um especialista em SEO para blogs jurídicos. 
Analise o conteúdo fornecido e otimize os elementos de SEO para maximizar o ranqueamento no Google.
Foque em palavras-chave relevantes para advogadas e marketing jurídico.`;

    const userPrompt = `Analise e otimize o SEO para este artigo:

Título atual: ${title}
SEO atual: ${JSON.stringify(currentSeo || {})}

Conteúdo do artigo:
${content?.substring(0, 2000)}...

Forneça otimizações em JSON:
{
  "meta_title": "título otimizado (max 60 chars, inclua palavra-chave principal)",
  "meta_description": "descrição otimizada (max 160 chars, inclua CTA e palavra-chave)",
  "meta_keywords": "palavras-chave separadas por vírgula",
  "slug": "slug-otimizado-para-seo",
  "suggestions": ["sugestão 1 para melhorar", "sugestão 2", ...],
  "score": 85,
  "analysis": {
    "keyword_density": "análise da densidade de palavras-chave",
    "readability": "análise de legibilidade",
    "structure": "análise da estrutura do artigo"
  }
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
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      throw new Error('No SEO suggestions generated');
    }

    // Parse JSON from response
    let parsedResult;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from response');
      }
    } catch (e) {
      console.error('Error parsing AI response:', e);
      parsedResult = {
        meta_title: title,
        meta_description: content?.substring(0, 160),
        meta_keywords: 'marketing jurídico, advogada',
        slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        suggestions: ['Adicione mais palavras-chave relevantes'],
        score: 60
      };
    }

    console.log('SEO optimized successfully');

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in blog-optimize-seo:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
