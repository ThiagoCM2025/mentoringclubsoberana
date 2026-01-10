import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { videoTitle, style } = await req.json();

    if (!videoTitle) {
      return new Response(
        JSON.stringify({ error: "videoTitle is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating thumbnail for:", videoTitle);

    const prompt = `Create a professional, attractive 16:9 thumbnail for an online course video titled "${videoTitle}". 
Style: ${style || 'educational, premium, sophisticated, empowering'}.
Color palette: gold (#B6904D), marsala/burgundy, warm tones, cream/beige backgrounds.
The image should represent learning, professional growth, and female empowerment in law/business.
NO TEXT in the image. Focus on elegant, abstract professional imagery.
High quality, modern design suitable for YouTube thumbnail.
Ultra high resolution.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("No image generated");
    }

    // Try to upload to Supabase Storage
    let finalUrl = imageUrl;
    
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Extract base64 data
      const base64Match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (base64Match) {
        const imageFormat = base64Match[1];
        const base64Data = base64Match[2];
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        const fileName = `thumbnails/${crypto.randomUUID()}.${imageFormat}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("course-materials")
          .upload(fileName, binaryData, {
            contentType: `image/${imageFormat}`,
            upsert: true
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          // Fall back to base64
        } else {
          const { data: publicUrl } = supabase.storage
            .from("course-materials")
            .getPublicUrl(fileName);
          
          finalUrl = publicUrl.publicUrl;
          console.log("Uploaded to storage:", finalUrl);
        }
      }
    } catch (uploadErr) {
      console.error("Storage upload failed, using base64:", uploadErr);
      // Keep the base64 URL as fallback
    }

    return new Response(
      JSON.stringify({ 
        thumbnailUrl: finalUrl,
        title: videoTitle
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
