import { http } from "@/lib/http";

type LoginReq = {
  email: string;
  password: string;
};

type LoginRes = {
  tokenExpiresAt: string;
  idleExpiresAt: string;
};

type ChangePasswordRequest = {
  oldPassword: string;
  newPassword: string;
};

export async function login(request: LoginReq) {
  return http.post<LoginRes>("/auth/login", request);
}

export async function logout() {
  await http.post<void>("/auth/logout");
}

export async function changePassword(request: ChangePasswordRequest) {
  await http.post<void>("/user/me/password", request);
}
