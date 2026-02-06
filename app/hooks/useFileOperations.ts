import { useState } from "react";

export function useFileOperations() {
  // 下载和删除状态管理
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  // 用于批量删除状态管理
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //处理文件下载

  const handleDownload = async (key: string, filename: string) => {
    setDownloadingKey(key); // 标记这个文件正在下载
    setError(null); // 清除之前的错误

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`无法获取下载链接: ${error.message}`);
      }

      const { url } = await response.json();

      // 创建一个隐藏的 <a> 标签来触发下载
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: unknown) {
      console.error("下载失败: ", error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setDownloadingKey(null); // 清除下载状态
    }
  };

  // 使用onSuccess 而不是直接在Hook中使用 setFiles。
  // Hook不需要知道页面文件列表如何存储(数据结构、分页、筛选都不关心)

  // 处理单个文件删除
  const handleDelete = async (key: string, onSuccess: () => void) => {
    setDeletingKey(key);
    setError(null);

    try {
      const response = await fetch("/api/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`删除文件失败: ${error.message}`);
      }

      // 删除成功，调用回调函数更新 UI
      onSuccess();
    } catch (error: unknown) {
      console.error("删除失败: ", error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setDeletingKey(null);
    }
  };

  //  处理批量删除
  const handleBulkDelete = async (
    selectedKeys: string[],
    onSuccess: () => void
  ) => {
    if (selectedKeys.length === 0) {
      setError("请先选择要删除的文件");
      return;
    }

    // 确认对话框
    if (!window.confirm(`你确定要删除 ${selectedKeys.length} 个文件吗`)) {
      return;
    }

    setIsBulkDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/bulkdelete", {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ key: selectedKeys }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "批量删除失败");
      }

      onSuccess();
    } catch (error: unknown) {
      console.error("删除失败: ", error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // 组件可以通过解构来使用这些状态和函数
  return {
    // 状态
    downloadingKey,
    deletingKey,
    isBulkDeleting,
    error,
    // 函数
    handleDownload,
    handleDelete,
    handleBulkDelete,
    setError, // 也暴露 setError，以便组件清除错误
  };
}
