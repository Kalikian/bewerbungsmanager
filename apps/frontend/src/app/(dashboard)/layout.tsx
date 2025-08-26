import type { ReactNode } from "react";
import { AuthProvider } from "../../context/authProvider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
