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
          <CardContent className="grid gap-6">
            {/* First + Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
          id="firstName"
          placeholder="Max"
          aria-invalid={!!errors.firstName}
          aria-describedby="firstName-error"
          className={cn(!!errors.firstName && "border-red-500 focus-visible:ring-red-500")}
          {...register("firstName")}
        />
        {errors.firstName && (
          <p id="firstName-error" className="text-sm text-red-500">
            {errors.firstName.message}
          </p>
        )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          placeholder="Mustermann"
          aria-invalid={!!errors.lastName}
          aria-describedby="lastName-error"
          className={cn(!!errors.lastName && "border-red-500 focus-visible:ring-red-500")}
          {...register("lastName")}
        />
        {errors.lastName && (
          <p id="lastName-error" className="text-sm text-red-500">
            {errors.lastName.message}
          </p>
        )}
              </div>
            </div>

            {/* Email */}
            <div className="grid gap-2">
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
      {errors.email && (
        <p id="email-error" className="text-sm text-red-500">
          {errors.email.message}
        </p>
      )}
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="email">Password</Label>
      <Input
        id="password"
        type="password"
        placeholder="******"
        aria-invalid={!!errors.password}
        aria-describedby="password-error"
        className={cn(!!errors.password && "border-red-500 focus-visible:ring-red-500")}
        {...register("password")}
      />
      {errors.password && (
        <p id="password-error" className="text-sm text-red-500">
          {errors.password.message}
        </p>
      )}
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
