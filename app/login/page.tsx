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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          登录到你的账户
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="you@example.com"
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? "登录中..." : "登录"}
          </button>
        </form>

        {/* 显示错误消息 */}
        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          还没有账户？{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            点此注册
          </Link>
        </p>
      </div>
    </div>
  );
}
