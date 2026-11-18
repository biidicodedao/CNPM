const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = require("../src/config/db");
const bookService = require("../src/services/book.service");
const bookRepository = require("../src/repositories/book.repository");

describe("UNIT TEST SUITE: BOOK SEARCH MODULE", () => {
  before(async () => {
    // Đảm bảo extension unaccent đã sẵn sàng
    await pool.query("CREATE EXTENSION IF NOT EXISTS unaccent;");
  });

  after(async () => {
    // Đóng pool kết nối sau khi hoàn thành test
    await pool.end();
  });

  // ============================================================
  // 1. UNIT TEST: BOOK SERVICE LAYER
  // ============================================================
  describe("Tầng Service (book.service.js)", () => {
    test("TC-01: Tìm kiếm sách theo từ khóa có dấu 'Lập trình'", async () => {
      const result = await bookService.searchBooks({ q: "Lập trình" });
      assert.ok(result);
      assert.strictEqual(result.keyword, "Lập trình");
      assert.ok(result.total >= 3);
      assert.ok(Array.isArray(result.books));
      assert.ok(result.books.length >= 3);

      for (const book of result.books) {
        const matches =
          book.book_name.toLowerCase().includes("lập trình") ||
          book.author_name.toLowerCase().includes("lập trình") ||
          book.category_name.toLowerCase().includes("lập trình");
        assert.ok(matches, `Cuốn sách ${book.book_name} phải khớp từ khóa`);
      }
    });

    test("TC-02: Tìm kiếm không phân biệt chữ hoa / thường (Case-insensitive)", async () => {
      const resLower = await bookService.searchBooks({ q: "lập trình" });
      const resUpper = await bookService.searchBooks({ q: "LẬP TRÌNH" });
      assert.strictEqual(resLower.total, resUpper.total);
      assert.strictEqual(resLower.books.length, resUpper.books.length);
    });

    test("TC-03: Tìm kiếm tiếng Việt không dấu (PostgreSQL unaccent)", async () => {
      const result = await bookService.searchBooks({ q: "lap trinh" });
      assert.ok(result.total >= 3);
      const names = result.books.map((b) => b.book_name);
      assert.ok(names.some((name) => name.includes("Lập trình")));
    });

    test("TC-04: Hiển thị toàn bộ sách khi không có từ khóa", async () => {
      const result = await bookService.searchBooks({});
      assert.ok(result.total >= 8);
      assert.ok(result.books.length > 0);
    });

    test("TC-05: Tìm kiếm từ khóa không tồn tại trả về danh sách rỗng (Empty State)", async () => {
      const result = await bookService.searchBooks({ q: "xyz123khongtontai999" });
      assert.strictEqual(result.total, 0);
      assert.strictEqual(result.books.length, 0);
      assert.strictEqual(result.totalPages, 0);
    });

    test("TC-06: Bảo mật chống SQL Injection (' OR '1'='1)", async () => {
      const result = await bookService.searchBooks({ q: "' OR '1'='1" });
      // Parameterized query sẽ coi đây là chuỗi bình thường, không leak toàn bộ DB
      assert.strictEqual(result.total, 0);
      assert.strictEqual(result.books.length, 0);
    });

    test("TC-07: Lọc theo thể loại (Category ID = 2: CNTT)", async () => {
      const result = await bookService.searchBooks({ category: "2" });
      assert.ok(result.total > 0);
      for (const book of result.books) {
        assert.strictEqual(book.category_name, "Công nghệ thông tin");
      }
    });

    test("TC-08: Lọc theo tác giả (Author ID = 2: Robert C. Martin)", async () => {
      const result = await bookService.searchBooks({ author: "2" });
      assert.ok(result.total > 0);
      for (const book of result.books) {
        assert.strictEqual(book.author_name, "Robert C. Martin");
      }
    });

    test("TC-09: Lọc theo khoảng giá (minPrice = 70.000, maxPrice = 130.000)", async () => {
      const result = await bookService.searchBooks({ minPrice: "70000", maxPrice: "130000" });
      assert.ok(result.total > 0);
      for (const book of result.books) {
        const price = parseFloat(book.price);
        assert.ok(price >= 70000 && price <= 130000);
      }
    });

    test("TC-10: Sắp xếp theo giá tăng dần (price_asc)", async () => {
      const result = await bookService.searchBooks({ sort: "price_asc", limit: "20" });
      const prices = result.books.map((b) => parseFloat(b.price));
      const sortedPrices = [...prices].sort((a, b) => a - b);
      assert.deepStrictEqual(prices, sortedPrices);
    });

    test("TC-11: Sắp xếp theo giá giảm dần (price_desc)", async () => {
      const result = await bookService.searchBooks({ sort: "price_desc", limit: "20" });
      const prices = result.books.map((b) => parseFloat(b.price));
      const sortedPrices = [...prices].sort((a, b) => b - a);
      assert.deepStrictEqual(prices, sortedPrices);
    });

    test("TC-12: Phân trang (Pagination) - Tính toán offset và limit", async () => {
      const page1 = await bookService.searchBooks({ page: "1", limit: "3" });
      const page2 = await bookService.searchBooks({ page: "2", limit: "3" });
      assert.strictEqual(page1.page, 1);
      assert.strictEqual(page1.limit, 3);
      assert.strictEqual(page1.books.length, 3);
      assert.strictEqual(page2.page, 2);
      assert.ok(page2.books.length > 0);

      const p1Ids = new Set(page1.books.map((b) => b.book_id));
      const hasDuplicate = page2.books.some((b) => p1Ids.has(b.book_id));
      assert.strictEqual(hasDuplicate, false, "Trang 1 và Trang 2 không được chứa bản ghi trùng nhau");
    });

    test("TC-13: Lấy danh sách danh mục thể loại (getCategories)", async () => {
      const categories = await bookService.getCategories();
      assert.ok(Array.isArray(categories));
      assert.ok(categories.length >= 4);
      assert.ok(categories[0].category_id);
      assert.ok(categories[0].category_name);
    });

    test("TC-14: Lấy danh sách tác giả (getAuthors)", async () => {
      const authors = await bookService.getAuthors();
      assert.ok(Array.isArray(authors));
      assert.ok(authors.length >= 5);
      assert.ok(authors[0].author_id);
      assert.ok(authors[0].author_name);
    });
  });
});
