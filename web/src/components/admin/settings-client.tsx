"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: "Super-Admin",
  ADMIN: "Admin",
  FARMER: "Farmer",
};

interface SettingsClientProps {
  userEmail: string;
  userName: string;
  userRole: string;
}

export function SettingsClient({ userEmail, userName, userRole }: SettingsClientProps) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "password" ? "password" : "profile";

  const [profileName, setProfileName] = useState(userName);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: profileName }),
    });
    setProfileLoading(false);
    setProfileMsg(res.ok ? { ok: true, text: "Profile updated." } : { ok: false, text: "Update failed. Please try again." });
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ ok: false, text: "New passwords do not match." });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg(null);
    const res = await fetch("/api/users/me/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setPasswordLoading(false);
    if (res.ok) {
      setPasswordMsg({ ok: true, text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      const data = await res.json();
      setPasswordMsg({ ok: false, text: data?.error?.message ?? "Failed to change password." });
    }
  }

  return (
    <Tabs defaultValue={defaultTab} className="space-y-4">
      <TabsList className="border border-brand-100 bg-brand-50">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card className="border-brand-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-brand-800">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="space-y-1">
                <Label>Full name</Label>
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  minLength={2}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>E-mail</Label>
                <Input value={userEmail} disabled className="bg-slate-50 text-earth-500" />
                <p className="text-xs text-earth-400">E-mail can only be changed by a Super-Admin.</p>
              </div>
              <div className="space-y-1">
                <Label>Role</Label>
                <div className="pt-1">
                  <Badge variant="outline" className="text-brand-700 border-brand-300">
                    {roleLabel[userRole] ?? userRole}
                  </Badge>
                </div>
              </div>
              {profileMsg && (
                <p className={`text-sm flex items-center gap-1.5 ${profileMsg.ok ? "text-brand-600" : "text-alert-high"}`}>
                  {profileMsg.ok && <CheckCircle2 size={14} />}
                  {profileMsg.text}
                </p>
              )}
              <Button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white" disabled={profileLoading}>
                {profileLoading && <Loader2 size={14} className="animate-spin mr-2" />}
                Save changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="password">
        <Card className="border-brand-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-brand-800">Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-4">
              <div className="space-y-1">
                <Label>Current password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-1">
                <Label>New password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-1">
                <Label>Confirm new password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              {passwordMsg && (
                <p className={`text-sm flex items-center gap-1.5 ${passwordMsg.ok ? "text-brand-600" : "text-alert-high"}`}>
                  {passwordMsg.ok && <CheckCircle2 size={14} />}
                  {passwordMsg.text}
                </p>
              )}
              <Button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white" disabled={passwordLoading}>
                {passwordLoading && <Loader2 size={14} className="animate-spin mr-2" />}
                Change password
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
