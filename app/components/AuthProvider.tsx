// 这是一个必须的文件，用来包裹你的整个应用
// next-auth 的客户端功能 (比如 signIn) 需要在 SessionProvider 内部才能工作

"use client";

import { SessionProvider } from "next-auth/react";

// 定义一个类型，允许接收 children
type Props = {
  children?: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>;
}
