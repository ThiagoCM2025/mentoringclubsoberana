 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 interface ResendInboundEmail {
   from: string;
   to: string;
   subject: string;
   text: string;
   html: string;
   reply_to?: string;
   headers: Record<string, string>;
   attachments?: Array<{
     filename: string;
     content_type: string;
     content: string;
   }>;
 }
 
 // Parse "Name <email@example.com>" format
 function parseEmailAddress(emailString: string): { name: string | null; email: string } {
   const match = emailString.match(/^(.+?)\s*<([^>]+)>$/);
   if (match) {
     return { name: match[1].trim(), email: match[2].trim().toLowerCase() };
   }
   return { name: null, email: emailString.trim().toLowerCase() };
 }
 
 serve(async (req: Request): Promise<Response> => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const payload: ResendInboundEmail = await req.json();
     console.log("Received inbound email:", JSON.stringify(payload, null, 2));
 
     const { name: fromName, email: fromEmail } = parseEmailAddress(payload.from);
     const toEmail = parseEmailAddress(payload.to).email;
 
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     const supabase = createClient(supabaseUrl, supabaseServiceKey);
 
     // Try to find lead by email
     const { data: lead } = await supabase
       .from("leads")
       .select("id")
       .eq("email", fromEmail)
       .maybeSingle();
 
     // Try to find student by email (via auth.users would need service role)
     // For now we'll link via lead_id
 
     // Insert inbound email
     const { data: insertedEmail, error: insertError } = await supabase
       .from("inbound_emails")
       .insert({
         from_email: fromEmail,
         from_name: fromName,
         to_email: toEmail,
         subject: payload.subject,
         body_text: payload.text,
         body_html: payload.html,
         reply_to: payload.reply_to,
         message_id: payload.headers?.["message-id"],
         in_reply_to: payload.headers?.["in-reply-to"],
         headers: payload.headers,
         attachments: payload.attachments,
         lead_id: lead?.id || null,
         received_at: new Date().toISOString(),
       })
       .select()
       .single();
 
     if (insertError) {
       console.error("Error inserting email:", insertError);
       return new Response(JSON.stringify({ error: "Failed to save email" }), {
         status: 500,
         headers: { "Content-Type": "application/json", ...corsHeaders },
       });
     }
 
     // Register engagement event if lead exists
     if (lead?.id) {
       await supabase.from("lead_engagement_events").insert({
         lead_id: lead.id,
         event_type: "email_reply",
         points: 25,
         event_data: {
           email_id: insertedEmail.id,
           subject: payload.subject,
         },
       });
     }
 
     console.log("Email saved successfully:", insertedEmail.id);
 
     return new Response(
       JSON.stringify({ success: true, email_id: insertedEmail.id }),
       {
         status: 200,
         headers: { "Content-Type": "application/json", ...corsHeaders },
       }
     );
   } catch (error: unknown) {
     console.error("Error processing inbound email:", error);
     return new Response(
       JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
       {
         status: 500,
         headers: { "Content-Type": "application/json", ...corsHeaders },
       }
     );
   }
 });