import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for data fetching with loading and error states.
 *
 * @param {Function} fetchFn - Async function that returns data.
 * @param {Array} deps - Dependency array to trigger re-fetch.
 * @param {Object} options - Configuration options.
 * @param {boolean} options.immediate - Whether to fetch immediately (default: true).
 * @returns {{ data, loading, error, refetch }}
 */
export function useFetch(fetchFn, deps = [], options = {}) {
  const { immediate = true } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: fetchData };
}

export default useFetch;
