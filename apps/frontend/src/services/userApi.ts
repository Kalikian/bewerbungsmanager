// src/services/userApi.ts
import { http, setToken } from "@lib/http";
import type { LoginUser, UserDB, UserPublic } from "@shared";

// POST /api/user/login -> { token }
export async function login(data: LoginUser): Promise<string> {
  const res = await http<{ message?: string; token: string }>("/user/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setToken(res.token);
  return res.token;
}

// GET /api/user/account -> UserProfile
export async function getAccount(): Promise<UserPublic> {
  return http<UserPublic>("/user/account");
}
