import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "./client";

export type ResQAuthRole = "user" | "fixer";

export type ResQAuthUser = {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: ResQAuthRole;
};

type ResQProfileRecord = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: string | null;
};

const PROFILE_TABLE = "profiles";

export function normalizeRole(value: unknown): ResQAuthRole {
  return value === "fixer" ? "fixer" : "user";
}

export function getRoleLabel(role: ResQAuthRole) {
  return role === "fixer" ? "Fixer ResQ" : "Khách hàng";
}

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function fetchProfile(userId: string) {
  try {
    const { data, error } = await createClient()
      .from(PROFILE_TABLE)
      .select("id, full_name, phone, email, role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      return null;
    }

    return (data ?? null) as ResQProfileRecord | null;
  } catch {
    return null;
  }
}

export async function buildAuthUser(user: User): Promise<ResQAuthUser> {
  const profile = await fetchProfile(user.id);
  const metadata = user.user_metadata ?? {};
  const email = safeString(user.email) || safeString(profile?.email);
  const name =
    safeString(profile?.full_name) ||
    safeString(metadata.full_name) ||
    safeString(metadata.name) ||
    (email ? email.split("@")[0] : "") ||
    "Người dùng ResQ";
  const phone = safeString(profile?.phone) || safeString(metadata.phone);

  return {
    id: user.id,
    name,
    phone,
    email,
    role: normalizeRole(profile?.role ?? metadata.role),
  };
}

export async function syncProfile(
  user: User,
  input: {
    name: string;
    phone: string;
    email: string;
    role: ResQAuthRole;
  },
) {
  try {
    await createClient().from(PROFILE_TABLE).upsert(
      {
        id: user.id,
        full_name: input.name.trim(),
        phone: input.phone.trim(),
        email: input.email.trim().toLowerCase(),
        role: input.role,
      },
      { onConflict: "id" },
    );
  } catch {
    // Keep auth working even before the optional profiles table is created.
  }
}

export async function getAuthSnapshot(): Promise<{
  session: Session | null;
  user: ResQAuthUser | null;
}> {
  const { data } = await createClient().auth.getSession();
  const session = data.session ?? null;

  return {
    session,
    user: session?.user ? await buildAuthUser(session.user) : null,
  };
}

export function formatAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email hoặc mật khẩu chưa đúng.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Email chưa được xác nhận. Hãy kiểm tra hộp thư rồi đăng nhập lại.";
  }

  if (normalized.includes("user already registered")) {
    return "Email này đã được sử dụng. Bạn hãy đăng nhập hoặc dùng email khác.";
  }

  if (normalized.includes("password should be at least")) {
    return "Mật khẩu phải có ít nhất 6 ký tự.";
  }

  if (normalized.includes("email rate limit exceeded")) {
    return "Bạn thao tác quá nhanh. Hãy đợi một chút rồi thử lại.";
  }

  return message;
}
