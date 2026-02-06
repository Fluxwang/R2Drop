// 这是你的根布局文件
// 我们需要在这里使用我们创建的 AuthProvider

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 1. 导入 AuthProvider
import AuthProvider from "./components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My File App", // 你可以在这里改成你的项目名
  description: "Secure file storage application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {/* 2. 用 AuthProvider 包裹你的 children */}
        {/* 这样整个应用都可以访问 session 和 next-auth 的功能 */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
