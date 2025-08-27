import type { ReactNode } from "react";
import { AuthProvider } from "@/context/authProvider";

export default function DashboardGroupLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

