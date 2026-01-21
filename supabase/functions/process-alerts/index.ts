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
  
  // First get student user ids
  const { data: studentRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'student');

  if (rolesError || !studentRoles?.length) {
    console.log('No students found or error:', rolesError);
    return alerts;
  }

  const studentIds = studentRoles.map((r: any) => r.user_id);
  const thresholdDate = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000).toISOString();

  // Use updated_at as a proxy for last activity since last_access doesn't exist
  const { data: inactiveStudents, error } = await supabase
    .from('profiles')
    .select('id, user_id, full_name, updated_at')
    .in('user_id', studentIds)
    .lt('updated_at', thresholdDate);

  if (error) {
    console.error('Error checking inactive students:', error);
    return alerts;
  }

  for (const student of inactiveStudents || []) {
    alerts.push({
      type: 'student_inactive',
      title: `Aluna Inativa: ${student.full_name}`,
      message: `A aluna ${student.full_name} não tem atividade na plataforma há mais de ${thresholdDays} dias.`,
      severity: 'warning',
      details: {
        'Nome': student.full_name,
        'Última atividade': student.updated_at 
          ? new Date(student.updated_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
          : 'Sem registro',
      },
      entity_id: student.user_id,
      entity_type: 'student',
    });
  }

  return alerts;
}

