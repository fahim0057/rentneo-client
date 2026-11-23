"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  image?: string | null;
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
  const [email, setEmail] = useState(user.email);
  const [image, setImage] = useState(user.image ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [address, setAddress] = useState(user.address ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const body = (await res.json().catch(() => null)) as
        | { url?: string; message?: string }
        | null;
      if (!res.ok || !body?.url) {
        throw new Error(body?.message ?? "Upload failed");
      }
      setImage(body.url);
      toast.success("Photo uploaded. Save to apply it.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload photo");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      toast.error("Please enter your name.");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    setSaving(true);
    try {
      if (trimmedEmail !== user.email.toLowerCase()) {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmedEmail }),
        });
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        if (!res.ok) {
          toast.error(body?.message ?? "Could not update your email");
          return;
        }
      }

      const { error } = await authClient.updateUser({
        name: trimmedName,
        image: image.trim(),
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarImage src={image || undefined} alt={name} />
            <AvatarFallback>{name.charAt(0).toUpperCase() || "?"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Label htmlFor="profile-image">Profile photo</Label>
            <Input
              id="profile-image"
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="profile-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFile}
                disabled={uploading}
                className="max-w-64"
              />
              {uploading && (
                <span className="text-xs text-muted-foreground">Uploading...</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Paste a direct image link or upload a JPG, PNG, WEBP or GIF (max 4 MB).
            </p>
          </div>
        </div>

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
          <Input
            id="profile-email"
            type="email"
            required
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Used to sign in. Changing it updates your login email immediately.
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
