// root layout
import type { ReactNode } from "react";
import "../styles/globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-grow px-2 sm:px-3 lg:px-4">{children}</main>
          <Toaster richColors />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
