import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { UserSidebar } from "@/components/user-sidebar";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  if (!cookieStore.has(AUTH_COOKIE_NAME)) {
    redirect("/login");
  }

  return (
    <div className="flex h-svh overflow-hidden bg-slate-100">
      <UserSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto p-5 md:p-8">{children}</main>
    </div>
  );
}
