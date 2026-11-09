import { http } from "@/lib/http";

export type CurrentUser = {
  id: number;
  username: string;
  email: string;
  phone: string | null;
};

export type UserPage = {
  users: CurrentUser[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
};

export type CreateUserRequest = {
  username: string;
  password: string;
  email: string;
  phone: string | null;
};

export type UpdateUserRequest = {
  username: string;
  email: string;
  phone: string | null;
};

export function getCurrentUser() {
  return http.post<CurrentUser>("/user/me");
}

export function listUsers(page: number, size: number) {
  return http.post<UserPage>("/user/list", { page, size });
}

export function createUser(request: CreateUserRequest) {
  return http.post<CurrentUser>("/user/create", request);
}

export function updateUser(id: number, request: UpdateUserRequest) {
  return http.post<CurrentUser>(`/user/${id}/update`, request);
}

export function deleteUser(id: number) {
  return http.post<void>(`/user/${id}/delete`);
}
