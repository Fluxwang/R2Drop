"use client";

// 声明这是一个客户端组件，因为我们需要使用 useState 和处理表单事件
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          创建新账户
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
              minLength={8}
              // minLength 属性确保前端至少输入8个字符
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="请输入密码"
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="请确认密码"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? "注册中..." : "注册"}
          </button>
        </form>

        {/* 显示消息 */}
        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.includes("成功") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          已经有账户了？{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            点此登录
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-gray-400">
          <Link
            href="mailto:pseudowang@outlook.com"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            忘记密码
          </Link>
        </p>
      </div>
    </div>
  );
}
