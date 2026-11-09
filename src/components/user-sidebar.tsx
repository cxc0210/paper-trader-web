"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  CandlestickChart,
  KeyRound,
  LogOut,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/services/auth";
import { getCurrentUser, type CurrentUser } from "@/services/user";

const navigation = [
  { href: "/user", label: "用户管理", icon: Users },
  { href: "/transaction", label: "交易记录", icon: ArrowLeftRight },
];

export function UserSidebar() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const closeMenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then((currentUser) => {
        if (isMounted) {
          setUser(currentUser);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      if (closeMenuTimerRef.current) {
        clearTimeout(closeMenuTimerRef.current);
      }
    };
  }, []);

  function openUserMenu() {
    if (closeMenuTimerRef.current) {
      clearTimeout(closeMenuTimerRef.current);
    }
    setIsUserMenuOpen(true);
  }

  function closeUserMenu() {
    closeMenuTimerRef.current = setTimeout(() => setIsUserMenuOpen(false), 120);
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
    } catch {
      // HTTP 层会处理未登录状态；网络错误时保留当前页面。
    } finally {
      setIsLoggingOut(false);
    }
  }

  const username = user?.username ?? "加载中";
  const initial = user?.username.slice(0, 1).toUpperCase() ?? "?";

  return (
    <aside className="flex h-svh w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 px-3 py-5 text-slate-300">
      <Link className="mb-9 flex items-center gap-3 px-3 text-white" href="/user">
        <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950/40">
          <CandlestickChart className="size-5" />
        </span>
        <span className="text-base font-semibold tracking-tight">Paper Trader</span>
      </Link>

      <p className="mb-2 px-3 text-xs font-medium tracking-wider text-slate-500">工作台</p>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-950/30"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              }`}
              href={item.href}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-800 pt-4">
        <div onMouseEnter={openUserMenu} onMouseLeave={closeUserMenu}>
          <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
            <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left outline-none transition hover:bg-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500">
              <Avatar size="lg">
                <AvatarFallback className="bg-blue-600 font-medium text-white">{initial}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-100">{username}</span>
                <span className="block truncate text-xs text-slate-500">{user?.email ?? "正在加载账户信息"}</span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              side="top"
              align="start"
              sideOffset={8}
              onMouseEnter={openUserMenu}
              onMouseLeave={closeUserMenu}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <span className="block text-sm text-foreground">{username}</span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">{user?.email}</span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/user/password")}>
                <KeyRound />
                修改密码
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut />
                {isLoggingOut ? "退出中…" : "退出登录"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
