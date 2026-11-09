import { ArrowLeftRight, ReceiptText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionPage() {
  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">交易记录</h1>
          <p className="mt-2 text-sm text-slate-500">查看每一笔模拟交易及其执行状态。</p>
        </div>
        <span className="hidden rounded-lg bg-blue-50 p-3 text-blue-600 sm:block">
          <ArrowLeftRight className="size-5" />
        </span>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>全部交易</CardTitle>
          <CardDescription>交易记录会在下单功能接入后显示。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500 sm:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_1fr]">
              <span>标的</span>
              <span>方向</span>
              <span>数量</span>
              <span className="hidden sm:block">成交价格</span>
              <span className="hidden sm:block">时间</span>
            </div>
            <div className="flex min-h-60 flex-col items-center justify-center px-4 text-center">
              <ReceiptText className="size-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-600">还没有交易记录</p>
              <p className="mt-1 text-xs text-slate-400">开始模拟交易后，交易明细会集中显示在这里。</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
