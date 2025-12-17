import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get requesting user's auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to check permissions
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get requesting user
    const { data: { user: requestingUser }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if requesting user has permission to create admins
    const { data: permissions } = await supabaseAdmin
      .from("admin_permissions")
      .select("can_manage_admins")
      .eq("user_id", requestingUser.id)
      .single();

    if (!permissions?.can_manage_admins) {
      return new Response(
        JSON.stringify({ error: "You don't have permission to create administrators" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, password, fullName, permissions: newAdminPermissions } = await req.json();

    if (!email || !password || !fullName) {
      return new Response(
        JSON.stringify({ error: "Email, password and fullName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create user with admin service role
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add admin role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUser.user.id, role: "admin" });

    if (roleError) {
      console.error("Error adding role:", roleError);
      // Cleanup: delete user if role creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: "Failed to assign admin role" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create permissions record
    const { error: permError } = await supabaseAdmin
      .from("admin_permissions")
      .insert({
        user_id: newUser.user.id,
        can_manage_courses: newAdminPermissions?.can_manage_courses ?? false,
        can_manage_students: newAdminPermissions?.can_manage_students ?? false,
        can_manage_enrollments: newAdminPermissions?.can_manage_enrollments ?? false,
        can_manage_leads: newAdminPermissions?.can_manage_leads ?? false,
        can_view_reports: newAdminPermissions?.can_view_reports ?? false,
        can_send_notifications: newAdminPermissions?.can_send_notifications ?? false,
        can_manage_admins: newAdminPermissions?.can_manage_admins ?? false,
      });

    if (permError) {
      console.error("Error creating permissions:", permError);
    }

    console.log(`Admin created successfully: ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: { 
          id: newUser.user.id, 
          email: newUser.user.email,
          fullName 
        } 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
