'use client';
import { useState } from 'react';

export default function usePagination(total, defaultPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  const goToPage = (p) => setPage(Math.min(Math.max(1, p), totalPages));
  const changePageSize = (s) => { setPageSize(s); setPage(1); };

  return { page, pageSize, totalPages, from, to, goToPage, changePageSize };
}
