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

  // Load categories, authors, và toàn bộ sách khi vừa vào trang
  useEffect(() => {
    async function init() {
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
      // Tự động tải tất cả sách ngay khi mở link
      executeSearch(1, { kw: "" });
    }
    init();
  }, []);

  // Thực hiện tìm kiếm hoặc lọc sách
  const executeSearch = async (page = 1, overrideParams = {}) => {
    setIsLoading(true);
    setErrorMessage("");

    const kw = overrideParams.kw !== undefined ? overrideParams.kw : keyword.trim();
    const cat = overrideParams.cat !== undefined ? overrideParams.cat : selectedCategory;
    const auth = overrideParams.auth !== undefined ? overrideParams.auth : selectedAuthor;
    const minP = overrideParams.min !== undefined ? overrideParams.min : minPrice;
    const maxP = overrideParams.max !== undefined ? overrideParams.max : maxPrice;
    const sort = overrideParams.sort !== undefined ? overrideParams.sort : sortBy;

    try {
      const data = await searchBooks({
        q: kw || undefined,
        category: cat || undefined,
        author: auth || undefined,
        minPrice: minP || undefined,
        maxPrice: maxP || undefined,
        sort: sort || undefined,
        page,
        limit,
      });

      setBooks(data.books || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(data.page || 1);
      setLastSearchedKeyword(kw);
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
    setCurrentPage(1);
    // Tự động cập nhật lại danh sách sách theo các bộ lọc đang chọn
    executeSearch(1, { kw: "" });
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
    setCurrentPage(1);
    // Đặt lại bộ lọc và hiển thị lại toàn bộ sách theo từ khóa hiện tại (nếu có)
    executeSearch(1, { cat: "", auth: "", min: "", max: "", sort: "name_asc" });
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    executeSearch(1);
  };

  return (
    <div className="search-page-container">
      <header className="page-header">
        <h1 className="header-title">📚 Cửa Hàng Sách Trực Tuyến</h1>
        <p className="header-subtitle">
          Tìm kiếm sách dễ dàng theo tên sách, tác giả hoặc lọc theo thể loại, khoảng giá
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
          onRetry={handleSearchClick}
        />
      )}

      {/* Trạng thái Loading */}
      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu sách...</p>
        </div>
      )}

      {/* Kết quả hiển thị sách */}
      {!isLoading && !errorMessage && hasSearched && (
        <section className="results-section">
          {books.length > 0 ? (
            <>
              <div className="results-header">
                <span className="results-count">
                  {lastSearchedKeyword ? (
                    <>
                      Tìm thấy <strong>{total}</strong> kết quả cho từ khóa "
                      <em>{lastSearchedKeyword}</em>"
                    </>
                  ) : (
                    <>
                      Hiển thị <strong>{total}</strong> cuốn sách
                      {(selectedCategory || selectedAuthor || minPrice || maxPrice)
                        ? " theo bộ lọc"
                        : " trong cửa hàng"}
                    </>
                  )}
                </span>
                <span className="results-page-info">
                  Trang {currentPage} / {Math.max(totalPages, 1)}
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
                setKeyword("");
                executeSearch(1, { kw: "", cat: "", auth: "", min: "", max: "", sort: "name_asc" });
              }}
            />
          )}
        </section>
      )}
    </div>
  );
}
