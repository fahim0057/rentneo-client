"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  phone?: string | null;
  address?: string | null;
}

export default function ProfileView() {
  const { data: session, isPending, refetch } = authClient.useSession();

  if (isPending || !session) {
    return <p className="py-10 text-center text-muted-foreground">Loading profile...</p>;
  }

  return <ProfileForm key={session.user.id} user={session.user} onSaved={refetch} />;
}

function ProfileForm({
  user,
  onSaved,
}: {
  user: ProfileUser;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [address, setAddress] = useState(user.address ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      toast.error("Please enter your name.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await authClient.updateUser({
        name: trimmedName,
        phone: phone.trim(),
        address: address.trim(),
      });
      if (error) {
        toast.error(error.message ?? "Could not update your profile");
        return;
      }
      await onSaved();
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update your profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-1 text-2xl font-bold">Profile</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Your name appears on bookings and reviews. Phone and address are used as
        defaults during checkout.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="profile-name">Full name</Label>
          <Input
            id="profile-name"
            required
            minLength={2}
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={user.email} readOnly disabled />
          <p className="text-xs text-muted-foreground">
            Email changes are not available here yet.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-phone">Phone</Label>
          <Input
            id="profile-phone"
            maxLength={20}
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-address">Address</Label>
          <Textarea
            id="profile-address"
            maxLength={200}
            placeholder="Street, area, city"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
