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
    const { agentTitle, categoryName, categoryColor } = await req.json();

    if (!agentTitle) {
      throw new Error("agentTitle is required");
    }

    console.log("Generating thumbnail for agent:", agentTitle);
    console.log("Category:", categoryName, "Color:", categoryColor);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Map category colors to descriptive color palettes
    const colorPalettes: Record<string, string> = {
      purple: "deep purple and violet tones",
      amber: "warm amber and orange tones",
      green: "emerald and jade green tones",
      blue: "deep blue and cyan tones",
      rose: "elegant rose and pink tones",
      orange: "warm orange and coral tones",
      pink: "soft pink and magenta tones",
      yellow: "golden yellow and amber tones",
    };

    const colorPalette = colorPalettes[categoryColor] || "elegant neutral tones";

    // Build the optimized prompt for agent thumbnail generation
    const prompt = `Create a sophisticated female AI robot portrait for a legal/business AI assistant.

Theme: ${categoryName || "Professional AI Assistant"} - ${agentTitle}

Style Requirements:
- Premium, elegant, futuristic cyberpunk meets luxury aesthetic
- Female android face with elegant, refined features
- Metallic chrome skin with gold (#B6904D) accent details
- Holographic elements floating around the head related to the theme
- ${colorPalette} combined with gold accents
- Professional, sophisticated, empowering appearance
- Dark gradient background for contrast
- Cinematic lighting with subtle rim lighting
- Square format (1:1 aspect ratio)
- NO text or words in the image
- Ultra high resolution, photorealistic render quality

The robot should embody intelligence, professionalism, and the specific theme of "${agentTitle}".`;

    console.log("Calling Lovable AI with prompt...");

    // Call Lovable AI to generate the image
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
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a few moments." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract the image URL from the response
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("No image generated in response");
    }

    console.log("Image generated successfully, uploading to storage...");

    // Initialize Supabase client for storage upload
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      // If no Supabase credentials, return the base64 image directly
      console.log("No Supabase credentials, returning base64 image");
      return new Response(
        JSON.stringify({ 
          thumbnail_url: imageUrl,
          message: "Thumbnail generated successfully" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract base64 data and convert to Uint8Array
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Generate unique filename
    const slug = agentTitle
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const timestamp = Date.now();
    const fileName = `${slug}-${timestamp}.png`;

    // Upload to storage bucket
    const { error: uploadError } = await supabase.storage
      .from("agent-thumbnails")
      .upload(fileName, binaryData, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      // Fallback to returning base64 if upload fails
      return new Response(
        JSON.stringify({ 
          thumbnail_url: imageUrl,
          message: "Thumbnail generated (storage upload failed, using base64)" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("agent-thumbnails")
      .getPublicUrl(fileName);

    console.log("Thumbnail uploaded successfully:", publicUrlData.publicUrl);

    return new Response(
      JSON.stringify({
        thumbnail_url: publicUrlData.publicUrl,
        message: "Thumbnail generated and uploaded successfully",
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
