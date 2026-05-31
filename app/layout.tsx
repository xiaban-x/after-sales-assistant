import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "售后客服助手",
  description: "AI-powered after-sales customer service assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
