"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { createUserSchema, type CreateUserInput } from "@validation/user/userSchema";
import { applyIssuesToFields, type ApiErrorBody } from "@/lib/api-errors";
import { parseJson } from "@/lib/http";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError, // needed to map backend field issues
    setFocus, // optional, to focus email field on 409
    reset,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const disabled = isSubmitting || success;

  const onSubmit = async (data: CreateUserInput) => {
    setServerError(null);
    setServerMessage(null);
    setSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // Safe JSON parsing (won't throw on empty body)
      const body = await parseJson<ApiErrorBody>(res);

      if (!res.ok) {
        // 409 - email already exists
        if (res.status === 409) {
          const msg = body?.message ?? "User with this email is already registered";
          setServerError(null); // ensure no global duplicate
          setError("email", { type: "server", message: msg });
          // optional: set focus to email for accessibility
          setFocus("email");
          return;
        }

        // 400 - backend Zod validation issues
        if (res.status === 400) {
          const mapped = applyIssuesToFields(body?.issues, setError, [
            "firstName",
            "lastName",
            "email",
            "password",
          ]);
          if (!mapped) setServerError(body?.message ?? "Registration failed");
          return;
        }

        // Other server errors
        setServerError(body?.message ?? "Registration failed");
        return;
      }

      // Use a global toast for success and navigate immediately.
      // This keeps the UI snappy and the toast persists across navigation.
      toast.success("Account created", {
        description: "You can now sign in.",
        duration: 2000,
      });

      // reset the form and go straight to /login.
      reset({ firstName: "", lastName: "", email: "", password: "" });
      router.push("/login");

    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <main className="flex min-h-screen justify-center items-start pt-16 md:pt-32 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create your account to get started.</CardDescription>
        </CardHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-y-4">
            {/* First & Last Name in two columns on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-8">
              {/* First Name */}
              <div className="grid grid-rows-[auto_auto_1.25rem] gap-y-1">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Max"
                  aria-invalid={!!errors.firstName}
                  aria-describedby="firstName-error"
                  className={cn(!!errors.firstName && "border-red-500 focus-visible:ring-red-500")}
                  {...register("firstName")}
                  disabled={disabled}
                />
                <p
                  id="firstName-error"
                  aria-live="polite"
                  className={cn(errors.firstName ? "text-red-500" : "opacity-0")}
                >
                  {errors.firstName?.message ?? "placeholder"}
                </p>
              </div>

              {/* Last Name */}
              <div className="grid grid-rows-[auto_auto_1.25rem] gap-y-1">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Mustermann"
                  aria-invalid={!!errors.lastName}
                  aria-describedby="lastName-error"
                  className={cn(!!errors.lastName && "border-red-500 focus-visible:ring-red-500")}
                  {...register("lastName")}
                  disabled={disabled}
                />
                <p
                  id="lastName-error"
                  aria-live="polite"
                  className={cn(errors.lastName ? "text-red-500" : "opacity-0")}
                >
                  {errors.lastName?.message ?? "placeholder"}
                </p>
              </div>
            </div>

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
                disabled={disabled}
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
                placeholder="******"
                aria-invalid={!!errors.password}
                aria-describedby="password-error"
                className={cn(!!errors.password && "border-red-500 focus-visible:ring-red-500")}
                {...register("password")}
                disabled={disabled}
              />
              <p
                id="password-error"
                aria-live="polite"
                className={cn(errors.password ? "text-red-500" : "opacity-0")}
              >
                {errors.password?.message ?? "placeholder"}
              </p>
            </div>

            {serverError && (
              <p className="text-sm text-destructive" role="alert">
                {serverError}
              </p>
            )}

            <div className="text-sm opacity-80">
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </div>
          </CardContent>

          <CardFooter className="pt-6 flex flex-col gap-2">
            <p className={cn("text-sm h-5 text-center opacity-0 select-none")}>placeholder</p>

            <Button type="submit" className="w-full" disabled={disabled}>
              {isSubmitting ? "Creating..." : "Create Account"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}