import { categoryNames } from '../data/sample.js';

export default function ProductTable({ products = [], onEdit, onDelete }) {
  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <p>Không có sản phẩm nào phù hợp.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="product-table">
        <thead>
          <tr>
            <th>Tên</th>
            <th>SKU</th>
            <th>Danh mục</th>
            <th>Giá</th>
            <th>Tồn kho</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} data-testid="product-row">
              <td data-label="Tên" className="cell-name">{product.name}</td>
              <td data-label="SKU" className="cell-sku">{product.sku}</td>
              <td data-label="Danh mục" className="cell-category">
                {categoryNames[product.category] || product.category}
              </td>
              <td data-label="Giá" className="cell-price">
                {Number(product.price).toLocaleString('vi-VN')} đ
              </td>
              <td data-label="Tồn kho" className="cell-stock">
                {product.stock === 0 ? (
                  <span className="out-of-stock">Hết hàng</span>
                ) : (
                  product.stock
                )}
              </td>
              <td data-label="Trạng thái" className="cell-status">
                <span
                  data-testid="product-status"
                  className={product.status === 'active' ? 'status-active' : 'status-inactive'}
                >
                  {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                </span>
              </td>
              <td data-label="Thao tác" className="cell-actions">
                <div className="action-buttons">
                  <button
                    type="button"
                    className="btn-edit"
                    onClick={() => onEdit && onEdit(product)}
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => onDelete && onDelete(product.id)}
                  >
                    Xoá
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
