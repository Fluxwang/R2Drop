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
    <thead className="bg-slate-50">
      <tr>
        <th scope="col" className="p-4">
          <input
            type="checkbox"
            className="checkbox checkbox-xs rounded border-slate-300 text-slate-900 focus:ring-[#d4af37]"
            onChange={onSelectAll}
            checked={isAllSelected}
            disabled={isBulkDeleting}
          />
        </th>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
        >
          文件名
        </th>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
        >
          大小
        </th>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
        >
          最后修改
        </th>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
        >
          操作
        </th>
      </tr>
    </thead>
  );
}
