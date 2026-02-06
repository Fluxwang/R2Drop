"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FileItem } from "@/app/types/file";
import { useFileOperations } from "@/app/hooks/useFileOperations";
import { FileTableRow } from "./components/FileTableRow";
import { FileTableHeader } from "./components/FileTableHeader";
import Link from "next/link";

export default function FilesPage() {
  const { status } = useSession();
  const router = useRouter();

  // 状态管理
  const [files, setFiles] = useState<FileItem[]>([]); // 存储文件列表，初始值为空数组
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 文件操作 Hook（下载/删除/批量删除 与其状态）
  const {
    downloadingKey,
    deletingKey,
    isBulkDeleting,
    error: opError, // Hook 的内部错误
    handleDownload,
    handleDelete,
    handleBulkDelete,
  } = useFileOperations();

  // 用于存储选中的Key 数组
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // 合并页面获取错误与操作错误，统一展示
  const mergedError = error || opError;

  // 获取文件列表
  useEffect(() => {
    // useEffect 在组件加载时获取文件列表，当status 和 router 变化时，重新执行
    if (status === "authenticated") {
      // 获取文件列表
      const fetchFiles = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch("/api/files");
          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "获取文件列表失败");
          }
          const data = await response.json();
          setFiles(data.files);
        } catch (error: unknown) {
          console.error("获取文件列表失败: ", error);
          setError(error instanceof Error ? error.message : String(error));
        } finally {
          setIsLoading(false); // 无论成功失败，都需要结束加载状态
        }
      };
      // 执行获取文件列表函数
      fetchFiles();
    }
  }, [status, router]);
  // 结束useEffect()

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <a className="text-lg text-gray-500 ">加载中 </a>
        <span className="loading loading-spinner text-neutral"></span>
      </div>
    );
  }

  // 错误状态
  if (mergedError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">错误: {mergedError}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }
  // 处理下载/删除逻辑改由 useFileOperations 提供

  // 处理单行选中
  const handleSelectRow = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    if (e.target.checked) {
      setSelectedKeys((prev) => [...prev, key]);
    } else {
      setSelectedKeys((prev) => prev.filter((k) => k !== key));
    }
  };

  // 处理全选
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedKeys(files.map((file) => file.key));
    } else {
      setSelectedKeys([]);
    }
  };

  // 批量删除逻辑改由 useFileOperations 提供

  // 辅助变量: 用于 "全选" 复选框
  const isAllSelected =
    files.length > 0 && selectedKeys.length === files.length;
  // --- 主界面渲染开始 ---
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-8">
      <div className="w-full max-w-4xl p-8 bg-white rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800"> 我的文件</h1>
          <div className="flex space-x-2">
            {selectedKeys.length > 0 && (
              <button
                onClick={() =>
                  handleBulkDelete(selectedKeys, () => {
                    setFiles((prev) =>
                      // prev = 当前的文件列表(删除之前的完整列表)
                      prev.filter(
                        (file) =>
                          // 遍历每个文件，检查它是否在 selectedKeys 里
                          !selectedKeys.includes(file.key)
                        // 在的话就过滤掉，不在的话就保留
                      )
                    );
                    setSelectedKeys([]);
                  })
                }
                disabled={isBulkDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400"
              >
                {isBulkDeleting
                  ? "删除中..."
                  : `删除选中(${selectedKeys.length})`}
              </button>
            )}
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus: outline-none focus:ring-2 focus:ring-indigo-500"
            >
              返回上传
            </Link>
          </div>
        </div>

        {/* 根据不同状态显示内容 */}
        {isLoading && <p>正在加载文件列表</p>}
        {mergedError && <p className="text-red-600">错误: {mergedError}</p>}

        {!isLoading && !error && (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <FileTableHeader
                isAllSelected={isAllSelected}
                isBulkDeleting={isBulkDeleting}
                onSelectAll={handleSelectAll}
              />
              <tbody className="bg-white divide-y divide-gray-200">
                {files.length > 0 ? (
                  files.map((file) => (
                    <FileTableRow
                      key={file.key}
                      file={file} //显示哪个文件的信息
                      isSelected={selectedKeys.includes(file.key)} //这行是否被选中
                      isDownloading={downloadingKey === file.key} // 是否正在下载中(显示 "下载中")
                      isDeleting={deletingKey === file.key} //是否正在删除 (显示 "删除中")
                      isBulkDeleting={isBulkDeleting}
                      onSelectRow={handleSelectRow} //复选框变化时要做什么
                      onDownload={handleDownload} // 点击下载按钮时执行的函数
                      onDelete={(key) =>
                        handleDelete(key, () =>
                          setFiles((prev) => prev.filter((f) => f.key !== key))
                        )
                      }
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      你还没有上传任何文件
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
  // --- 主界面渲染结束 ---
}
