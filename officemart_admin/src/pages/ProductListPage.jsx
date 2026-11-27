import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import useProductSearch from '../hooks/useProductSearch.js';
import ProductTable from '../components/ProductTable.jsx';
import ProductModal from '../components/ProductModal.jsx';
import api from '../api/axiosClient.js';
import { categoryNames } from '../data/sample.js';

const PAGE_SIZE = 10;

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc params từ URL
  const qParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const statusParam = searchParams.get('status') || '';
  const pageParam = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  // State local cho ô tìm kiếm (hỗ trợ nhập liệu mượt mà)
  const [searchTerm, setSearchTerm] = useState(qParam);

  // Refresh key để kích hoạt fetch lại sau khi thêm, sửa, xoá
  const [refreshKey, setRefreshKey] = useState(0);

  // Quản lý Modal: null = đóng; {} = thêm mới; { id, ... } = sửa
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  // Đồng bộ searchTerm khi URL thay đổi (ví dụ khi nhấn Back/Forward trên trình duyệt)
  useEffect(() => {
    setSearchTerm(qParam);
  }, [qParam]);

  // Debounce ô tìm kiếm 350ms để tránh gửi request liên tục khi đang gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() !== qParam) {
        updateQuery({ q: searchTerm.trim(), page: 1 });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Hàm cập nhật URL Search Params
  const updateQuery = (updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || (key === 'page' && value === 1)) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      return next;
    });
  };

  // Chuẩn bị params cho custom hook
  const searchParamsObj = useMemo(() => ({
    q: qParam,
    category: categoryParam,
    status: statusParam,
    page: pageParam,
    limit: PAGE_SIZE,
  }), [qParam, categoryParam, statusParam, pageParam]);

  // Sử dụng custom hook đã khắc phục race condition
  const { data: products, total, loading, error } = useProductSearch(searchParamsObj, refreshKey);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== pageParam) {
      updateQuery({ page: newPage });
    }
  };

  // Đổi bộ lọc danh mục
  const handleCategoryChange = (e) => {
    updateQuery({ category: e.target.value, page: 1 });
  };

  // Đổi bộ lọc trạng thái
  const handleStatusChange = (e) => {
    updateQuery({ status: e.target.value, page: 1 });
  };

  // Xoá sản phẩm
  const handleDeleteProduct = async (id) => {
    const ok = window.confirm('Bạn có chắc chắn muốn xoá sản phẩm này?');
    if (!ok) return;

    try {
      await api.delete(`/products/${id}`);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err.response?.data?.message || 'Xoá sản phẩm thất bại!');
    }
  };

  // Thêm hoặc sửa thành công từ Modal
  const handleModalSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="product-page">
      <div className="page-header">
        <h2>Sản phẩm</h2>
        <button
          type="button"
          className="btn-add"
          onClick={() => setActiveModalProduct({})}
        >
          Thêm sản phẩm
        </button>
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <div className="filters-bar">
        <div className="filter-item search-box">
          <input
            type="text"
            placeholder="Tìm theo tên, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <select value={categoryParam} onChange={handleCategoryChange}>
            <option value="">Tất cả danh mục</option>
            {Object.entries(categoryNames).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <select value={statusParam} onChange={handleStatusChange}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="inactive">Ngưng bán</option>
          </select>
        </div>
      </div>

      {/* Trạng thái lỗi */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button type="button" onClick={() => setRefreshKey((k) => k + 1)}>
            Thử lại
          </button>
        </div>
      )}

      {/* Trạng thái đang tải */}
      {loading ? (
        <div className="loading-state">
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <ProductTable
          products={products}
          onEdit={(product) => setActiveModalProduct(product)}
          onDelete={handleDeleteProduct}
        />
      )}

      {/* Thanh phân trang */}
      {total > 0 && (
        <div className="pagination-bar">
          <span className="total-info">
            Tổng cộng: <strong>{total}</strong> sản phẩm
          </span>
          <div className="pagination-controls">
            <button
              type="button"
              className="btn-page"
              disabled={pageParam <= 1 || loading}
              onClick={() => handlePageChange(pageParam - 1)}
            >
              ← Trước
            </button>
            <span className="page-indicator">
              Trang {pageParam} / {totalPages}
            </span>
            <button
              type="button"
              className="btn-page"
              disabled={pageParam >= totalPages || loading}
              onClick={() => handlePageChange(pageParam + 1)}
            >
              Sau →
            </button>
          </div>
        </div>
      )}

      {/* Modal Thêm / Sửa */}
      {activeModalProduct && (
        <ProductModal
          initialData={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
