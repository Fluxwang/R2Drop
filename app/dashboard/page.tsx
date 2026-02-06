// 必须是客户端组件，因为我们需要处理文件选择和点击事件
"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function DashboardPage() {
  const { data: session, status } = useSession(); // 解构 status 和 data， 并命名 data 为 session
  const router = useRouter();

  // setFile 不仅是设置一个值，还会触发组件重新渲染
  // 并且只存储 File 对象或者null，File 是浏览器内置的类型，表示用户选择的文件, file.name file.size file.type 等属性可用
  const [file, setFile] = useState<File | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadProgressMap, setUploadProgressMap] = useState<
    Record<string, number>
  >({});
  const [dragActive, setDragActive] = useState(false);

  const getFileKey = (targetFile: File) =>
    `${targetFile.name}-${targetFile.lastModified}`;

  const updateProgressForFile = (targetFile: File, progress: number) => {
    const fileKey = getFileKey(targetFile);
    setUploadProgressMap((prev) => ({
      ...prev,
      [fileKey]: progress,
    }));
  };

  // 接收名为e参数，类为型 React.ChangeEvent<HTMLInputElement> 的事件处理函数, 就是文件输入框的change事件
  const addPendingFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setPendingFiles((prev) => {
      const incoming = Array.from(files);
      const updated = [...prev, ...incoming];
      setFile(updated[0] ?? null);
      setMessage(""); // 清除旧消息
      return updated;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addPendingFiles(e.target.files);
  };

  // 处理拖拽事件
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // 处理放置事件
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    addPendingFiles(e.dataTransfer.files);
  };

  const handleRemoveFile = (index: number) => {
    setPendingFiles((prev) => {
      const targetFile = prev[index];
      const updated = prev.filter((_, idx) => idx !== index);
      const nextFile = updated[0] ?? null;
      setFile(nextFile);
      if (!nextFile) {
        setMessage("");
      }
      if (targetFile) {
        const fileKey = getFileKey(targetFile);
        setUploadProgressMap((progress) => {
          const next = { ...progress };
          delete next[fileKey];
          return next;
        });
      }
      return updated;
    });
  };

  // 描述 HTML 表单的 onSubmit 事件处理函数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 阻止表单默认提交行为, 如果没有的话浏览器会刷新页面并向服务器发送GET/POST请求，在单页应用中，这会导致页面属性，丢失状态

    if (pendingFiles.length === 0) {
      setMessage("请先选择一个文件。");
      return;
    }

    setIsLoading(true);
    setMessage("正在上传...");
    setUploadProgressMap((prev) => {
      const updated = { ...prev };
      pendingFiles.forEach((pendingFile) => {
        const fileKey = getFileKey(pendingFile);
        updated[fileKey] = 0;
      });
      return updated;
    });

    try {
      for (const pendingFile of pendingFiles) {
        setMessage(`正在上传 ${pendingFile.name}...`);
        // 调用我们自己的 API 来获取预签名 URL
        const presignedUrlResponse = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: pendingFile.name,
            contentType: pendingFile.type,
          }),
        });

        if (!presignedUrlResponse.ok) {
          const error = await presignedUrlResponse.json();
          throw new Error(`获取 URL 失败: ${error.error}`);
        }

        const { url, key } = await presignedUrlResponse.json();

        // 通过预签名URL 直接将文件PUT
        // 使用 axios 替代 fetch 以支持上传进度追踪
        await axios.put(url, pendingFile, {
          headers: {
            "Content-Type": pendingFile.type,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              updateProgressForFile(pendingFile, percentCompleted);
            }
          },
        });

        // 成功！
        updateProgressForFile(pendingFile, 100);
        setMessage(`文件上传成功！Key: ${key}`);
      }
      setMessage("所有文件上传成功！");
      setPendingFiles([]);
      setFile(null);
      setUploadProgressMap({});
    } catch (error: unknown) {
      console.error("上传失败:", error);
      setMessage(
        `上传失败: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoading(false);
    }
  };
  // --- 文件上传逻辑结束 ---

  // 检查登录状态
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] text-slate-600">
        <span className="loading loading-spinner text-slate-400" />
        <span className="ml-2 text-sm">加载中...</span>
      </div>
    );
  }

  // 如果未登录，重定向到登录页
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] px-6 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-8 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Workspace
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                欢迎, {session?.user?.email}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                上传新文件并追踪进度，随时访问你的文件列表。
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/files")}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40"
              >
                查看文件
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/30"
              >
                退出登录
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">上传新文件</h2>
            <p className="mt-1 text-sm text-slate-500">
              支持拖拽或点击上传，批量文件会依次完成。
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
              onDragEnter={handleDrag}
            >
              <div
                className={`relative flex h-64 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white/70 transition-colors duration-300 ${
                  dragActive
                    ? "border-[#d4af37] bg-[#fff7e0]"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center gap-3 px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      点击上传或拖拽文件到这里
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {pendingFiles.length > 0
                        ? `待上传 ${pendingFiles.length} 个文件，当前选择: ${
                            file?.name ?? "未选择"
                          }`
                        : "支持任意文件类型"}
                    </p>
                  </div>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>

              {pendingFiles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">
                    待上传文件
                  </h3>
                  <ul className="space-y-3">
                    {pendingFiles.map((pendingFile, index) => {
                      const fileKey = getFileKey(pendingFile);
                      const fileProgress = uploadProgressMap[fileKey];
                      const showProgress =
                        isLoading && fileProgress !== undefined;

                      return (
                        <li
                          key={`${pendingFile.name}-${pendingFile.lastModified}-${index}`}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-800">
                                {pendingFile.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {(pendingFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(index)}
                              disabled={isLoading}
                              className="cursor-pointer rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                            >
                              取消
                            </button>
                          </div>
                          {showProgress && (
                            <div className="mt-3">
                              <div className="h-2 w-full rounded-full bg-slate-200">
                                <div
                                  className="h-2 rounded-full bg-slate-900 transition-all duration-300 ease-in-out"
                                  style={{ width: `${fileProgress}%` }}
                                />
                              </div>
                              <p className="mt-1 text-right text-xs text-slate-500">
                                {fileProgress ?? 0}%
                              </p>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || pendingFiles.length === 0}
                className="cursor-pointer w-full rounded-xl bg-[#d4af37] px-4 py-3 text-sm font-semibold text-black shadow-md transition-colors duration-200 hover:bg-[#c7a533] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isLoading ? "上传中..." : "上传"}
              </button>
            </form>

            {message && (
              <p
                className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
                  message.includes("失败")
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-green-200 bg-green-50 text-green-600"
                }`}
                role="alert"
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
