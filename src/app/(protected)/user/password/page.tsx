"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/api-error";
import { changePassword, logout } from "@/services/auth";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    formRef.current?.reset();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("两次输入的新密码不一致");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({ oldPassword: currentPassword, newPassword });
      await logout();
      router.replace("/login");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="flex min-h-[calc(100svh-4rem)] items-center justify-center">
      <Card className="w-full max-w-md bg-white shadow-xl shadow-slate-200/50">
        <CardHeader className="gap-2">
          <span className="mb-2 flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <KeyRound className="size-5" />
          </span>
          <CardTitle className="text-2xl font-semibold text-slate-950">修改密码</CardTitle>
          <CardDescription>修改成功后将退出登录，请使用新密码重新登录。</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} className="space-y-5" autoComplete="off" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">当前密码</span>
              <Input
                className="h-10"
                type="password"
                autoComplete="off"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">新密码</span>
              <Input
                className="h-10"
                type="password"
                autoComplete="off"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">确认新密码</span>
              <Input
                className="h-10"
                type="password"
                autoComplete="off"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </label>

            {error && <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <Button className="h-10 w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "修改中…" : "修改密码"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
