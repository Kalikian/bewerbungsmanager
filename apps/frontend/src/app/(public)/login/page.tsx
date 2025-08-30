"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { loginUserSchema, type LoginUserInput } from "@validation/user/userSchema";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { applyIssuesToFields, type ApiErrorBody } from "@/lib/api-errors";
import { parseJson } from "@/lib/http";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login as loginService } from "@/services/userApi";

const AFTER_LOGIN_PATH = "/applications"; // Path to redirect to after login

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<LoginUserInput>({
    resolver: zodResolver(loginUserSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: LoginUserInput) => {

    try {
      // Call login service (stores token)
      await loginService({ email: data.email, password: data.password });

      // Success feedback via toast (visible across route change if <Toaster/> is in root layout)
      toast.success("Welcome back!");

      // Clear only the password for convenience
      reset({ password: "", email: data.email });

      // Redirect to the post-login page
      router.replace(AFTER_LOGIN_PATH);
    } catch (e: any) {
      // Try to read a structured error body (zod issues, message, etc.)
      try {
        const body = await parseJson<ApiErrorBody>(e?.body);

        if (body?.issues) {
          // Field-level validation errors go onto the form
          applyIssuesToFields(body.issues, setError, ["email", "password"]);
          // Optional: also surface a toast to explain there are field errors
          toast.error(body?.message ?? "Please fix the highlighted fields.");
        } else {
          toast.error(body?.message ?? e?.message ?? "Login failed");
        }
      } catch {
        // Fallback if error body is not JSON
        toast.error(e?.message ?? "Login failed");
      }
    }
  };

  return (
    <main className="flex min-h-screen justify-center items-start pt-16 md:pt-32 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Sign in to continue.</CardDescription>
        </CardHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-y-4">
            {/* Email */}
            <div className="grid grid-rows-[auto_auto_1.25rem] gap-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                aria-invalid={!!errors.email}
                aria-describedby="email-error"
                className={cn(!!errors.email && "border-red-500 focus-visible:ring-red-500")}
                {...register("email")}
              />
              <p
                id="email-error"
                aria-live="polite"
                className={cn(errors.email ? "text-red-500" : "opacity-0")}
              >
                {errors.email?.message ?? "placeholder"}
              </p>
            </div>

            {/* Password */}
            <div className="grid grid-rows-[auto_auto_1.25rem] gap-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                aria-invalid={!!errors.password}
                aria-describedby="password-error"
                className={cn(!!errors.password && "border-red-500 focus-visible:ring-red-500")}
                {...register("password")}
              />
              <p
                id="password-error"
                aria-live="polite"
                className={cn(errors.password ? "text-red-500" : "opacity-0")}
              >
                {errors.password?.message ?? "placeholder"}
              </p>
            </div>

            <div className="text-right">
              {/* Placeholder if you later implement "Forgot Password?" */}
              <Link
                href="/forgot-password"
                className="text-sm underline opacity-80 hover:opacity-100"
              >
                Forgot password?
              </Link>
            </div>
          </CardContent>

          <CardFooter className="pt-6 flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-sm text-center mt-2 opacity-80">
              Don’t have an account?{" "}
              <Link href="/register" className="underline">
                Create one
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
