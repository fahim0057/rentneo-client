"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Role = "customer" | "owner" | "admin";
interface UserRow {
  _id: string;
  name: string;
  email: string;
  role?: Role;
  createdAt?: string;
}

export default function AllUsersPage() {
  const { data: session } = authClient.useSession();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<{ data: UserRow[] }>("/api/users")
      .then((res) => active && setUsers(res.data))
      .catch((err: Error) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function changeRole(user: UserRow, role: Role) {
    setSavingId(user._id);
    try {
      await apiFetch(`/api/users/${user._id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, role } : u)));
      toast.success(`${user.name} is now ${role}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change role");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">All Users</h1>

      {loading && <p className="py-10 text-center text-muted-foreground">Loading users...</p>}

      {error && !loading && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Could not load users: {error}
        </p>
      )}

      {!loading && !error && users.length === 0 && (
        <p className="rounded-md border border-dashed p-10 text-center">No users found.</p>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isSelf = u._id === session?.user.id;
                return (
                  <TableRow key={u._id}>
                    <TableCell className="font-medium">
                      {u.name} {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <select
                        aria-label={`Role for ${u.name}`}
                        value={u.role ?? "customer"}
                        disabled={isSelf || savingId === u._id}
                        onChange={(e) => changeRole(u, e.target.value as Role)}
                        className="h-8 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50"
                      >
                        <option value="customer">Customer</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}