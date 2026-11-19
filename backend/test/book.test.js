const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = require("../src/config/db");
const bookService = require("../src/services/book.service");

describe("02_BS5_SearchBook - UNIT TEST SUITE: BOOK SEARCH MODULE", () => {
  before(async () => {
    await pool.query("CREATE EXTENSION IF NOT EXISTS unaccent;");
  });

  after(async () => {
    await pool.end();
  });

  describe("1. Kiểm thử tìm kiếm từ khóa đa dạng", () => {
    test("TC-01: Tìm kiếm sách CNTT 'Clean Code'", async () => {
      const res = await bookService.searchBooks({ q: "Clean Code" });
      assert.ok(res.total >= 1);
      assert.ok(res.books.some((b) => b.book_name.includes("Clean Code")));
    });

    test("TC-02: Tìm kiếm sách Văn học 'Rừng Na Uy'", async () => {
      const res = await bookService.searchBooks({ q: "Rừng Na Uy" });
      assert.ok(res.total >= 1);
      assert.ok(res.books.some((b) => b.book_name.includes("Rừng Na Uy")));
    });

    test("TC-03: Tìm kiếm sách Kỹ năng sống 'Atomic Habits'", async () => {
      const res = await bookService.searchBooks({ q: "Atomic Habits" });
      assert.ok(res.total >= 1);
      assert.ok(res.books.some((b) => b.book_name.includes("Atomic Habits")));
    });

    test("TC-04: Tìm kiếm sách Thiếu nhi 'Harry Potter'", async () => {
      const res = await bookService.searchBooks({ q: "Harry Potter" });
      assert.ok(res.total >= 2);
    });

    test("TC-05: Tìm kiếm có khoảng trắng thừa '   Sapiens   '", async () => {
      const res = await bookService.searchBooks({ q: "   Sapiens   " });
      assert.ok(res.total >= 1);
      assert.ok(res.books.some((b) => b.book_name.includes("Sapiens")));
    });

    test("TC-06: Tìm kiếm từ khóa số '1984'", async () => {
      const res = await bookService.searchBooks({ q: "1984" });
      assert.ok(res.total >= 1);
      assert.ok(res.books.some((b) => b.book_name.includes("1984")));
    });
  });

  describe("2. Kiểm thử tìm kiếm không dấu (unaccent)", () => {
    test("TC-07: 'lap trinh' -> tìm thấy sách Lập trình", async () => {
      const res = await bookService.searchBooks({ q: "lap trinh" });
      assert.ok(res.total >= 3);
      assert.ok(res.books.every((b) => b.book_name.toLowerCase().includes("lập trình")));
    });

    test("TC-08: 'mat biec' -> tìm thấy Mắt Biếc", async () => {
      const res = await bookService.searchBooks({ q: "mat biec" });
      assert.ok(res.total >= 1);
      assert.ok(res.books.some((b) => b.book_name === "Mắt Biếc"));
    });

    test("TC-09: 'dac nhan tam' -> tìm thấy Đắc Nhân Tâm", async () => {
      const res = await bookService.searchBooks({ q: "dac nhan tam" });
      assert.ok(res.total >= 1);
      assert.ok(res.books.some((b) => b.book_name.includes("Đắc Nhân Tâm")));
    });

    test("TC-10: 'nguyen nhat anh' -> tìm thấy sách của Nguyễn Nhật Ánh", async () => {
      const res = await bookService.searchBooks({ q: "nguyen nhat anh" });
      assert.ok(res.total >= 4);
      assert.ok(res.books.every((b) => b.author_name === "Nguyễn Nhật Ánh"));
    });

    test("TC-11: 'to hoai' -> tìm thấy sách của Tô Hoài", async () => {
      const res = await bookService.searchBooks({ q: "to hoai" });
      assert.ok(res.total >= 3);
      assert.ok(res.books.every((b) => b.author_name === "Tô Hoài"));
    });
  });

  describe("3. Kiểm thử chữ hoa / chữ thường", () => {
    test("TC-12: Chữ HOA 'CLEAN CODE' và thường 'clean code'", async () => {
      const upper = await bookService.searchBooks({ q: "CLEAN CODE" });
      const lower = await bookService.searchBooks({ q: "clean code" });
      assert.strictEqual(upper.total, lower.total);
    });

    test("TC-13: Hoa thường xen kẽ 'lẬp tRìNh'", async () => {
      const mixed = await bookService.searchBooks({ q: "lẬp tRìNh" });
      assert.ok(mixed.total >= 3);
    });
  });

  describe("4. Kiểm thử bộ lọc Thể loại (Category)", () => {
    test("TC-14: Lọc thể loại Văn học (cat=1)", async () => {
      const res = await bookService.searchBooks({ category: "1" });
      assert.ok(res.total >= 8);
      assert.ok(res.books.every((b) => b.category_name === "Văn học"));
    });

    test("TC-15: Lọc thể loại CNTT (cat=2)", async () => {
      const res = await bookService.searchBooks({ category: "2" });
      assert.ok(res.total >= 7);
      assert.ok(res.books.every((b) => b.category_name === "Công nghệ thông tin"));
    });

    test("TC-16: Lọc thể loại Khoa học - Lịch sử (cat=7)", async () => {
      const res = await bookService.searchBooks({ category: "7" });
      assert.ok(res.total >= 3);
      assert.ok(res.books.every((b) => b.category_name === "Khoa học - Lịch sử"));
    });
  });

  describe("5. Kiểm thử bộ lọc Tác giả (Author)", () => {
    test("TC-17: Lọc tác giả Robert C. Martin (author=2)", async () => {
      const res = await bookService.searchBooks({ author: "2" });
      assert.ok(res.total >= 4);
      assert.ok(res.books.every((b) => b.author_name === "Robert C. Martin"));
    });

    test("TC-18: Lọc tác giả J.K. Rowling (author=15)", async () => {
      const res = await bookService.searchBooks({ author: "15" });
      assert.ok(res.total >= 2);
      assert.ok(res.books.every((b) => b.author_name === "J.K. Rowling"));
    });

    test("TC-19: Lọc tác giả Yuval Noah Harari (author=8)", async () => {
      const res = await bookService.searchBooks({ author: "8" });
      assert.ok(res.total >= 2);
      assert.ok(res.books.every((b) => b.author_name === "Yuval Noah Harari"));
    });
  });

  describe("6. Kiểm thử khoảng giá (Price Range)", () => {
    test("TC-20: Khoảng giá [40.000 - 60.000]", async () => {
      const res = await bookService.searchBooks({ minPrice: "40000", maxPrice: "60000" });
      assert.ok(res.total >= 1);
      assert.ok(res.books.every((b) => parseFloat(b.price) >= 40000 && parseFloat(b.price) <= 60000));
    });

    test("TC-21: Khoảng giá [200.000 - 400.000]", async () => {
      const res = await bookService.searchBooks({ minPrice: "200000", maxPrice: "400000" });
      assert.ok(res.total >= 5);
      assert.ok(res.books.every((b) => parseFloat(b.price) >= 200000 && parseFloat(b.price) <= 400000));
    });

    test("TC-22: Khoảng giá ngược (min=300k, max=50k) -> 0 kết quả", async () => {
      const res = await bookService.searchBooks({ minPrice: "300000", maxPrice: "50000" });
      assert.strictEqual(res.total, 0);
    });
  });

  describe("7. Kiểm thử sắp xếp (Sorting)", () => {
    test("TC-23: Sắp xếp giá tăng dần (price_asc)", async () => {
      const res = await bookService.searchBooks({ sort: "price_asc", limit: "40" });
      const prices = res.books.map((b) => parseFloat(b.price));
      const sorted = [...prices].sort((a, b) => a - b);
      assert.deepStrictEqual(prices, sorted);
    });

    test("TC-24: Sắp xếp giá giảm dần (price_desc)", async () => {
      const res = await bookService.searchBooks({ sort: "price_desc", limit: "40" });
      const prices = res.books.map((b) => parseFloat(b.price));
      const sorted = [...prices].sort((a, b) => b - a);
      assert.deepStrictEqual(prices, sorted);
    });
  });

  describe("8. Kiểm thử phân trang (Pagination)", () => {
    test("TC-25: Tính toán phân trang chính xác (total=40, limit=6 -> totalPages=7)", async () => {
      const res = await bookService.searchBooks({ page: "1", limit: "6" });
      assert.strictEqual(res.page, 1);
      assert.strictEqual(res.limit, 6);
      assert.strictEqual(res.total, 40);
      assert.strictEqual(res.totalPages, 7);
      assert.strictEqual(res.books.length, 6);
    });

    test("TC-26: Trang 1 và Trang 2 không trùng bản ghi", async () => {
      const p1 = await bookService.searchBooks({ page: "1", limit: "6" });
      const p2 = await bookService.searchBooks({ page: "2", limit: "6" });
      const p1Ids = new Set(p1.books.map((b) => b.book_id));
      assert.ok(p2.books.every((b) => !p1Ids.has(b.book_id)));
    });

    test("TC-27: Vượt quá tổng số trang trả về mảng rỗng []", async () => {
      const res = await bookService.searchBooks({ page: "999", limit: "6" });
      assert.strictEqual(res.books.length, 0);
    });
  });

  describe("9. Kiểm thử bảo mật (SQL Injection)", () => {
    test("TC-28: SQLi Tautology (' OR '1'='1)", async () => {
      const res = await bookService.searchBooks({ q: "' OR '1'='1" });
      assert.strictEqual(res.total, 0);
    });

    test("TC-29: SQLi Stacked Queries ('; DROP TABLE...)", async () => {
      const res = await bookService.searchBooks({ q: "'; DROP TABLE book; --" });
      assert.strictEqual(res.total, 0);
      const check = await bookService.searchBooks({});
      assert.strictEqual(check.total, 40);
    });
  });

  describe("10. Kiểm thử endpoints danh mục & tác giả", () => {
    test("TC-30: getCategories trả về đủ 7 danh mục", async () => {
      const cats = await bookService.getCategories();
      assert.strictEqual(cats.length, 7);
    });

    test("TC-31: getAuthors trả về đủ 25 tác giả", async () => {
      const authors = await bookService.getAuthors();
      assert.strictEqual(authors.length, 25);
    });
  });
});
