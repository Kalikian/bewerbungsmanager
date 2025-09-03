"use client";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { FormValues } from "@/lib/applications/types";

export default function ContactFields() {
  const { register, formState: { errors } } = useFormContext<FormValues>();
  return (
    <fieldset className="grid gap-4 sm:grid-cols-3">
      <legend className="text-sm font-medium text-muted-foreground">Contact</legend>

      <div className="grid gap-2 sm:col-span-1">
        <Label htmlFor="contact_name">Name</Label>
        <Input id="contact_name" {...register("contact_name")} aria-invalid={!!errors.contact_name} />
        {errors.contact_name && <p className="text-sm text-red-600">{errors.contact_name.message}</p>}
      </div>

      <div className="grid gap-2 sm:col-span-1">
        <Label htmlFor="contact_email">Email</Label>
        <Input id="contact_email" type="email" {...register("contact_email")} aria-invalid={!!errors.contact_email} />
        {errors.contact_email && <p className="text-sm text-red-600">{errors.contact_email.message}</p>}
      </div>

      <div className="grid gap-2 sm:col-span-1">
        <Label htmlFor="contact_phone">Phone</Label>
        <Input id="contact_phone" {...register("contact_phone")} aria-invalid={!!errors.contact_phone} />
        {errors.contact_phone && <p className="text-sm text-red-600">{errors.contact_phone.message}</p>}
      </div>
    </fieldset>
  );
}
