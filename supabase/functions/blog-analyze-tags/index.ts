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
    const { title, content, existingTags = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing tags for:', title);

    const systemPrompt = `Você é um especialista em SEO e categorização de conteúdo jurídico.
Analise o conteúdo e sugira tags relevantes para maximizar a descoberta e organização do artigo.
Foque em termos que advogadas buscariam no Google.`;

    const userPrompt = `Analise este artigo e sugira as melhores tags:

Título: ${title}
Tags atuais: ${existingTags.join(', ') || 'nenhuma'}

Conteúdo:
${content?.substring(0, 3000)}

Forneça análise em JSON:
{
  "suggested_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "tag_analysis": [
    {
      "tag": "tag1",
      "relevance_score": 95,
      "search_volume": "alto",
      "reason": "Por que essa tag é relevante"
    }
  ],
  "category_suggestion": "categoria mais adequada",
  "trending_topics": ["tópico relacionado em alta 1", "tópico 2"]
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
      throw new Error('No tag suggestions generated');
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
        suggested_tags: ['marketing jurídico', 'advocacia', 'captação de clientes'],
        tag_analysis: [],
        category_suggestion: 'Marketing Digital',
        trending_topics: []
      };
    }

    console.log('Tags analyzed successfully');

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in blog-analyze-tags:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
