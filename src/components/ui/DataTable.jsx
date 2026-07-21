'use client';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function DataTable({ columns, data, isLoading, columnVisibility, onColumnVisibilityChange, onRowClick, emptyMessage = 'No records found.' }) {
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, ...(columnVisibility ? { columnVisibility } : {}) },
    onSortingChange: setSorting,
    ...(onColumnVisibilityChange ? { onColumnVisibilityChange } : {}),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.1 } };

  const tableContent = (
    <table className="w-full" style={{ fontSize: 'var(--text-base)' }}>
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id} style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            {hg.headers.map((header) => (
              <th
                key={header.id}
                className="px-3 py-3 text-left font-semibold uppercase"
                style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-table-head)' }}
                onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
              >
                <div className={`flex items-center gap-1 ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === 'asc' && <ChevronUp className="h-3 w-3" />}
                  {header.column.getIsSorted() === 'desc' && <ChevronDown className="h-3 w-3" />}
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.length === 0 ? (
          <tr>
            <td colSpan={table.getVisibleLeafColumns().length} className="px-4 py-12 text-center" style={{ color: 'var(--text-tertiary)' }}>
              {emptyMessage}
            </td>
          </tr>
        ) : (
          table.getRowModel().rows.map((row, i) => (
            <motion.tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              className="transition-colors hover:bg-(--bg-hover)"
              style={{ borderTop: '1px solid var(--border-primary)', cursor: onRowClick ? 'pointer' : undefined }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.12, delay: Math.min(i * 0.02, 0.16) }}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-3" style={{ color: 'var(--text-secondary)' }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </motion.tr>
          ))
        )}
      </tbody>
    </table>
  );

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div key="skeleton" {...fade} className="space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
          ))}
        </motion.div>
      ) : (
        <motion.div key="table" {...fade} className="overflow-x-auto">
          {tableContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
