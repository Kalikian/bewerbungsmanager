import type { ReactNode } from 'react';
import '../styles/globals.css';
import { ThemeProvider } from "@/components/ui/theme-provider";
import Header from "@/components/layout/header";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body  className="bg-background text-foreground">
        <ThemeProvider
        attribute="class" 
        defaultTheme="system" 
        enableSystem 
        disableTransitionOnChange
        >
          <Header/>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}

