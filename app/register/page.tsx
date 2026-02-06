"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // 确认密码状态
  const [message, setMessage] = useState(""); // 用于显示成功或错误消息
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 表单提交处理函数
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 阻止表单默认提交
    setIsLoading(true);
    setMessage("");

    // 简单的前端验证：检查密码和确认密码是否匹配
    if (confirmPassword !== password) {
      setMessage("密码和确认密码不匹配。");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 将confirmPassword 一并发送到后端
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("注册成功！正在跳转到登录页面...");
        // 注册成功后，等待2秒跳转到登录页
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        // 显示来自 API 的错误消息
        setMessage(data.message || "注册失败，请重试。");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("注册请求失败:", error);
      setMessage("发生网络错误，请稍后重试。");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f5f0] text-slate-900">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-slate-200/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-[#d4af37]/20 blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-center px-6 py-16">
        <div className="grid w-full items-stretch gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-8 shadow-lg backdrop-blur">
            <h2 className="text-2xl font-semibold text-slate-900">创建新账户</h2>
            <p className="mt-2 text-sm text-slate-500">
              只需一步即可开始上传和管理你的重要文件。
            </p>

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
                  minLength={8}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40"
                  placeholder="至少 8 位字符"
                />
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-700"
                  htmlFor="confirmPassword"
                >
                  确认密码
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40"
                  placeholder="再次输入密码"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer w-full rounded-xl bg-[#d4af37] px-4 py-3 text-sm font-semibold text-black shadow-md transition-colors duration-200 hover:bg-[#c7a533] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isLoading ? "注册中..." : "注册"}
              </button>
            </form>

            {message && (
              <p
                className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
                  message.includes("成功")
                    ? "border-green-200 bg-green-50 text-green-600"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}
                role="alert"
              >
                {message}
              </p>
            )}

            <p className="mt-6 text-center text-sm text-slate-600">
              已经有账户了？{" "}
              <Link
                href="/login"
                className="font-semibold text-slate-900 underline decoration-[#d4af37] decoration-2 underline-offset-4 hover:text-slate-700"
              >
                点此登录
              </Link>
            </p>
            <p className="mt-2 text-center text-xs text-slate-400">
              <Link
                href="mailto:pseudowang@outlook.com"
                className="font-semibold text-slate-600 hover:text-slate-900"
              >
                忘记密码
              </Link>
            </p>
          </div>

          <div className="flex flex-col justify-center gap-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              File Workspace
              <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              让团队文件井然有序
            </h1>
            <p className="text-base leading-relaxed text-slate-600">
              一个账号即可管理上传记录、批量操作和访问权限。
            </p>
            <div className="grid gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                清晰的文件列表与筛选体验
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                大文件上传进度可追踪
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                安全会话与权限控制
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
