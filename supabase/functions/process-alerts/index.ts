import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertRule {
  id: string;
  name: string;
  alert_type: string;
  threshold_value: number;
  severity: string;
  is_active: boolean;
}

interface EmailRecipient {
  email: string;
  name: string;
  is_primary: boolean;
  notify_critical: boolean;
  notify_warning: boolean;
  notify_info: boolean;
}

interface AlertData {
  type: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  details?: Record<string, any>;
  entity_id?: string;
  entity_type?: string;
}

const severityConfig = {
  critical: { color: '#dc2626', emoji: '🚨', label: 'CRÍTICO' },
  warning: { color: '#f59e0b', emoji: '⚠️', label: 'ATENÇÃO' },
  info: { color: '#3b82f6', emoji: 'ℹ️', label: 'INFO' },
};

function generateAlertEmailTemplate(alert: AlertData): string {
  const config = severityConfig[alert.severity];
  
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
                <td style="background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                    ${config.emoji} ALERTA: ${config.label}
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">
                    ${alert.title}
                  </h2>
                  
                  <p style="color: #4a4a4a; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
                    ${alert.message}
                  </p>
                  
                  ${alert.details ? `
                    <div style="background-color: #f8f4f0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                      <h3 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 14px; font-weight: 600; text-transform: uppercase;">
                        Detalhes
                      </h3>
                      ${Object.entries(alert.details).map(([key, value]) => `
                        <p style="color: #4a4a4a; margin: 0 0 8px 0; font-size: 14px;">
                          <strong>${key}:</strong> ${value}
                        </p>
                      `).join('')}
                    </div>
                  ` : ''}
                  
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="https://mentoringclubsoberana.lovable.app/admin/dashboard" 
                           style="display: inline-block; background: linear-gradient(135deg, #b8860b 0%, #d4a843 100%); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                          Acessar Painel Admin
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f4f0; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
                  <p style="color: #888888; margin: 0 0 5px 0; font-size: 12px;">
                    Tipo: <strong>${alert.type}</strong> | Detectado: <strong>${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</strong>
                  </p>
                  <p style="color: #888888; margin: 0; font-size: 12px;">
                    Sistema de Alertas - Mentoring Club Soberana
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

async function checkLeadInactive(supabase: any, thresholdHours: number): Promise<AlertData[]> {
  const alerts: AlertData[] = [];
  
  const { data: inactiveLeads, error } = await supabase
    .from('leads')
    .select('id, full_name, email, temperature, updated_at')
    .eq('temperature', 'hot')
    .not('status', 'in', '("converted","lost")')
    .lt('updated_at', new Date(Date.now() - thresholdHours * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('Error checking inactive leads:', error);
    return alerts;
  }

  for (const lead of inactiveLeads || []) {
    alerts.push({
      type: 'lead_inactive',
      title: `Lead Quente sem Contato: ${lead.full_name}`,
      message: `O lead ${lead.full_name} (${lead.email}) está classificado como "quente" mas não recebe contato há mais de ${thresholdHours} horas.`,
      severity: 'critical',
      details: {
        'Nome': lead.full_name,
        'E-mail': lead.email,
        'Temperatura': 'Quente 🔥',
        'Última atualização': new Date(lead.updated_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      },
      entity_id: lead.id,
      entity_type: 'lead',
    });
  }

  return alerts;
}

async function checkStudentInactive(supabase: any, thresholdDays: number): Promise<AlertData[]> {
  const alerts: AlertData[] = [];
  
  const { data: inactiveStudents, error } = await supabase
    .from('profiles')
    .select(`
      id, 
      full_name, 
      email, 
      last_access,
      user_roles!inner(role)
    `)
    .eq('user_roles.role', 'student')
    .lt('last_access', new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('Error checking inactive students:', error);
    return alerts;
  }

  for (const student of inactiveStudents || []) {
    alerts.push({
      type: 'student_inactive',
      title: `Aluna Inativa: ${student.full_name}`,
      message: `A aluna ${student.full_name} não acessa a plataforma há mais de ${thresholdDays} dias.`,
      severity: 'warning',
      details: {
        'Nome': student.full_name,
        'E-mail': student.email,
        'Último acesso': student.last_access 
          ? new Date(student.last_access).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
          : 'Nunca acessou',
      },
      entity_id: student.id,
      entity_type: 'student',
    });
  }

  return alerts;
}

async function checkMissionsPending(supabase: any, thresholdHours: number): Promise<AlertData[]> {
  const alerts: AlertData[] = [];
  
  const { data: pendingMissions, error } = await supabase
    .from('student_missions')
    .select(`
      id,
      updated_at,
      student:profiles!student_missions_student_id_fkey(full_name, email),
      mission:missions(title)
    `)
    .eq('status', 'pending_review')
    .lt('updated_at', new Date(Date.now() - thresholdHours * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('Error checking pending missions:', error);
    return alerts;
  }

  if (pendingMissions && pendingMissions.length > 0) {
    // Group alert - one alert for all pending missions
    alerts.push({
      type: 'mission_pending',
      title: `${pendingMissions.length} Missões Aguardando Revisão`,
      message: `Existem ${pendingMissions.length} missões aguardando revisão há mais de ${thresholdHours} horas.`,
      severity: 'warning',
      details: {
        'Total pendente': `${pendingMissions.length} missões`,
        'Mais antiga': new Date(Math.min(...pendingMissions.map((m: any) => new Date(m.updated_at).getTime()))).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      },
    });
  }

  return alerts;
}

async function checkLowConversion(supabase: any, thresholdPercentage: number): Promise<AlertData[]> {
  const alerts: AlertData[] = [];
  
  // Get leads from last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data: leadsData, error } = await supabase
    .from('leads')
    .select('status')
    .gte('created_at', thirtyDaysAgo);

  if (error) {
    console.error('Error checking conversion rate:', error);
    return alerts;
  }

  const totalLeads = leadsData?.length || 0;
  const convertedLeads = leadsData?.filter((l: any) => l.status === 'converted').length || 0;
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  if (totalLeads >= 10 && conversionRate < thresholdPercentage) {
    alerts.push({
      type: 'low_conversion',
      title: 'Taxa de Conversão Baixa',
      message: `A taxa de conversão dos últimos 30 dias está em ${conversionRate.toFixed(1)}%, abaixo do esperado de ${thresholdPercentage}%.`,
      severity: 'info',
      details: {
        'Total de leads': totalLeads,
        'Convertidos': convertedLeads,
        'Taxa atual': `${conversionRate.toFixed(1)}%`,
        'Meta': `${thresholdPercentage}%`,
      },
    });
  }

  return alerts;
}

async function checkNewEnrollments(supabase: any): Promise<AlertData[]> {
  const alerts: AlertData[] = [];
  
  // Check enrollments in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  const { data: newEnrollments, error } = await supabase
    .from('enrollments')
    .select(`
      id,
      enrolled_at,
      student:profiles!enrollments_student_id_fkey(full_name, email),
      program:programs(name)
    `)
    .gte('enrolled_at', oneHourAgo);

  if (error) {
    console.error('Error checking new enrollments:', error);
    return alerts;
  }

  for (const enrollment of newEnrollments || []) {
    alerts.push({
      type: 'new_enrollment',
      title: `Nova Matrícula: ${enrollment.student?.full_name}`,
      message: `${enrollment.student?.full_name} se matriculou no programa ${enrollment.program?.name}.`,
      severity: 'info',
      details: {
        'Aluna': enrollment.student?.full_name,
        'E-mail': enrollment.student?.email,
        'Programa': enrollment.program?.name,
        'Data': new Date(enrollment.enrolled_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      },
      entity_id: enrollment.id,
      entity_type: 'enrollment',
    });
  }

  return alerts;
}

async function checkReportedPosts(supabase: any): Promise<AlertData[]> {
  const alerts: AlertData[] = [];
  
  const { data: reportedPosts, error } = await supabase
    .from('community_posts')
    .select(`
      id,
      title,
      content,
      created_at,
      author:profiles!community_posts_author_id_fkey(full_name)
    `)
    .eq('is_reported', true)
    .eq('is_hidden', false);

  if (error) {
    console.error('Error checking reported posts:', error);
    return alerts;
  }

  for (const post of reportedPosts || []) {
    alerts.push({
      type: 'community_report',
      title: `Post Reportado na Comunidade`,
      message: `Um post de ${post.author?.full_name} foi reportado e precisa de revisão.`,
      severity: 'warning',
      details: {
        'Autor': post.author?.full_name,
        'Título': post.title || 'Sem título',
        'Conteúdo': post.content?.substring(0, 100) + (post.content?.length > 100 ? '...' : ''),
        'Data': new Date(post.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      },
      entity_id: post.id,
      entity_type: 'community_post',
    });
  }

  return alerts;
}

async function sendAlertEmails(resendApiKey: string, recipients: EmailRecipient[], alerts: AlertData[]): Promise<void> {
  const { Resend } = await import("https://esm.sh/resend@2.0.0");
  for (const alert of alerts) {
    // Filter recipients based on severity preferences
    const eligibleRecipients = recipients.filter(r => {
      if (alert.severity === 'critical') return r.notify_critical;
      if (alert.severity === 'warning') return r.notify_warning;
      return r.notify_info;
    });

    if (eligibleRecipients.length === 0) continue;

    const primaryRecipient = eligibleRecipients.find(r => r.is_primary) || eligibleRecipients[0];
    const ccRecipients = eligibleRecipients.filter(r => r.email !== primaryRecipient.email).map(r => r.email);

    try {
      const resend = new Resend(resendApiKey);
      const emailResponse = await resend.emails.send({
        from: 'Soberana Alertas <alertas@resend.dev>',
        to: [primaryRecipient.email],
        cc: ccRecipients.length > 0 ? ccRecipients : undefined,
        subject: `${severityConfig[alert.severity].emoji} [${severityConfig[alert.severity].label}] ${alert.title}`,
        html: generateAlertEmailTemplate(alert),
      });

      console.log(`Alert email sent for ${alert.type}:`, emailResponse);
    } catch (error) {
      console.error(`Error sending alert email for ${alert.type}:`, error);
    }
  }
}

async function recordAlertOccurrences(supabase: any, alerts: AlertData[]): Promise<void> {
  for (const alert of alerts) {
    // Check if similar alert was already recorded recently (avoid duplicates)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: existingAlert } = await supabase
      .from('admin_alert_occurrences')
      .select('id')
      .eq('alert_type', alert.type)
      .eq('entity_id', alert.entity_id || null)
      .gte('created_at', oneHourAgo)
      .single();

    if (!existingAlert) {
      await supabase.from('admin_alert_occurrences').insert({
        alert_type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        entity_id: alert.entity_id,
        entity_type: alert.entity_type,
        metadata: alert.details,
      });
    }
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Starting alert processing...');

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch email recipients
    const { data: recipients, error: recipientsError } = await supabase
      .from('admin_alert_email_config')
      .select('*')
      .eq('is_active', true);

    if (recipientsError || !recipients?.length) {
      console.error('No active email recipients found:', recipientsError);
      return new Response(
        JSON.stringify({ error: 'No active email recipients configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${recipients.length} active email recipients`);

    // Fetch active alert rules
    const { data: alertRules, error: rulesError } = await supabase
      .from('admin_alert_rules')
      .select('*')
      .eq('is_active', true);

    if (rulesError) {
      console.error('Error fetching alert rules:', rulesError);
    }

    // Default thresholds if no rules defined
    const defaultThresholds = {
      lead_inactive: 24, // hours
      student_inactive: 7, // days
      mission_pending: 48, // hours
      low_conversion: 10, // percentage
    };

    // Get thresholds from rules or use defaults
    const thresholds = { ...defaultThresholds };
    for (const rule of alertRules || []) {
      if (thresholds.hasOwnProperty(rule.alert_type)) {
        thresholds[rule.alert_type as keyof typeof thresholds] = rule.threshold_value;
      }
    }

    console.log('Using thresholds:', thresholds);

    // Collect all alerts
    const allAlerts: AlertData[] = [];

    // Run all checks in parallel
    const [
      leadAlerts,
      studentAlerts,
      missionAlerts,
      conversionAlerts,
      enrollmentAlerts,
      reportedPostAlerts,
    ] = await Promise.all([
      checkLeadInactive(supabase, thresholds.lead_inactive),
      checkStudentInactive(supabase, thresholds.student_inactive),
      checkMissionsPending(supabase, thresholds.mission_pending),
      checkLowConversion(supabase, thresholds.low_conversion),
      checkNewEnrollments(supabase),
      checkReportedPosts(supabase),
    ]);

    allAlerts.push(
      ...leadAlerts,
      ...studentAlerts,
      ...missionAlerts,
      ...conversionAlerts,
      ...enrollmentAlerts,
      ...reportedPostAlerts
    );

    console.log(`Found ${allAlerts.length} alerts to process`);

    // Record alert occurrences
    await recordAlertOccurrences(supabase, allAlerts);

    // Send emails if Resend is configured
    if (resendApiKey && allAlerts.length > 0) {
      await sendAlertEmails(resendApiKey, recipients, allAlerts);
      console.log('Alert emails sent successfully');
    } else if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured - skipping email notifications');
    }

    // Log execution
    await supabase.from('nurturing_executions').insert({
      type: 'alerts',
      emails_sent: allAlerts.length,
      emails_failed: 0,
      details: {
        alerts_processed: allAlerts.length,
        alert_types: [...new Set(allAlerts.map(a => a.type))],
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        alerts_processed: allAlerts.length,
        alerts: allAlerts.map(a => ({ type: a.type, title: a.title, severity: a.severity })),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error processing alerts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
