import { NextResponse } from "next/server";
import { ObjectId, type Document, type Filter } from "mongodb";
import { auth } from "@/lib/auth";
import { db } from "@/lib/mongodb";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Updates the signed-in user's login email.
 *
 * Better Auth deliberately blocks email changes through `updateUser`, and its
 * built-in `changeEmail` flow needs an email provider. This deployment has no
 * email verification (by assignment requirement), so we perform the same
 * database update behind a session check instead.
 */
export async function PATCH(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return NextResponse.json(
      { success: false, message: "Enter a valid email address" },
      { status: 400 }
    );
  }

  if (email === session.user.email.toLowerCase()) {
    return NextResponse.json({ success: true, email });
  }

  const users = db.collection("user");
  const existing = await users.findOne({ email }, { projection: { _id: 1 } });
  if (existing && String(existing._id) !== session.user.id) {
    return NextResponse.json(
      { success: false, message: "That email is already in use" },
      { status: 409 }
    );
  }

  const idFilter: Filter<Document> = ObjectId.isValid(session.user.id)
    ? { _id: new ObjectId(session.user.id) }
    : { _id: session.user.id as unknown as ObjectId };

  try {
    const result = await users.updateOne(idFilter, { $set: { email, updatedAt: new Date() } });
    if (!result.matchedCount) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
  } catch {
    // A concurrent signup can still hit the unique email index.
    return NextResponse.json(
      { success: false, message: "That email is already in use" },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true, email });
}
