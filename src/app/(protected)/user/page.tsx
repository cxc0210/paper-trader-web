"use client";

import { Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getErrorMessage } from "@/lib/api-error";
import { createUser, deleteUser, listUsers, updateUser, type CurrentUser, type UserPage, type UserRole } from "@/services/user";

const PAGE_SIZE = 10;

const EMPTY_CREATE_FORM: { username: string; email: string; phone: string; password: string; role: UserRole } = {
  username: "",
  email: "",
  phone: "",
  password: "",
  role: "USER",
};
const EMPTY_EDIT_FORM: { username: string; email: string; phone: string; role: UserRole } = {
  username: "",
  email: "",
  phone: "",
  role: "USER",
};
const ROLE_LABELS: Record<UserRole, string> = { ADMIN: "管理员", USER: "普通用户" };

function getPaginationItems(currentPage: number, totalPages: number) {
  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const validPages = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((firstPage, secondPage) => firstPage - secondPage);

  return validPages.flatMap((page, index) => {
    const previousPage = validPages[index - 1];
    return previousPage && page - previousPage > 1 ? ["ellipsis", page] : [page];
  });
}

export default function UserPage() {
  const [page, setPage] = useState(1);
  const [userPage, setUserPage] = useState<UserPage | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<CurrentUser | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [editError, setEditError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [userPendingDeletion, setUserPendingDeletion] = useState<CurrentUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  useEffect(() => {
    let isCurrentRequest = true;
    setIsLoading(true);
    setError("");

    listUsers(page, PAGE_SIZE)
      .then((response) => {
        if (isCurrentRequest) {
          setUserPage(response);
        }
      })
      .catch((error) => {
        if (isCurrentRequest) {
          setError(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [page, refreshKey]);

  const totalPages = Math.max(userPage?.totalPages ?? 0, 1);
  const users = userPage?.users ?? [];
  const paginationItems = useMemo(() => getPaginationItems(page, totalPages), [page, totalPages]);
  const firstVisibleUser = userPage?.total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastVisibleUser = userPage?.total ? Math.min(page * PAGE_SIZE, userPage.total) : 0;

  function changePage(nextPage: number) {
    if (isLoading || nextPage < 1 || nextPage > totalPages || nextPage === page) {
      return;
    }

    setPage(nextPage);
  }

  function handleCreateDialogOpenChange(open: boolean) {
    setIsCreateDialogOpen(open);
    if (!open && !isCreating) {
      setCreateForm(EMPTY_CREATE_FORM);
      setCreateError("");
    }
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError("");
    setIsCreating(true);

    try {
      await createUser({
        ...createForm,
        username: createForm.username.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim() || null,
      });
      setCreateForm(EMPTY_CREATE_FORM);
      setIsCreateDialogOpen(false);
      setPage(1);
      setRefreshKey((currentKey) => currentKey + 1);
    } catch (error) {
      setCreateError(getErrorMessage(error));
    } finally {
      setIsCreating(false);
    }
  }

  function openEditDialog(user: CurrentUser) {
    setEditingUser(user);
    setEditForm({ username: user.username, email: user.email, phone: user.phone ?? "", role: user.role });
    setEditError("");
  }

  function handleEditDialogOpenChange(open: boolean) {
    if (!open && !isUpdating) {
      setEditingUser(null);
      setEditForm(EMPTY_EDIT_FORM);
      setEditError("");
    }
  }

  async function handleUpdateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingUser) {
      return;
    }

    setEditError("");
    setIsUpdating(true);

    try {
      await updateUser(editingUser.id, {
        username: editForm.username.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || null,
        role: editForm.role,
      });
      setEditingUser(null);
      setEditForm(EMPTY_EDIT_FORM);
      setRefreshKey((currentKey) => currentKey + 1);
    } catch (error) {
      setEditError(getErrorMessage(error));
    } finally {
      setIsUpdating(false);
    }
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    if (!open && deletingUserId === null) {
      setUserPendingDeletion(null);
    }
  }

  async function handleDeleteUser() {
    if (!userPendingDeletion) {
      return;
    }

    setDeletingUserId(userPendingDeletion.id);

    try {
      await deleteUser(userPendingDeletion.id);
      setUserPendingDeletion(null);
      if (users.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        setRefreshKey((currentKey) => currentKey + 1);
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setDeletingUserId(null);
    }
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">用户管理</h1>
          <p className="mt-2 text-sm text-slate-500">查看系统中的全部用户账户。</p>
        </div>
        <Button type="button" className="h-10" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus />
          添加用户
        </Button>
      </header>

      <div>
        {error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-slate-50/80">
                  <TableHead className="w-24 px-5 text-xs text-slate-500">用户 ID</TableHead>
                  <TableHead className="px-5 text-xs text-slate-500">用户</TableHead>
                  <TableHead className="px-5 text-xs text-slate-500">邮箱</TableHead>
                  <TableHead className="px-5 text-xs text-slate-500">手机号</TableHead>
                  <TableHead className="px-5 text-xs text-slate-500">角色</TableHead>
                  <TableHead className="w-28 px-5 text-right text-xs text-slate-500">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-80 text-center text-slate-500">
                      正在加载用户列表…
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-80 text-center text-slate-500">
                      暂无用户数据
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="border-slate-100 hover:bg-indigo-50/30">
                      <TableCell className="px-5 font-mono text-xs text-slate-400">#{user.id}</TableCell>
                      <TableCell className="px-5 font-medium text-slate-800">{user.username}</TableCell>
                      <TableCell className="px-5 text-slate-600">{user.email}</TableCell>
                      <TableCell className="px-5 text-slate-500">{user.phone || "--"}</TableCell>
                      <TableCell className="px-5">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${user.role === "ADMIN" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
                          {ROLE_LABELS[user.role]}
                        </span>
                      </TableCell>
                      <TableCell className="px-5">
                        <div className="flex justify-end gap-1">
                          <Button type="button" variant="ghost" size="icon-sm" aria-label={`编辑 ${user.username}`} title="编辑用户" onClick={() => openEditDialog(user)}>
                            <Pencil />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`删除 ${user.username}`}
                            title="删除用户"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            disabled={deletingUserId !== null}
                            onClick={() => setUserPendingDeletion(user)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {!error && (
          <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {userPage?.total ? `显示第 ${firstVisibleUser}–${lastVisibleUser} 位，共 ${userPage.total} 位用户` : "暂无用户数据"}
            </p>
            <Pagination className="mx-0 w-auto justify-start sm:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    text="上一页"
                    aria-disabled={isLoading || page === 1}
                    className={isLoading || page === 1 ? "pointer-events-none opacity-50" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      changePage(page - 1);
                    }}
                  />
                </PaginationItem>
                {paginationItems.map((item, index) =>
                  item === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href="#"
                        isActive={item === page}
                        onClick={(event) => {
                          event.preventDefault();
                          changePage(item);
                        }}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    text="下一页"
                    aria-disabled={isLoading || page >= totalPages}
                    className={isLoading || page >= totalPages ? "pointer-events-none opacity-50" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      changePage(page + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogOpenChange}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg" showCloseButton={!isCreating}>
          <DialogHeader className="border-b border-slate-100 bg-gradient-to-br from-indigo-50 via-white to-white px-6 py-5 pr-14">
            <span className="mb-1 flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
              <UserPlus className="size-5" />
            </span>
            <DialogTitle className="text-lg font-semibold text-slate-950">添加用户</DialogTitle>
            <DialogDescription className="leading-6">创建后，用户可使用填写的邮箱和初始密码登录。</DialogDescription>
          </DialogHeader>
          <form className="px-6 py-5" onSubmit={handleCreateUser}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">用户名</span>
                <Input
                  className="h-10 bg-white"
                  name="username"
                  placeholder="例如：andre"
                  value={createForm.username}
                  onChange={(event) => setCreateForm((form) => ({ ...form, username: event.target.value }))}
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">手机号 <span className="font-normal text-slate-400">可选</span></span>
                <Input
                  className="h-10 bg-white"
                  type="tel"
                  name="phone"
                  placeholder="例如：13800000000"
                  value={createForm.phone}
                  onChange={(event) => setCreateForm((form) => ({ ...form, phone: event.target.value }))}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">邮箱</span>
                <Input
                  className="h-10 bg-white"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={createForm.email}
                  onChange={(event) => setCreateForm((form) => ({ ...form, email: event.target.value }))}
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">初始密码</span>
                <Input
                  className="h-10 bg-white"
                  type="password"
                  name="password"
                  placeholder="设置初始登录密码"
                  value={createForm.password}
                  onChange={(event) => setCreateForm((form) => ({ ...form, password: event.target.value }))}
                  required
                />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">角色</span>
                <Select value={createForm.role} onValueChange={(role) => setCreateForm((form) => ({ ...form, role: role as UserRole }))}>
                  <SelectTrigger className="h-10 w-full bg-white">
                    <span>{ROLE_LABELS[createForm.role]}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">普通用户</SelectItem>
                    <SelectItem value="ADMIN">管理员</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>

            {createError && <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{createError}</p>}

            <DialogFooter className="-mx-6 -mb-5 mt-6 border-slate-100 bg-slate-50 px-6 py-4">
              <Button type="button" variant="outline" disabled={isCreating} onClick={() => handleCreateDialogOpenChange(false)}>
                取消
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "创建中…" : "创建用户"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editingUser !== null} onOpenChange={handleEditDialogOpenChange}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg" showCloseButton={!isUpdating}>
          <DialogHeader className="border-b border-slate-100 bg-gradient-to-br from-indigo-50 via-white to-white px-6 py-5 pr-14">
            <span className="mb-1 flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
              <Pencil className="size-5" />
            </span>
            <DialogTitle className="text-lg font-semibold text-slate-950">编辑用户</DialogTitle>
            <DialogDescription className="leading-6">可更新用户名、邮箱和手机号。密码需要在修改密码页面单独变更。</DialogDescription>
          </DialogHeader>
          <form className="px-6 py-5" onSubmit={handleUpdateUser}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">用户名</span>
                <Input
                  className="h-10 bg-white"
                  name="username"
                  value={editForm.username}
                  onChange={(event) => setEditForm((form) => ({ ...form, username: event.target.value }))}
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">手机号 <span className="font-normal text-slate-400">可选</span></span>
                <Input
                  className="h-10 bg-white"
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={(event) => setEditForm((form) => ({ ...form, phone: event.target.value }))}
                />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">邮箱</span>
                <Input
                  className="h-10 bg-white"
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={(event) => setEditForm((form) => ({ ...form, email: event.target.value }))}
                  required
                />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">角色</span>
                <Select value={editForm.role} onValueChange={(role) => setEditForm((form) => ({ ...form, role: role as UserRole }))}>
                  <SelectTrigger className="h-10 w-full bg-white">
                    <span>{ROLE_LABELS[editForm.role]}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">普通用户</SelectItem>
                    <SelectItem value="ADMIN">管理员</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>

            {editError && <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{editError}</p>}

            <DialogFooter className="-mx-6 -mb-5 mt-6 border-slate-100 bg-slate-50 px-6 py-4">
              <Button type="button" variant="outline" disabled={isUpdating} onClick={() => handleEditDialogOpenChange(false)}>
                取消
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "保存中…" : "保存修改"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={userPendingDeletion !== null} onOpenChange={handleDeleteDialogOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-red-50 text-red-600">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>确认删除用户？</AlertDialogTitle>
            <AlertDialogDescription>
              用户 <span className="font-medium text-slate-700">{userPendingDeletion?.username}</span> 将被直接删除，此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingUserId !== null}>取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={deletingUserId !== null} onClick={handleDeleteUser}>
              {deletingUserId !== null ? "删除中…" : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
