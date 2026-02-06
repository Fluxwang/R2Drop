import { FileItem } from "@/app/types/file";
import { formatBytes } from "@/lib/formatBytes";

/**
 * 文件表格的单行组件
 *
 * 这个组件只负责显示一行文件的信息和操作按钮
 * 不关心整个页面的状态，只接收需要的数据和函数
 */

// 定义这个组件需要接收的 props（属性）
interface FileTableRowProps {
  file: FileItem; // 文件对象
  isSelected: boolean; // 是否被选中
  isDownloading: boolean; // 是否正在下载
  isDeleting: boolean; // 是否正在删除
  isBulkDeleting: boolean; // 是否正在批量删除
  onSelectRow: (e: React.ChangeEvent<HTMLInputElement>, key: string) => void; // 选中复选框的回调
  onDownload: (key: string, filename: string) => void; // 下载按钮的回调
  onDelete: (key: string) => void; // 删除按钮的回调
}

export function FileTableRow({
  file,
  isSelected,
  isDownloading,
  isDeleting,
  isBulkDeleting,
  onSelectRow,
  onDownload,
  onDelete,
}: FileTableRowProps) {
  return (
    <tr className={isSelected ? "bg-indigo-50" : ""}>
      {/* 复选框列 */}
      <td className="p-4">
        <input
          type="checkbox"
          className="checkbox checkbox-xs rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          onChange={(e) => onSelectRow(e, file.key)}
          checked={isSelected}
          disabled={isBulkDeleting}
        />
      </td>

      {/* 文件名列 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {file.filename}
      </td>

      {/* 文件大小列 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatBytes(file.size)}
      </td>

      {/* 最后修改时间列 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(file.lastModified).toLocaleString()}
      </td>

      {/* 操作按钮列 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center gap-4">
          {/* 下载按钮 */}
          <button
            onClick={() => onDownload(file.key, file.filename)}
            disabled={isDownloading || isDeleting}
            className="cursor-pointer text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-wait"
          >
            {isDownloading ? "下载中..." : "下载"}
          </button>

          {/* 删除按钮 */}
          <button
            onClick={() => onDelete(file.key)}
            disabled={isDeleting || isDownloading}
            className="cursor-pointer text-red-500 hover:text-red-900 disabled:text-gray-400 disabled:cursor-wait"
          >
            {isDeleting ? "删除中..." : "删除"}
          </button>
        </div>
      </td>
    </tr>
  );
}
