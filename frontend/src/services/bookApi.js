const API_BASE = "http://localhost:5000/api/books";

/**
 * Gọi API tìm kiếm sách
 * @param {Object} params - { q, category, author, minPrice, maxPrice, sort, page, limit }
 */
export async function searchBooks(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const res = await fetch(`${API_BASE}/search?${query.toString()}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Lỗi khi tìm kiếm sách");
  }

  return data;
}

/**
 * Lấy danh sách thể loại sách để hiển thị bộ lọc
 */
export async function getCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) {
    throw new Error("Không thể tải danh sách thể loại");
  }
  return await res.json();
}

/**
 * Lấy danh sách tác giả để hiển thị bộ lọc
 */
export async function getAuthors() {
  const res = await fetch(`${API_BASE}/authors`);
  if (!res.ok) {
    throw new Error("Không thể tải danh sách tác giả");
  }
  return await res.json();
}
