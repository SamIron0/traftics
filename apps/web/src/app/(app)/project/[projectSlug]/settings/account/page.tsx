"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";

export default function AccountPage() {
  const { user } = useAuthStatus();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const { toast } = useToast();
  const user_id = user?.id || "22acab5b-c6fd-4eef-b456-29d7fd4753a7";
  const router = useRouter();
  const initializeState = useAppStore((state) => state.initializeState);

  useEffect(() => {
    async function fetchUserProfile() {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("full_name")
        .eq("user_id", user_id)
        .single();

      if (profile) {
        setFullName(profile.full_name);
      }
    }

    fetchUserProfile();
  }, [user_id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    if (!user?.id) {
      router.push("/signup");
      return;
    }
    e.preventDefault();
    setLoading(true);
    toast({
      description: "Updating profile...",
    });
    try {
      if (!user) throw new Error("User not found");
      const supabase = createClient();

      // Update full name in user_profiles
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({ full_name: fullName })
        .eq("user_id", user?.id);

      if (profileError) throw profileError;

      // Re-initialize app state to update the store
      await initializeState(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        description: "Failed to update profile",
      });
      return;
    } finally {
      setLoading(false);
      toast({
        description: "Profile updated successfully!",
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Account Settings</h1>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() =>
                user?.id
                  ? (window.location.href = "/forgot-password")
                  : router.push("/signup")
              }
            >
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
