# BÀI LÀM – ĐÁNH GIÁ NĂNG LỰC FRONTEND (K24)

- \*\*Mã đề:01
- \*\*Họ tên:Đỗ Đức Cương
- \*\*Lớp:K24-CNTT4
- \*\*Link repository:https://github.com/HaruHaru08/K24-CNTT4-FE-DGNL-TEST
- **Hệ điều hành (Windows/macOS):** Windows
- **Mã commit P2 đã nộp trước phút 90 (gõ `git log --oneline -1`):**
- **Phiên bản Node.js (gõ `node -v`):** v22.18.0

## 4.1. Giao diện danh sách sản phẩm

> Pha 1 – mức AI-0 (không dùng AI).

> Chấm trực tiếp trên mã nguồn thư mục officemart_admin. Đánh dấu `[x]` vào các mục đã làm để tự kiểm tra.

- [x] 4.1.1. Bố cục trang
- [x] 4.1.2. Bảng sản phẩm
- [x] 4.1.3. Định dạng dữ liệu
- [x] 4.1.4. Hiển thị trên điện thoại

## 4.2. Thêm, sửa, xoá sản phẩm qua API

> Pha 1 – mức AI-0 (không dùng AI).

> Chấm trực tiếp trên mã nguồn thư mục officemart_admin.

- [x] 4.2.1. Tải danh sách
- [x] 4.2.2. Form thêm sản phẩm
- [x] 4.2.3. Gửi form
- [x] 4.2.4. Sửa sản phẩm
- [x] 4.2.5. Xoá sản phẩm

## 4.3. Tìm kiếm, lọc và phân trang

> Pha 2 – mức AI-2 (được dùng AI, ghi nhật ký ở Mục 4.3.5).

> Mục 4.3.1 đến 4.3.3 và ý c của Mục 4.3.4 chấm trực tiếp trên mã nguồn.

- [x] 4.3.1. Tìm kiếm và lọc
- [x] 4.3.2. Phân trang
- [x] 4.3.3. Đồng bộ URL

### 4.3.4. Phản biện mã do AI sinh

#### a) Thao tác làm danh sách hiển thị sai

Các bước thao tác:

```text
1. Khởi động API ở chế độ chậm: npm run api:cham
2. Trên giao diện, nhập từ khoá "ban" vào ô tìm kiếm (request này mất khoảng 2.5 giây để phản hồi).
3. Trong khi request trên chưa phản hồi, lập tức xoá ô tìm kiếm và nhập từ khoá "chuot" (request này chỉ mất 0.1 giây để phản hồi).
```

Kết quả hiển thị:

```text
Sau khoảng 0.1 giây, bảng hiển thị danh sách các sản phẩm chuột. Tuy nhiên, sau khoảng 2.5 giây khi request "ban" hoàn thành, bảng bị ghi đè và hiển thị danh sách các sản phẩm bàn/bàn phím, mặc dù ô tìm kiếm hiện tại vẫn đang ghi "chuot".
```

Kết quả đúng:

```text
Bảng phải luôn hiển thị kết quả tương ứng với từ khoá tìm kiếm mới nhất hiện tại ("chuot"). Phản hồi chậm của request tìm kiếm cũ ("ban") phải bị huỷ hoặc bỏ qua, không được phép ghi đè lên dữ liệu mới.
```

#### b) Vì sao hook hiển thị sai

Hook gặp lỗi Race Condition (tranh chấp dữ liệu bất đồng bộ giữa các request). `useEffect` trong `useProductSearch_ai.js` không thực hiện huỷ bỏ request cũ (không có `AbortController` hoặc cờ hiệu `ignore`) khi các dependency (`q`, `category`, `status`, `page`) thay đổi, dẫn đến request gửi trước nhưng phản hồi chậm sẽ đè lên kết quả của request gửi sau.

#### c) Hook đã sửa

> Chấm trực tiếp trên file src/hooks/useProductSearch.js và trang danh sách.

### 4.3.5. Nhật ký dùng AI (giữ – sửa – loại bỏ)

> Ghi ít nhất 2 lần dùng AI có ảnh hưởng đến mã nộp. Không dùng AI trong Pha 2 thì xoá bảng và ghi "Không sử dụng AI trong Pha 2".

| Lần | Câu lệnh chính gửi cho AI                                                      | Đoạn mã hoặc ý AI đưa ra (file)                                                                                                             | Quyết định (giữ/sửa/loại bỏ) | Lý do                                                                                                        | Bằng chứng kiểm chứng (chạy thử gì, kết quả)                                                          |
| --- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| 1   | "Phát hiện và sửa lỗi race condition trong custom hook useProductSearch_ai.js" | Sử dụng `AbortController` và cờ `isCurrent` trong cleanup function của `useEffect` (`src/hooks/useProductSearch.js`)                        | Giữ                          | Tránh race condition khi các request gửi trước phản hồi sau đè lên dữ liệu mới                               | Chạy `npm run api:cham`, gõ nhanh "ban" rồi đổi thành "chuot", bảng hiển thị đúng kết quả của "chuot" |
| 2   | "Viết logic đồng bộ query params với URL và phân trang trong ProductListPage"  | Dùng `useSearchParams` từ react-router-dom và tạo hàm `updateQuery` để cập nhật q, category, status, page (`src/pages/ProductListPage.jsx`) | Sửa                          | AI ban đầu đề xuất lưu `page=1` vào URL, sửa lại để xoá bớt param `page` khi đang ở trang 1 cho URL gọn gàng | Reload lại trang có `?q=chuot&category=mouse`, form lọc và bảng hiển thị đúng state                   |

## Ghi chú (không tính điểm)

- Xử lý ô tìm kiếm: có debounce 350ms và tự động trim khoảng trắng thừa; nếu chỉ nhập toàn khoảng trắng thì không coi là từ khoá tìm kiếm.
- Xử lý phân trang: tự động reset về trang 1 khi người dùng thay đổi bộ lọc hoặc từ khoá tìm kiếm; nếu `page` trên URL nhỏ hơn 1 hoặc lớn hơn `totalPages` thì tự giới hạn lại hợp lệ.
