import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import BookList from "../components/BookList";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { searchBooks, getCategories, getAuthors } from "../services/bookApi";

export default function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(6);

  // Result states
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [lastSearchedKeyword, setLastSearchedKeyword] = useState("");

  // UI status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Load categories and authors on mount
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const [cats, auths] = await Promise.all([
          getCategories().catch(() => []),
          getAuthors().catch(() => []),
        ]);
        setCategories(cats);
        setAuthors(auths);
      } catch (err) {
        console.error("Lỗi tải danh mục/tác giả:", err);
      }
    }
    loadFilterOptions();
  }, []);

  // Thực hiện tìm kiếm
  const executeSearch = async (page = 1) => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      setErrorMessage("Vui lòng nhập từ khóa tìm kiếm");
      setBooks([]);
      setTotal(0);
      setTotalPages(0);
      setHasSearched(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await searchBooks({
        q: trimmed,
        category: selectedCategory || undefined,
        author: selectedAuthor || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort: sortBy || undefined,
        page,
        limit,
      });

      setBooks(data.books || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(data.page || 1);
      setLastSearchedKeyword(trimmed);
      setHasSearched(true);
    } catch (err) {
      setErrorMessage(err.message || "Đã có lỗi xảy ra");
      setBooks([]);
      setTotal(0);
      setTotalPages(0);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchClick = () => {
    setCurrentPage(1);
    executeSearch(1);
  };

  const handleClearKeyword = () => {
    setKeyword("");
    setErrorMessage("");
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    executeSearch(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSelectedAuthor("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("name_asc");
  };

  const handleApplyFilters = () => {
    if (keyword.trim()) {
      setCurrentPage(1);
      executeSearch(1);
    }
  };

  return (
    <div className="search-page-container">
      <header className="page-header">
        <h1 className="header-title">📚 Cửa Hàng Sách Trực Tuyến</h1>
        <p className="header-subtitle">
          Tìm kiếm sách dễ dàng theo tên sách, tác giả hoặc thể loại
        </p>
      </header>

      <section className="search-section">
        <SearchBar
          keyword={keyword}
          onChange={(val) => {
            setKeyword(val);
            if (errorMessage) setErrorMessage("");
          }}
          onSearch={handleSearchClick}
          onClear={handleClearKeyword}
          isLoading={isLoading}
        />

        <FilterBar
          categories={categories}
          authors={authors}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedAuthor={selectedAuthor}
          onAuthorChange={setSelectedAuthor}
          minPrice={minPrice}
          onMinPriceChange={setMinPrice}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onResetFilters={handleResetFilters}
          onApplyFilters={handleApplyFilters}
        />
      </section>

      {/* Thông báo lỗi */}
      {errorMessage && (
        <ErrorState
          message={errorMessage}
          onRetry={keyword.trim() ? handleSearchClick : null}
        />
      )}

      {/* Trạng thái Loading */}
      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tìm kiếm sách...</p>
        </div>
      )}

      {/* Kết quả tìm kiếm */}
      {!isLoading && !errorMessage && hasSearched && (
        <section className="results-section">
          {books.length > 0 ? (
            <>
              <div className="results-header">
                <span className="results-count">
                  Tìm thấy <strong>{total}</strong> kết quả cho từ khóa "
                  <em>{lastSearchedKeyword}</em>"
                </span>
                <span className="results-page-info">
                  Trang {currentPage} / {totalPages}
                </span>
              </div>

              <BookList books={books} />

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <EmptyState
              keyword={lastSearchedKeyword}
              onReset={() => {
                handleResetFilters();
                if (keyword.trim()) executeSearch(1);
              }}
            />
          )}
        </section>
      )}

      {/* Banner hướng dẫn ban đầu khi chưa tìm kiếm */}
      {!hasSearched && !isLoading && !errorMessage && (
        <div className="initial-guide">
          <div className="guide-card">
            <h3>💡 Hướng dẫn tìm kiếm</h3>
            <p>
              Nhập từ khóa như <strong>"Lập trình"</strong>,{" "}
              <strong>"Robert C. Martin"</strong>, hoặc{" "}
              <strong>"Văn học"</strong> vào thanh tìm kiếm phía trên rồi bấm{" "}
              <strong>Tìm kiếm</strong> hoặc phím <strong>Enter</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
