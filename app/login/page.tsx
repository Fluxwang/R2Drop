// 登录页面也是客户端组件
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react"; // 导入 next-auth 的 signIn 函数
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 调用 next-auth 的 signIn 函数
      // 我们使用 'credentials' 作为 provider (在 ...nextauth/route.ts 中定义的)
      const result = await signIn("credentials", {
        // **关键**: redirect: false 告诉 next-auth 不要自动跳转
        // 这样我们就可以手动处理登录成功或失败的逻辑
        redirect: false,
        email: email,
        password: password,
      });

      if (result?.ok) {
        // 登录成功！
        // 手动跳转到仪表盘或受保护的页面
        router.push("/dashboard");
      } else {
        // 登录失败
        setError("登录失败：无效的电子邮箱或密码。");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("登录请求失败:", error);
      setError("发生网络错误，请稍后重试。");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f5f0] text-slate-900">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#d4af37]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-slate-200/70 blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-center px-6 py-16">
        <div className="grid w-full items-stretch gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center gap-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Secure Storage
              <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              让文件更安全地流转
            </h1>
            <p className="text-base leading-relaxed text-slate-600">
              统一管理上传、下载与共享记录，专注于重要文件的可见性和可追溯性。
            </p>
            <div className="grid gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                快速上传，实时进度追踪
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                统一文件列表与批量管理
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                全程加密与会话保护
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-8 shadow-xl backdrop-blur">
            <h2 className="text-2xl font-semibold text-slate-900">登录到你的账户</h2>
            <p className="mt-2 text-sm text-slate-500">欢迎回来，请输入你的凭据继续。</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-700"
                  htmlFor="email"
                >
                  电子邮箱
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-700"
                  htmlFor="password"
                >
                  密码
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer w-full rounded-xl bg-[#d4af37] px-4 py-3 text-sm font-semibold text-black shadow-md transition-colors duration-200 hover:bg-[#c7a533] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isLoading ? "登录中..." : "登录"}
              </button>
            </form>

            {error && (
              <p
                className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
                role="alert"
              >
                {error}
              </p>
            )}

            <p className="mt-6 text-center text-sm text-slate-600">
              还没有账户？{" "}
              <Link
                href="/register"
                className="font-semibold text-slate-900 underline decoration-[#d4af37] decoration-2 underline-offset-4 hover:text-slate-700"
              >
                点此注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
