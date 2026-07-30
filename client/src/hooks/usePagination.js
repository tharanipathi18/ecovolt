import { useState, useCallback, useMemo } from 'react';
import { APP_CONFIG } from '@utils/constants';

/**
 * Custom hook for client-side pagination.
 *
 * @param {number} totalItems - Total number of items.
 * @param {number} itemsPerPage - Items per page (default from app config).
 * @returns {{ currentPage, totalPages, setPage, nextPage, prevPage, startIndex, endIndex, canGoNext, canGoPrev }}
 */
export function usePagination(totalItems, itemsPerPage = APP_CONFIG.PAGINATION_DEFAULT_LIMIT) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    [totalItems, itemsPerPage],
  );

  const setPage = useCallback(
    (page) => {
      setCurrentPage(Math.min(Math.max(1, page), totalPages));
    },
    [totalPages],
  );

  const nextPage = useCallback(() => setPage(currentPage + 1), [currentPage, setPage]);
  const prevPage = useCallback(() => setPage(currentPage - 1), [currentPage, setPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return {
    currentPage,
    totalPages,
    setPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex,
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1,
  };
}

export default usePagination;
