"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import { CATEGORIES, CONDITIONS, RENTAL_TYPES, type Equipment } from "@/lib/equipment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function EquipmentForm({
  initial,
  redirectTo = "/dashboard/owner/my-equipment",
}: {
  initial?: Equipment;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [image, setImage] = useState(initial?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? "Upload failed");
      setImage(body.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!image) {
      toast.error("Please upload an equipment image.");
      return;
    }
    const f = new FormData(e.currentTarget);
    const payload = {
      name: f.get("name"),
      description: f.get("description"),
      category: f.get("category"),
      location: f.get("location"),
      rentalPrice: f.get("rentalPrice"),
      rentalType: f.get("rentalType"),
      availableQuantity: f.get("availableQuantity"),
      condition: f.get("condition"),
      brand: f.get("brand"),
      model: f.get("model"),
      image,
      terms: f.get("terms"),
    };

    setSaving(true);
    try {
      if (initial) {
        await apiFetch(`/api/equipment/${initial._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success(
          session?.user.role === "admin"
            ? "Equipment updated."
            : "Equipment updated. It will be reviewed again by an admin."
        );
      } else {
        await apiFetch("/api/equipment", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Equipment submitted for approval.");
      }
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="name">Equipment name</Label>
        <Input id="name" name="name" required minLength={3} defaultValue={initial?.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select id="category" name="category" required className={selectClass}
                defaultValue={initial?.category ?? ""}>
          <option value="" disabled>Select a category</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required minLength={10} rows={4}
                  defaultValue={initial?.description} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" required defaultValue={initial?.location} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rentalPrice">Rental price (BDT)</Label>
        <Input id="rentalPrice" name="rentalPrice" type="number" required min="1" step="0.01"
               defaultValue={initial?.rentalPrice} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rentalType">Rental type</Label>
        <select id="rentalType" name="rentalType" required className={selectClass}
                defaultValue={initial?.rentalType ?? "daily"}>
          {RENTAL_TYPES.map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="availableQuantity">Available quantity</Label>
        <Input id="availableQuantity" name="availableQuantity" type="number" required min="0"
               step="1" defaultValue={initial?.availableQuantity} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="condition">Condition</Label>
        <select id="condition" name="condition" required className={selectClass}
                defaultValue={initial?.condition ?? "good"}>
          {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" name="brand" required defaultValue={initial?.brand} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" required defaultValue={initial?.model} />
        </div>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="file">Equipment image</Label>
        <Input id="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif"
               onChange={handleFile} disabled={uploading} />
        {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="Equipment preview"
               className="mt-2 h-40 w-60 rounded-md border object-cover" />
        )}
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="terms">Rental terms and conditions</Label>
        <Textarea id="terms" name="terms" required minLength={10} rows={4}
                  defaultValue={initial?.terms} />
      </div>

      <div className="rounded-md border bg-muted/40 p-3 text-sm md:col-span-2">
        <p>
          <span className="font-medium">Status:</span>{" "}
          {initial && session?.user.role === "admin"
            ? `Kept as ${initial.status}`
            : "Pending (until an admin approves)"}
        </p>
        <p><span className="font-medium">Owner:</span>{" "}
          {initial?.ownerName ?? session?.user.name} ({initial?.ownerEmail ?? session?.user.email})
        </p>
      </div>

      <div className="md:col-span-2">
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Saving..." : initial ? "Update equipment" : "Add equipment"}
        </Button>
      </div>
    </form>
  );
}