import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/presentation/providers/ThemeProvider";
import { LanguageProvider } from "@/presentation/providers/LanguageProvider";

const merriweather = Merriweather({
  variable: "--font-merriweather",
  weight: ["300", "400", "700", "900"],
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Pawdar - Pet Companion",
  description: "The ultimate companion app for your pet's life and health.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${merriweather.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col transition-colors duration-300">
        <LanguageProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
