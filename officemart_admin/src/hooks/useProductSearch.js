import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

export default function useProductSearch(params, refreshKey = 0) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let isCurrent = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const queryParams = {};
        if (params.q !== undefined && params.q !== null && params.q.trim() !== '') {
          queryParams.q = params.q.trim();
        }
        if (params.category) queryParams.category = params.category;
        if (params.status) queryParams.status = params.status;
        if (params.page) queryParams.page = params.page;
        if (params.limit) queryParams.limit = params.limit;

        const res = await api.get('/products', {
          params: queryParams,
          signal: controller.signal,
        });

        if (isCurrent) {
          setData(res.data.data || []);
          setTotal(res.data.total || 0);
        }
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || !isCurrent) {
          return;
        }
        setError(err.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu');
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [params.q, params.category, params.status, params.page, params.limit, refreshKey]);

  return { data, total, loading, error };
}
