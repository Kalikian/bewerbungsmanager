'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from '@/lib/utils';

import {  createUserSchema, type CreateUserInput } from "@validation/user/userSchema";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<CreateUserInput>({
  resolver: zodResolver(createUserSchema),
  mode: 'onBlur', 
  reValidateMode: 'onChange',
});

  const onSubmit = (data: CreateUserInput) => {
    console.log("Form data:", data);
    // Handle registration logic here
  };
  return (
    <main className="flex min-h-screen justify-center items-start pt-16 md:pt-32 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create your account to get started.</CardDescription>
        </CardHeader>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-y-4"> {/* mehr Abstand zwischen Feldern */}
  {/* First + Last Name nebeneinander */}
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
    />
    <p id="email-error" aria-live="polite" className={cn(errors.email ? "text-red-500" : "opacity-0")}>
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
    />
    <p id="password-error" aria-live="polite" className={cn(errors.password ? "text-red-500" : "opacity-0")}>
      {errors.password?.message ?? "placeholder"}
    </p>
  </div>
</CardContent>
          <CardFooter className="pt-6">
            <Button type="submit" className="w-full" >Create Account</Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
