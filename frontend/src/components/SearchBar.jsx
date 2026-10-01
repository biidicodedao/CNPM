import React from "react";

export default function SearchBar({
  keyword,
  onChange,
  onSearch,
  onClear,
  isLoading,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <svg
          className="search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>

        <input
          type="text"
          className="search-input"
          placeholder="Nhập tên sách, tác giả hoặc thể loại..."
          value={keyword}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />

        {keyword && (
          <button
            type="button"
            className="clear-button"
            onClick={onClear}
            title="Xóa từ khóa"
            aria-label="Xóa từ khóa"
          >
            ✕
          </button>
        )}
      </div>

      <button
        type="button"
        className="search-button"
        onClick={onSearch}
        disabled={isLoading}
      >
        {isLoading ? <span className="spinner-small"></span> : "Tìm kiếm"}
      </button>
    </div>
  );
}
