import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

import { getBrazilNow, getBrazilWeekdayEnglish, getBrazilHour, getBrazilMinute } from "../_shared/dateUtils.ts";

interface StudyReminder {
  id: string;
  user_id: string;
  title: string;
  reminder_days: string[];
  reminder_time: string;
  is_enabled: boolean;
  course_ids: string[] | null;
}

interface Profile {
  user_id: string;
  full_name: string | null;
  email_reminders: boolean;
}

interface UserGamification {
  user_id: string;
  xp: number;
  streak_days: number;
  total_lessons_completed: number;
}

const DAY_MAP: Record<number, string> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

const generateEmailHTML = (
  studentName: string,
  reminderTitle: string,
  streakDays: number,
  lessonsCompleted: number,
  appUrl: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #64001C 0%, #8B0027 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #FFDFA6; font-size: 32px; margin: 0; font-family: Georgia, serif;">🔱 SOBERANA</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #64001C; font-size: 24px; margin: 0 0 20px 0;">
                    Olá, ${studentName}! 👋
                  </h2>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Este é o seu lembrete: <strong>${reminderTitle}</strong> ⏰
                  </p>
                  
                  <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
                    Não deixe seu progresso esfriar! Continue sua jornada para se tornar uma advogada Soberana.
                  </p>
                  
                  <!-- Stats -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f5f0; border-radius: 12px; margin-bottom: 30px;">
                    <tr>
                      <td style="padding: 20px; text-align: center; border-right: 1px solid #e0e0e0;">
                        <p style="color: #A69061; font-size: 28px; font-weight: bold; margin: 0;">${lessonsCompleted}</p>
                        <p style="color: #666; font-size: 12px; margin: 5px 0 0 0;">📚 Aulas concluídas</p>
                      </td>
                      <td style="padding: 20px; text-align: center;">
                        <p style="color: #FF6B35; font-size: 28px; font-weight: bold; margin: 0;">🔥 ${streakDays}</p>
                        <p style="color: #666; font-size: 12px; margin: 5px 0 0 0;">Dias de streak</p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="${appUrl}/student" style="display: inline-block; background: linear-gradient(135deg, #A69061 0%, #FFDFA6 100%); color: #64001C; font-size: 16px; font-weight: bold; text-decoration: none; padding: 16px 40px; border-radius: 8px;">
                          ▶️ CONTINUAR ESTUDANDO
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f5f0; padding: 20px 30px; text-align: center;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    Você recebeu este email porque configurou um lembrete de estudo.<br>
                    Para alterar suas preferências, acesse seu perfil no aplicativo.
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
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current day and time in Brasília timezone (GMT-3)
    const currentDay = getBrazilWeekdayEnglish();
    const currentHour = getBrazilHour();
    const currentMinute = getBrazilMinute();
    
    // Format current time for comparison (we check within a 30-minute window)
    console.log(`Running at: ${currentDay}, ${currentHour}:${currentMinute} Brasília (GMT-3)`);

    // Fetch all enabled reminders
    const { data: reminders, error: remindersError } = await supabase
      .from("study_reminders")
      .select("*")
      .eq("is_enabled", true);

    if (remindersError) {
      console.error("Error fetching reminders:", remindersError);
      throw remindersError;
    }

    if (!reminders || reminders.length === 0) {
      console.log("No active reminders found");
      return new Response(JSON.stringify({ message: "No reminders to process" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Filter reminders that should be sent now
    const remindersToSend = (reminders as StudyReminder[]).filter((reminder) => {
      // Check if today is in the reminder days
      if (!reminder.reminder_days.includes(currentDay)) {
        return false;
      }

      // Parse reminder time (format: "HH:MM")
      const [reminderHour, reminderMinute] = reminder.reminder_time.split(":").map(Number);
      
      // Check if current time matches (within 30-minute window for cron job)
      // This accounts for the hourly cron job
      return reminderHour === currentHour && Math.abs(reminderMinute - currentMinute) < 30;
    });

    console.log(`Found ${remindersToSend.length} reminders to send`);

    if (remindersToSend.length === 0) {
      return new Response(JSON.stringify({ message: "No reminders to send at this time" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get user IDs
    const userIds = [...new Set(remindersToSend.map(r => r.user_id))];

    // Fetch profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, email_reminders")
      .in("user_id", userIds);

    // Fetch gamification data
    const { data: gamificationData } = await supabase
      .from("user_gamification")
      .select("user_id, xp, streak_days, total_lessons_completed")
      .in("user_id", userIds);

    // Fetch user emails from auth
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const userEmailMap = new Map(users?.map(u => [u.id, u.email]) || []);

    const profileMap = new Map(
      (profiles as Profile[] || []).map(p => [p.user_id, p])
    );
    const gamificationMap = new Map(
      (gamificationData as UserGamification[] || []).map(g => [g.user_id, g])
    );

    const appUrl = Deno.env.get("APP_URL") || "https://soberana.lovable.app";
    const fromEmail = Deno.env.get("FROM_EMAIL") || "Soberana <onboarding@resend.dev>";

    let sentCount = 0;
    let errorCount = 0;

    // Send emails
    for (const reminder of remindersToSend) {
      const profile = profileMap.get(reminder.user_id);
      const gamification = gamificationMap.get(reminder.user_id);
      const userEmail = userEmailMap.get(reminder.user_id);

      // Skip if user disabled email reminders
      if (profile && !profile.email_reminders) {
        console.log(`Skipping ${reminder.user_id} - email reminders disabled`);
        continue;
      }

      if (!userEmail) {
        console.log(`Skipping ${reminder.user_id} - no email found`);
        continue;
      }

      const studentName = profile?.full_name || "Aluna";
      const streakDays = gamification?.streak_days || 0;
      const lessonsCompleted = gamification?.total_lessons_completed || 0;

      const html = generateEmailHTML(
        studentName,
        reminder.title,
        streakDays,
        lessonsCompleted,
        appUrl
      );

      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [userEmail],
            subject: `⏰ ${reminder.title} - Hora de estudar!`,
            html,
          }),
        });

        const emailResult = await emailResponse.json();
        console.log(`Email sent to ${userEmail}:`, emailResult);
        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send email to ${userEmail}:`, emailError);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Reminders processed", 
        sent: sentCount, 
        errors: errorCount 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-study-reminder function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
