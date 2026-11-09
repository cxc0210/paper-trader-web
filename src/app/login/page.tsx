"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CandlestickChart, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/api-error";
import { login } from "@/services/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    setEmail("");
    setPassword("");
    formRef.current?.reset();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.replace("/user");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-svh bg-slate-950 p-4 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100svh-2rem)] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/30 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden flex-col justify-between bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-950 p-10 text-white lg:flex">
          <div>
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <CandlestickChart className="size-6" />
            </span>
            <p className="mt-12 text-sm font-medium text-blue-100">模拟交易工作台</p>
            <h1 className="mt-3 max-w-sm text-4xl font-semibold tracking-tight">用数据建立你的交易纪律。</h1>
          </div>
          <p className="max-w-sm text-sm leading-6 text-blue-100/85">跟踪持仓、复盘交易，并在不承担真实风险的情况下验证你的策略。</p>
        </section>

        <section className="flex items-center justify-center bg-slate-50 p-6 sm:p-10">
          <Card className="w-full max-w-sm bg-white shadow-xl shadow-slate-200/50">
            <CardHeader className="gap-2">
              <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <LockKeyhole className="size-5" />
              </div>
              <CardTitle className="text-2xl font-semibold text-slate-950">欢迎回来</CardTitle>
              <CardDescription>登录你的 Paper Trader 账户。</CardDescription>
            </CardHeader>
            <CardContent>
              <form ref={formRef} className="space-y-5" autoComplete="off" onSubmit={handleSubmit}>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">邮箱</span>
                  <Input
                    className="h-10"
                    type="email"
                    name="email"
                    autoComplete="off"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">密码</span>
                  <Input
                    className="h-10"
                    type="password"
                    name="password"
                    autoComplete="off"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </label>

                {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

                <Button className="h-10 w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "登录中…" : "登录"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