async function checkMissionsPending(supabase: any, thresholdHours: number): Promise<AlertData[]> {
  const alerts: AlertData[] = [];
  const thresholdDate = new Date(Date.now() - thresholdHours * 60 * 60 * 1000).toISOString();
  
  // Check program_missions table for pending reviews
  const { data: pendingMissions, error } = await supabase
    .from('program_missions')
    .select('id, updated_at')
    .lt('updated_at', thresholdDate);

  // If table doesn't exist or no data, just return empty
  if (error) {
    console.log('Missions table not available or empty:', error.message);
    return alerts;
  }

  // For now, we skip mission alerts if no specific status tracking exists
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
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  const { data: newEnrollments, error } = await supabase
    .from('enrollments')
    .select('id, enrolled_at, user_id, course_id')
    .gte('enrolled_at', oneHourAgo);

  if (error) {
    console.error('Error checking new enrollments:', error);
    return alerts;
  }

  for (const enrollment of newEnrollments || []) {
    // Fetch student details
    const { data: student } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', enrollment.user_id)
      .single();

    // Fetch course details
    const { data: course } = await supabase
      .from('courses')
      .select('title')
      .eq('id', enrollment.course_id)
      .single();

    alerts.push({
      type: 'new_enrollment',
      title: `Nova Matrícula: ${student?.full_name || 'Aluna'}`,
      message: `${student?.full_name || 'Uma aluna'} se matriculou no curso ${course?.title || 'curso'}.`,
      severity: 'info',
      details: {
        'Aluna': student?.full_name || 'N/A',
        'Curso': course?.title || 'N/A',
        'Data': new Date(enrollment.enrolled_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      },
      entity_id: enrollment.id,
      entity_type: 'enrollment',
    });
  }

  return alerts;
}

async function checkNewWhatsAppMessages(supabase: any): Promise<AlertData[]> {
  const alerts: AlertData[] = [];
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  // Count incoming messages from last hour
  const { data: newMessages, error } = await supabase
    .from('whatsapp_messages')
    .select('id, conversation_id, message, created_at')
    .eq('direction', 'incoming')
    .gte('created_at', oneHourAgo);

  if (error) {
    console.error('Error checking new WhatsApp messages:', error);
    return alerts;
  }

  if (!newMessages || newMessages.length === 0) {
    return alerts;
  }

  // Get unique conversations with unread messages
  const conversationIds = [...new Set(newMessages.map((m: any) => m.conversation_id))];
  
  const { data: conversations } = await supabase
    .from('whatsapp_conversations')
    .select('id, contact_name, phone, unread_count')
    .in('id', conversationIds)
    .gt('unread_count', 0);

  if (!conversations || conversations.length === 0) {
    return alerts;
  }

  // Create consolidated alert
  const totalUnread = conversations.reduce((sum: number, c: any) => sum + (c.unread_count || 0), 0);
  const contactNames = conversations.slice(0, 3).map((c: any) => c.contact_name || c.phone).join(', ');
  const moreCount = conversations.length > 3 ? ` e mais ${conversations.length - 3}` : '';

  alerts.push({
    type: 'whatsapp_new_messages',
    title: `${totalUnread} Novas Mensagens no WhatsApp`,
    message: `Você tem ${totalUnread} mensagens não lidas de ${conversations.length} contato(s): ${contactNames}${moreCount}. Acesse o painel para responder.`,
    severity: 'warning',
    details: {
      'Total de mensagens': totalUnread,
      'Conversas com mensagens': conversations.length,
      'Contatos': contactNames + moreCount,
      'Período': 'Última hora',
    },
  });

  return alerts;
}

async function checkReportedPosts(supabase: any): Promise<AlertData[]> {
  const alerts: AlertData[] = [];
  
  const { data: reportedPosts, error } = await supabase
    .from('community_posts')
    .select('id, title, content, created_at, user_id')
    .eq('is_hidden', false);
    // Note: is_reported column may not exist, so we check all non-hidden posts
    // and filter in application logic if needed

  if (error) {
    console.error('Error checking reported posts:', error);
    return alerts;
  }

  // For now, skip reported posts check if no is_reported column
  // The main alerts (leads, students, enrollments, conversion) will still work
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
        from: 'Soberana Alertas <alertas@soberanamentoria.com.br>',
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

// Filter alerts based on type:
// - SITUATION ALERTS (lead_inactive, student_inactive): Only notify ONCE until situation is resolved
// - EVENT ALERTS (new_enrollment, whatsapp_new_messages): Notify with 1-hour deduplication window
async function filterNewAlerts(supabase: any, alerts: AlertData[]): Promise<AlertData[]> {
  const newAlerts: AlertData[] = [];
  
  // Situation alerts should only be sent ONCE until the situation changes
  // (when lead/student is updated, the trigger will clear the occurrence record)
  const situationAlertTypes = ['lead_inactive', 'student_inactive'];
  
  for (const alert of alerts) {
    let query = supabase
      .from('admin_alert_occurrences')
      .select('id')
      .eq('alert_type', alert.type);
    
    // For SITUATION alerts: check if EVER notified (no time limit)
    // The trigger will clear the record when situation resolves
    if (situationAlertTypes.includes(alert.type)) {
      if (alert.entity_id) {
        query = query.eq('entity_id', alert.entity_id);
      }
      // NO time filter - once notified, don't re-notify until trigger clears it
    } else {
      // For EVENT alerts: use 1-hour deduplication window
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', oneHourAgo);
      
      if (alert.entity_id) {
        query = query.eq('entity_id', alert.entity_id);
      } else {
        query = query.is('entity_id', null);
      }
    }
    
    const { data: existingAlert, error } = await query.maybeSingle();
    
    if (error) {
      console.error(`Error checking existing alert for ${alert.type}:`, error);
      newAlerts.push(alert);
      continue;
    }
    
    if (!existingAlert) {
      newAlerts.push(alert);
    } else {
      const reason = situationAlertTypes.includes(alert.type) 
        ? 'already notified (awaiting resolution)' 
        : 'notified within last hour';
      console.log(`Skipping alert ${alert.type} - ${alert.entity_id || 'consolidated'}: ${reason}`);
    }
  }
  
  return newAlerts;
}

// Record alert occurrences (only called for new alerts)
async function recordAlertOccurrences(supabase: any, alerts: AlertData[]): Promise<void> {
  if (alerts.length === 0) return;
  
  const records = alerts.map(alert => ({
    alert_type: alert.type,
    severity: alert.severity,
    title: alert.title,
    message: alert.message,
    entity_id: alert.entity_id || null,
    entity_type: alert.entity_type || null,
    metadata: alert.details,
  }));
  
  const { error } = await supabase
    .from('admin_alert_occurrences')
    .insert(records);
  
  if (error) {
    console.error('Error recording alert occurrences:', error);
  } else {
    console.log(`Recorded ${records.length} new alert occurrences`);
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
      lead_inactive: 24, // hours - leads quentes sem contato
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

    // Run all checks in parallel (focused on actionable alerts only)
    const [
      leadAlerts,
      enrollmentAlerts,
      whatsAppAlerts,
      reportedPostAlerts,
    ] = await Promise.all([
      checkLeadInactive(supabase, thresholds.lead_inactive),
      checkNewEnrollments(supabase),
      checkNewWhatsAppMessages(supabase),
      checkReportedPosts(supabase),
    ]);

    allAlerts.push(
      ...leadAlerts,
      ...enrollmentAlerts,
      ...whatsAppAlerts,
      ...reportedPostAlerts
    );

    console.log(`Found ${allAlerts.length} potential alerts`);

    // Filter out alerts that were already notified in the last hour
    const newAlerts = await filterNewAlerts(supabase, allAlerts);
    console.log(`New alerts (not notified yet): ${newAlerts.length} of ${allAlerts.length}`);

    // Record occurrences ONLY for new alerts
    if (newAlerts.length > 0) {
      await recordAlertOccurrences(supabase, newAlerts);
    }

    // Send emails ONLY for new alerts
    if (resendApiKey && newAlerts.length > 0) {
      await sendAlertEmails(resendApiKey, recipients, newAlerts);
      console.log(`Alert emails sent successfully for ${newAlerts.length} new alerts`);
    } else if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured - skipping email notifications');
    } else if (newAlerts.length === 0) {
      console.log('No new alerts to send - all already notified in last hour');
    }

    // Log execution
    await supabase.from('nurturing_executions').insert({
      type: 'alerts',
      emails_sent: newAlerts.length,
      emails_failed: 0,
      details: {
        total_alerts_found: allAlerts.length,
        new_alerts_sent: newAlerts.length,
        filtered_duplicates: allAlerts.length - newAlerts.length,
        alert_types: [...new Set(newAlerts.map(a => a.type))],
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        total_alerts_found: allAlerts.length,
        new_alerts_sent: newAlerts.length,
        filtered_duplicates: allAlerts.length - newAlerts.length,
        alerts: newAlerts.map(a => ({ type: a.type, title: a.title, severity: a.severity })),
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
