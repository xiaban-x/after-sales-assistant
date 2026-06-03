import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "../lib/i18n";

export const metadata: Metadata = {
  title: "After-Sales Assistant · 售后客服助手",
  description: "AI-powered after-sales customer service assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // <html lang> defaults to zh-CN; client-side I18nProvider updates it after mount.
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
