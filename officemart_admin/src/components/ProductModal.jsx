import { useState } from 'react';
import api from '../api/axiosClient.js';
import { categoryNames } from '../data/sample.js';

export default function ProductModal({ onClose, onSuccess, initialData = null }) {
  const isEdit = Boolean(initialData && initialData.id);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    sku: initialData?.sku || '',
    category: initialData?.category || 'keyboard',
    price: initialData?.price ?? '',
    stock: initialData?.stock ?? '',
    status: initialData?.status || 'active',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const payload = {
      ...formData,
      price: formData.price === '' ? '' : Number(formData.price),
      stock: formData.stock === '' ? '' : Number(formData.stock),
    };

    try {
      let res;
      if (isEdit) {
        res = await api.put(`/products/${initialData.id}`, payload);
      } else {
        res = await api.post('/products', payload);
      }

      onSuccess(res.data);
      onClose();
    } catch (err) {
      if (err.response?.data) {
        const { field, message } = err.response.data;
        if (field) {
          setErrors({ [field]: message });
        } else {
          alert(message || 'Có lỗi xảy ra!');
        }
      } else {
        alert('Không thể kết nối đến máy chủ API!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
          <button type="button" className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên sản phẩm</label>
            <input
              type="text"
              name="name"
              placeholder="Nhập tên sản phẩm (3 - 100 ký tự)"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Mã SKU</label>
            <input
              type="text"
              name="sku"
              placeholder="VD: ABC-1234 (chữ in hoa và số)"
              value={formData.sku}
              onChange={handleChange}
            />
            {errors.sku && <span className="error-text">{errors.sku}</span>}
          </div>

          <div className="form-group">
            <label>Danh mục</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              {Object.entries(categoryNames).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            {errors.category && <span className="error-text">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label>Giá (VNĐ)</label>
            <input
              type="number"
              name="price"
              placeholder="Nhập giá > 0"
              value={formData.price}
              onChange={handleChange}
            />
            {errors.price && <span className="error-text">{errors.price}</span>}
          </div>

          <div className="form-group">
            <label>Tồn kho</label>
            <input
              type="number"
              name="stock"
              placeholder="Nhập số lượng tồn kho (>= 0)"
              value={formData.stock}
              onChange={handleChange}
            />
            {errors.stock && <span className="error-text">{errors.stock}</span>}
          </div>

          <div className="form-group">
            <label>Trạng thái</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="active">Đang bán</option>
              <option value="inactive">Ngưng bán</option>
            </select>
            {errors.status && <span className="error-text">{errors.status}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Huỷ
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
