import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TaskNotificationRequest {
  taskId: string;
  assignedTo: string;
  title: string;
  dueDate: string;
  createdByName?: string;
  description?: string;
  priority?: string;
}

function generateTaskEmailTemplate(data: TaskNotificationRequest, assigneeName: string): string {
  const priorityConfig: Record<string, { color: string; label: string }> = {
    urgent: { color: '#dc2626', label: 'URGENTE' },
    high: { color: '#f59e0b', label: 'Alta' },
    medium: { color: '#3b82f6', label: 'Média' },
    low: { color: '#10b981', label: 'Baixa' },
  };

  const priority = priorityConfig[data.priority || 'medium'];
  const dueDate = new Date(data.dueDate).toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f4f0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f4f0; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #b8860b 0%, #d4a843 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                    📋 Nova Tarefa Atribuída
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #4a4a4a; margin: 0 0 20px 0; font-size: 16px;">
                    Olá, <strong>${assigneeName}</strong>!
                  </p>
                  
                  <p style="color: #4a4a4a; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
                    ${data.createdByName ? `<strong>${data.createdByName}</strong> atribuiu uma nova tarefa para você:` : 'Uma nova tarefa foi atribuída para você:'}
                  </p>
                  
                  <div style="background-color: #f8f4f0; border-radius: 8px; padding: 25px; margin-bottom: 25px; border-left: 4px solid ${priority.color};">
                    <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">
                      ${data.title}
                    </h2>
                    
                    ${data.description ? `
                      <p style="color: #4a4a4a; margin: 0 0 15px 0; font-size: 14px; line-height: 1.6;">
                        ${data.description}
                      </p>
                    ` : ''}
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #888888; font-size: 13px;">📅 Prazo:</span>
                          <span style="color: #1a1a1a; font-size: 14px; font-weight: 500; margin-left: 8px;">${dueDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #888888; font-size: 13px;">🏷️ Prioridade:</span>
                          <span style="display: inline-block; background-color: ${priority.color}; color: #ffffff; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 4px; margin-left: 8px;">
                            ${priority.label}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="https://mentoringclubsoberana.lovable.app/admin/tasks" 
                           style="display: inline-block; background: linear-gradient(135deg, #b8860b 0%, #d4a843 100%); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                          Ver Minhas Tarefas
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f4f0; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
                  <p style="color: #888888; margin: 0; font-size: 12px;">
                    Sistema de Tarefas - Mentoring Club Soberana
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: true, message: "Email skipped - no API key" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const data: TaskNotificationRequest = await req.json();

    console.log("Processing task notification:", data);

    // Get assigned user's profile and email
    const { data: assigneeProfile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, user_id")
      .eq("user_id", data.assignedTo)
      .single();

    if (profileError || !assigneeProfile) {
      console.error("Error fetching assignee profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Assignee not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's email from auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(data.assignedTo);

    if (authError || !authUser?.user?.email) {
      console.error("Error fetching user email:", authError);
      return new Response(
        JSON.stringify({ error: "User email not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const assigneeEmail = authUser.user.email;
    const assigneeName = assigneeProfile.full_name || "Admin";

    // Send email notification
    const resend = new Resend(resendApiKey);
    const emailResponse = await resend.emails.send({
      from: "Soberana Tarefas <tarefas@soberanamentoria.com.br>",
      to: [assigneeEmail],
      subject: `📋 Nova Tarefa: ${data.title}`,
      html: generateTaskEmailTemplate(data, assigneeName),
    });

    console.log("Task notification email sent:", emailResponse);

    // Create admin notification
    await supabase.from("admin_notifications").insert({
      event_type: "task_assigned",
      title: "Nova Tarefa Atribuída",
      message: `${data.createdByName || "Alguém"} atribuiu a tarefa "${data.title}" para você.`,
      metadata: {
        task_id: data.taskId,
        due_date: data.dueDate,
        priority: data.priority,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_sent: true,
        recipient: assigneeEmail 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending task notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
