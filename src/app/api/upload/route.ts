import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

export async function POST(req: Request) {
  // Only logged-in users may upload, so strangers can't use your ImgBB quota
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const key = process.env.IMGBB_API_KEY;
  if (!key) {
    return NextResponse.json({ success: false, message: "Upload is not configured" }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { success: false, message: "Only JPG, PNG, WEBP or GIF images are allowed" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { success: false, message: "Image must be 4 MB or smaller" },
      { status: 400 }
    );
  }

  const body = new FormData();
  body.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
    method: "POST",
    body,
  });
  const result = await res.json().catch(() => null);

  if (!res.ok || !result?.success) {
    return NextResponse.json({ success: false, message: "Image upload failed" }, { status: 502 });
  }
  return NextResponse.json({ success: true, url: result.data.url });
}