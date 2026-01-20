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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to verify they are admin
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Not authorized - admin only" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user_id from request body
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent deleting yourself
    if (user_id === user.id) {
      return new Response(
        JSON.stringify({ error: "Cannot delete your own account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete related data in order (to respect foreign keys)
    // 1. Progress
    await adminClient.from("progress").delete().eq("user_id", user_id);

    // 2. Module completions
    await adminClient.from("module_completions").delete().eq("user_id", user_id);

    // 3. User mission completions
    await adminClient.from("user_mission_completions").delete().eq("user_id", user_id);

    // 4. Enrollments
    await adminClient.from("enrollments").delete().eq("user_id", user_id);

    // 5. AI agent access
    await adminClient.from("ai_agent_access").delete().eq("user_id", user_id);

    // 6. Student diagnostics
    await adminClient.from("student_diagnostics").delete().eq("user_id", user_id);

    // 7. User gamification
    await adminClient.from("user_gamification").delete().eq("user_id", user_id);

    // 8. Course gamification
    await adminClient.from("course_gamification").delete().eq("user_id", user_id);

    // 9. User badges
    await adminClient.from("user_badges").delete().eq("user_id", user_id);

    // 10. User rewards
    await adminClient.from("user_rewards").delete().eq("user_id", user_id);

    // 11. Certificates
    await adminClient.from("certificates").delete().eq("user_id", user_id);

    // 12. Notifications
    await adminClient.from("notifications").delete().eq("user_id", user_id);

    // 13. Community posts
    await adminClient.from("community_posts").delete().eq("user_id", user_id);

    // 14. Community comments
    await adminClient.from("community_comments").delete().eq("user_id", user_id);

    // 15. Community likes
    await adminClient.from("community_likes").delete().eq("user_id", user_id);

    // 16. Lesson notes
    await adminClient.from("lesson_notes").delete().eq("user_id", user_id);

    // 17. Study reminders
    await adminClient.from("study_reminders").delete().eq("user_id", user_id);

    // 18. Favorite lessons
    await adminClient.from("favorite_lessons").delete().eq("user_id", user_id);

    // 19. User roles
    await adminClient.from("user_roles").delete().eq("user_id", user_id);

    // 20. Profiles
    await adminClient.from("profiles").delete().eq("user_id", user_id);

    // Finally, delete the user from auth
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user_id);

    if (deleteError) {
      console.error("Error deleting auth user:", deleteError);
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Student deleted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in delete-student:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
