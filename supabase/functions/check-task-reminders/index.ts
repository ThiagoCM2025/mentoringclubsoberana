import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Checking for tasks with pending reminders...");

    // Find tasks where reminder_at has passed and reminder hasn't been sent yet
    const now = new Date().toISOString();
    
    const { data: tasks, error: tasksError } = await supabase
      .from("admin_tasks")
      .select("*, profiles!admin_tasks_assigned_to_fkey(full_name)")
      .lte("reminder_at", now)
      .eq("reminder_sent", false)
      .neq("status", "completed")
      .neq("status", "cancelled");

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      throw tasksError;
    }

    console.log(`Found ${tasks?.length || 0} tasks with pending reminders`);

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending reminders", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let processed = 0;
    let emailsSent = 0;

    for (const task of tasks) {
      try {
        // Get admin email from auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(task.assigned_to);
        
        if (authError || !authUser?.user?.email) {
          console.error(`Could not get email for user ${task.assigned_to}:`, authError);
          continue;
        }

        const assignedEmail = authUser.user.email;
        const assignedName = (task.profiles as any)?.full_name || "Admin";
        const dueDate = new Date(task.due_date);
        const formattedDueDate = dueDate.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });

        // Send email if Resend is configured
        if (resendApiKey) {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: "Plataforma Soberana <noreply@clubesoberana.com.br>",
              to: [assignedEmail],
              subject: `⏰ Lembrete: ${task.title}`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                  <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Lembrete de Tarefa</h1>
                  </div>
                  
                  <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                      Olá, <strong>${assignedName}</strong>!
                    </p>
                    
                    <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                      Este é um lembrete da sua tarefa programada:
                    </p>
                    
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; border-left: 4px solid #6366f1; margin-bottom: 20px;">
                      <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">
                        ${task.title}
                      </h2>
                      ${task.description ? `<p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">${task.description}</p>` : ''}
                      <p style="color: #ef4444; margin: 0; font-size: 14px; font-weight: 600;">
                        📅 Prazo: ${formattedDueDate}
                      </p>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px;">
                      Este é um email automático da Plataforma Soberana.
                    </p>
                  </div>
                </body>
                </html>
              `,
            }),
          });

          if (emailResponse.ok) {
            emailsSent++;
            console.log(`Reminder email sent to ${assignedEmail} for task: ${task.title}`);
          } else {
            const errorText = await emailResponse.text();
            console.error(`Failed to send email to ${assignedEmail}:`, errorText);
          }
        }

        // Create in-app notification
        await supabase.from("admin_notifications").insert({
          event_type: "task_reminder",
          title: "⏰ Lembrete de Tarefa",
          message: `Lembrete: "${task.title}" - Prazo: ${formattedDueDate}`,
          metadata: {
            task_id: task.id,
            assigned_to: task.assigned_to,
            due_date: task.due_date
          }
        });

        // Mark reminder as sent
        await supabase
          .from("admin_tasks")
          .update({ reminder_sent: true })
          .eq("id", task.id);

        processed++;
      } catch (taskError) {
        console.error(`Error processing task ${task.id}:`, taskError);
      }
    }

    console.log(`Processed ${processed} reminders, sent ${emailsSent} emails`);

    return new Response(
      JSON.stringify({ 
        message: "Reminders processed", 
        processed,
        emailsSent 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in check-task-reminders:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
