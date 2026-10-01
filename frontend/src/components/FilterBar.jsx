import React from "react";

export default function FilterBar({
  categories = [],
  authors = [],
  selectedCategory,
  onCategoryChange,
  selectedAuthor,
  onAuthorChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  sortBy,
  onSortChange,
  onResetFilters,
  onApplyFilters,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="category-select" className="filter-label">
          Thể loại:
        </label>
        <select
          id="category-select"
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">-- Tất cả thể loại --</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_id}>
              {cat.category_name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="author-select" className="filter-label">
          Tác giả:
        </label>
        <select
          id="author-select"
          className="filter-select"
          value={selectedAuthor}
          onChange={(e) => onAuthorChange(e.target.value)}
        >
          <option value="">-- Tất cả tác giả --</option>
          {authors.map((auth) => (
            <option key={auth.author_id} value={auth.author_id}>
              {auth.author_name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group price-range-group">
        <label className="filter-label">Khoảng giá (VNĐ):</label>
        <div className="price-inputs">
          <input
            type="number"
            className="filter-input-price"
            placeholder="Từ"
            min="0"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
          />
          <span className="price-separator">-</span>
          <input
            type="number"
            className="filter-input-price"
            placeholder="Đến"
            min="0"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="sort-select" className="filter-label">
          Sắp xếp:
        </label>
        <select
          id="sort-select"
          className="filter-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="name_asc">Tên A → Z</option>
          <option value="name_desc">Tên Z → A</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
        </select>
      </div>

      <div className="filter-actions">
        <button
          type="button"
          className="btn-apply-filter"
          onClick={onApplyFilters}
        >
          Áp dụng
        </button>
        <button
          type="button"
          className="btn-reset-filter"
          onClick={onResetFilters}
        >
          Đặt lại
        </button>
      </div>
    </div>
  );
}
