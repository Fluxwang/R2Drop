interface FileTableHeaderProps {
  isAllSelected: boolean;
  isBulkDeleting: boolean;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileTableHeader({
  isAllSelected,
  isBulkDeleting,
  onSelectAll,
}: FileTableHeaderProps) {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th scope="col" className="p-4">
          <input
            type="checkbox"
            className="checkbox checkbox-xs rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            onChange={onSelectAll}
            checked={isAllSelected}
            disabled={isBulkDeleting}
          />
        </th>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
        >
          文件名
        </th>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
        >
          大小
        </th>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
        >
          最后修改
        </th>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
        >
          操作
        </th>
      </tr>
    </thead>
  );
}
