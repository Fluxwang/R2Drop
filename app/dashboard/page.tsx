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
    return <p>加载中...</p>;
  }

  // 如果未登录，重定向到登录页
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <div className="w-full max-w-xl p-8 bg-white rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            欢迎, {session?.user?.email}
          </h1>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            退出登录
          </button>
        </div>

        {/* --- 文件上传表单 (从组件合并回来) --- */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            上传新文件
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            onDragEnter={handleDrag}
          >
            <div
              className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${
                dragActive
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-10 h-10 mb-3 text-gray-400"
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
                  ></path>
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">点击上传</span> 或拖拽文件到这里
                </p>
                <p className="text-xs text-gray-500">
                  {pendingFiles.length > 0
                    ? `待上传 ${pendingFiles.length} 个文件，当前选择: ${
                        file?.name ?? "未选择"
                      }`
                    : "支持任意文件类型"}
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={isLoading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {pendingFiles.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">
                  待上传文件
                </h3>
                <ul className="space-y-2">
                  {pendingFiles.map((pendingFile, index) => {
                    const fileKey = getFileKey(pendingFile);
                    const fileProgress = uploadProgressMap[fileKey];
                    const showProgress =
                      isLoading && fileProgress !== undefined;

                    return (
                      <li
                        key={`${pendingFile.name}-${pendingFile.lastModified}-${index}`}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800">
                              {pendingFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(pendingFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            disabled={isLoading}
                            className="cursor-pointer rounded-md border border-red-500 px-3 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
                          >
                            取消
                          </button>
                        </div>
                        {showProgress && (
                          <div className="mt-2">
                            <div className="w-full rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-indigo-600 transition-all duration-300 ease-in-out"
                                style={{ width: `${fileProgress}%` }}
                              ></div>
                            </div>
                            <p className="mt-1 text-right text-xs text-gray-500">
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
              className=" cursor-pointer w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-md
                hover:bg-indigo-700
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50
                disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "上传中..." : "上传"}
            </button>
          </form>

          {message && (
            <p
              className={`mt-4 text-sm font-medium ${
                message.includes("失败") ? "text-red-600" : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}

          {/* 查看文件列表按钮 */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              className="cursor-pointer w-full px-4 py-3 font-semibold text-indigo-600 bg-white border-2 border-indigo-600 rounded-lg
                hover:bg-indigo-50
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
              onClick={() => router.push("/files")}
            >
              查看我的文件
            </button>
          </div>
        </div>
        {/* --- 文件上传表单结束 --- */}
      </div>
    </div>
  );
}
