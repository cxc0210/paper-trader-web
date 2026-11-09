import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

export default async function Home() {
  const cookieStore = await cookies();
  if (!cookieStore.has(AUTH_COOKIE_NAME)) {
    redirect("/login");
  }

  redirect("/user");
}
