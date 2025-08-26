// src/services/userApi.ts
import { http, setToken } from "../lib/http";
import { LoginUser, UserDB } from "@shared"; // <— Pfad anpassen!

// Profil, wie es das Frontend nutzen soll (ohne Passwort)
export type UserProfile = Omit<UserDB, "password">;

// POST /login  -> { message, token }
export async function login(data: LoginUser): Promise<string> {
  const res = await http<{ message?: string; token: string }>("/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setToken(res.token); // Token aus Backend sichern
  return res.token;
}

// GET /account -> UserProfile (vom Backend geliefert)
export async function getAccount(): Promise<UserProfile> {
  return http<UserProfile>("/account");
}
