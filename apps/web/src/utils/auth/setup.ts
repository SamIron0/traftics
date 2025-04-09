import { SupabaseClient, User } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

export async function setupNewUser(supabase: SupabaseClient, user: User) {
  // Create a new organization
  const orgId = uuidv4();
  const { error: orgError } = await supabase.from("organizations").insert({
    id: orgId,
    name: `${user.email?.split("@")[0]}'s Organization`, // Create default org name from email
    size: 1,
  });

  if (orgError) {
    console.error("Error creating organization:", orgError);
    return { error: orgError };
  }

  const websiteId = uuidv4();
  const { error: profileError } = await supabase
    .from("user_profiles")
    .update({
      is_onboarded: true,
      org_id: orgId,
    })
    .eq("user_id", user.id);

  if (profileError) {
    console.error("Error updating profile:", profileError);
    return { error: profileError };
  }

  const { error: websiteError } = await supabase.from("websites").insert({
    id: websiteId,
    tracking_id: uuidv4(),
    verified: false,
    org_id: orgId,
    slug: "project-" + websiteId.slice(0, 8),
  });

  if (websiteError) {
    console.error("Error creating website:", websiteError);
    return { error: websiteError };
  }

  const { error: activeProjectError } = await supabase
    .from("user_profiles")
    .update({
      active_project_id: websiteId,
    })
    .eq("user_id", user.id);

  if (activeProjectError) {
    console.error("Error updating active project:", activeProjectError);
    return { error: activeProjectError };
  }

  return { error: null };
} 