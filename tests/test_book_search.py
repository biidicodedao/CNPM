"""
BỘ KỊCH BẢN KIỂM THỬ TỰ ĐỘNG BẰNG PYTHON UNITTEST
ĐỒ ÁN MÔN CÔNG NGHỆ PHẦN MỀM: MODULE TÌM KIẾM SÁCH
Công cụ sử dụng: Python Standard Library `unittest`
Chạy kiểm thử: python -m unittest tests/test_book_search.py -v
"""

import unittest
import urllib.request
import urllib.parse
import json

BASE_URL = "http://localhost:5000/api"

class TestBookSearchAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Kiểm tra server backend trước khi chạy toàn bộ test suite."""
        try:
            req = urllib.request.Request(f"{BASE_URL}/health", method="GET")
            with urllib.request.urlopen(req, timeout=3) as resp:
                cls.server_online = (resp.status == 200)
        except Exception:
            cls.server_online = False

    def setUp(self):
        if not self.server_online:
            self.skipTest("Backend server tại http://localhost:5000 chưa khởi động.")

    def _request(self, endpoint, params=None):
        """Hàm helper gửi HTTP GET request và parse JSON response."""
        url = f"{BASE_URL}{endpoint}"
        if params:
            # Loại bỏ các param có giá trị None
            filtered_params = {k: v for k, v in params.items() if v is not None}
            if filtered_params:
                url += "?" + urllib.parse.urlencode(filtered_params)
        
        req = urllib.request.Request(url, headers={"User-Agent": "Python-UnitTest"})
        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                status_code = response.status
                body = json.loads(response.read().decode("utf-8"))
                return status_code, body
        except urllib.error.HTTPError as err:
            status_code = err.code
            try:
                body = json.loads(err.read().decode("utf-8"))
            except Exception:
                body = {"error": err.reason}
            return status_code, body

    # ============================================================
    # 1. KIỂM THỬ CHỨC NĂNG TÌM KIẾM CƠ BẢN (SEARCH BY KEYWORD)
    # ============================================================
    def test_tc01_search_valid_keyword(self):
        """TC-01: Tìm kiếm từ khóa hợp lệ 'Lập trình'"""
        status, data = self._request("/books/search", {"q": "Lập trình"})
        self.assertEqual(status, 200, "Mã phản hồi HTTP phải là 200 OK")
        self.assertIn("books", data, "Response phải chứa mảng 'books'")
        self.assertGreaterEqual(data["total"], 3, "Số lượng kết quả tìm thấy phải >= 3")
        # Kiểm tra từng sách trả về phải chứa từ khóa 'Lập trình' ở tên, tác giả hoặc thể loại
        for book in data["books"]:
            match = ("lập trình" in book["book_name"].lower() or 
                     "lập trình" in book.get("author_name", "").lower() or 
                     "lập trình" in book.get("category_name", "").lower())
            self.assertTrue(match, f"Sách '{book['book_name']}' phải khớp với từ khóa")

    def test_tc02_search_case_insensitive(self):
        """TC-02: Tìm kiếm không phân biệt chữ HOA / chữ thường"""
        status1, data1 = self._request("/books/search", {"q": "Lập trình"})
        status2, data2 = self._request("/books/search", {"q": "lẬp tRìNh"})
        self.assertEqual(status2, 200)
        self.assertEqual(data1["total"], data2["total"], "Tổng số kết quả giữa HOA và thường phải bằng nhau")
        self.assertEqual(len(data1["books"]), len(data2["books"]), "Danh sách sách trả về phải khớp nhau")

    def test_tc03_search_unaccent_vietnamese(self):
        """TC-03: Tìm kiếm tiếng Việt không dấu (PostgreSQL unaccent)"""
        # Gõ không dấu 'lap trinh' vẫn phải tìm thấy 'Lập trình'
        status, data = self._request("/books/search", {"q": "lap trinh"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 3)
        book_names = [b["book_name"] for b in data["books"]]
        self.assertTrue(any("Lập trình" in name for name in book_names))

        # Gõ không dấu 'nguyen nhat anh' tìm thấy tác giả 'Nguyễn Nhật Ánh'
        status_author, data_author = self._request("/books/search", {"q": "nguyen nhat anh"})
        self.assertEqual(status_author, 200)
        self.assertGreaterEqual(data_author["total"], 2)

    def test_tc04_load_all_books_on_initial_or_empty_keyword(self):
        """TC-04: Hiển thị tất cả sách khi không nhập từ khóa (vào trang lần đầu)"""
        status, data = self._request("/books/search")
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 8, "Cửa hàng hiện có ít nhất 8 cuốn sách")
        self.assertGreater(len(data["books"]), 0)

    def test_tc05_search_not_found(self):
        """TC-05: Tìm kiếm từ khóa không tồn tại trong hệ thống (Empty State)"""
        status, data = self._request("/books/search", {"q": "xyz123khongthetimthay999"})
        self.assertEqual(status, 200, "Khi không tìm thấy, API vẫn trả 200 OK với danh sách rỗng")
        self.assertEqual(data["total"], 0, "total phải bằng 0")
        self.assertEqual(len(data["books"]), 0, "Mảng books phải là rỗng []")

    # ============================================================
    # 2. KIỂM THỬ BẢO MẬT (SECURITY & SQL INJECTION)
    # ============================================================
    def test_tc06_sql_injection_tautology(self):
        """TC-06: Chống tấn công SQL Injection dạng Tautology (' OR '1'='1)"""
        status, data = self._request("/books/search", {"q": "' OR '1'='1"})
        self.assertEqual(status, 200, "Server không được crash hoặc trả lỗi 500")
        # Parameterized Query coi đây là 1 chuỗi ký tự bình thường, không làm lộ toàn bộ DB
        self.assertEqual(data["total"], 0, "Không được leak dữ liệu khi nhập payload SQL Injection")

    def test_tc07_sql_injection_stacked_queries(self):
        """TC-07: Chống tấn công SQL Injection dạng Stacked Queries ('; DROP TABLE...)"""
        status, data = self._request("/books/search", {"q": "'; DROP TABLE book; --"})
        self.assertEqual(status, 200)
        self.assertEqual(data["total"], 0)
        # Đảm bảo bảng book vẫn còn nguyên vẹn sau tấn công
        status_check, data_check = self._request("/books/search")
        self.assertGreaterEqual(data_check["total"], 8, "Bảng book không bị tổn hại")

    # ============================================================
    # 3. KIỂM THỬ BỘ LỌC ĐA TIÊU CHÍ (FILTERS)
    # ============================================================
    def test_tc08_filter_by_category(self):
        """TC-08: Lọc sách theo Thể loại (Category ID = 2: Công nghệ thông tin)"""
        status, data = self._request("/books/search", {"category": 2})
        self.assertEqual(status, 200)
        self.assertGreater(data["total"], 0)
        for book in data["books"]:
            self.assertEqual(book["category_name"], "Công nghệ thông tin", "Mọi sách trả về phải thuộc CNTT")

    def test_tc09_filter_by_author(self):
        """TC-09: Lọc sách theo Tác giả (Author ID = 2: Robert C. Martin)"""
        status, data = self._request("/books/search", {"author": 2})
        self.assertEqual(status, 200)
        self.assertGreater(data["total"], 0)
        for book in data["books"]:
            self.assertEqual(book["author_name"], "Robert C. Martin", "Mọi sách trả về phải do Robert C. Martin viết")

    def test_tc10_filter_by_price_range(self):
        """TC-10: Lọc theo khoảng giá (minPrice = 70.000, maxPrice = 130.000)"""
        status, data = self._request("/books/search", {"minPrice": 70000, "maxPrice": 130000})
        self.assertEqual(status, 200)
        self.assertGreater(data["total"], 0)
        for book in data["books"]:
            price = float(book["price"])
            self.assertTrue(70000 <= price <= 130000, f"Giá sách {price} phải nằm trong [70000, 130000]")

    def test_tc11_combined_search_and_filter(self):
        """TC-11: Tìm kiếm kết hợp vừa có từ khóa vừa có bộ lọc"""
        status, data = self._request("/books/search", {
            "q": "Lập trình",
            "category": 2,
            "minPrice": 140000
        })
        self.assertEqual(status, 200)
        for book in data["books"]:
            self.assertIn("lập trình", book["book_name"].lower())
            self.assertEqual(book["category_name"], "Công nghệ thông tin")
            self.assertGreaterEqual(float(book["price"]), 140000)

    # ============================================================
    # 4. KIỂM THỬ SẮP XẾP (SORTING)
    # ============================================================
    def test_tc12_sort_price_asc(self):
        """TC-12: Sắp xếp theo giá tăng dần (price_asc)"""
        status, data = self._request("/books/search", {"sort": "price_asc", "limit": 20})
        self.assertEqual(status, 200)
        prices = [float(b["price"]) for b in data["books"]]
        self.assertEqual(prices, sorted(prices), "Danh sách giá phải được sắp xếp tăng dần")

    def test_tc13_sort_price_desc(self):
        """TC-13: Sắp xếp theo giá giảm dần (price_desc)"""
        status, data = self._request("/books/search", {"sort": "price_desc", "limit": 20})
        self.assertEqual(status, 200)
        prices = [float(b["price"]) for b in data["books"]]
        self.assertEqual(prices, sorted(prices, reverse=True), "Danh sách giá phải được sắp xếp giảm dần")

    def test_tc14_sort_name_desc(self):
        """TC-14: Sắp xếp theo tên Z-A (name_desc)"""
        status, data = self._request("/books/search", {"q": "Lập trình", "sort": "name_desc"})
        self.assertEqual(status, 200)
        names = [b["book_name"] for b in data["books"]]
        self.assertGreaterEqual(len(names), 3)
        self.assertEqual(names, sorted(names, reverse=True), "Danh sách tên sách phải sắp xếp Z-A: Web -> PHP -> C")

    # ============================================================
    # 5. KIỂM THỬ PHÂN TRANG (PAGINATION)
    # ============================================================
    def test_tc15_pagination(self):
        """TC-15: Phân trang danh sách kết quả (page=1&limit=3 và page=2&limit=3)"""
        status_p1, data_p1 = self._request("/books/search", {"page": 1, "limit": 3})
        status_p2, data_p2 = self._request("/books/search", {"page": 2, "limit": 3})
        self.assertEqual(status_p1, 200)
        self.assertEqual(status_p2, 200)
        self.assertEqual(len(data_p1["books"]), 3)
        self.assertGreater(len(data_p2["books"]), 0)

        # Đảm bảo sách trang 1 và trang 2 không bị trùng lặp ID
        p1_ids = {b["book_id"] for b in data_p1["books"]}
        p2_ids = {b["book_id"] for b in data_p2["books"]}
        self.assertTrue(p1_ids.isdisjoint(p2_ids), "Các bản ghi giữa trang 1 và trang 2 không được trùng lặp")

    # ============================================================
    # 6. KIỂM THỬ CÁC ENDPOINT HỖ TRỢ (SUPPORT ENDPOINTS)
    # ============================================================
    def test_tc16_get_categories_list(self):
        """TC-16: Lấy danh sách thể loại sách (GET /api/books/categories)"""
        status, data = self._request("/books/categories")
        self.assertEqual(status, 200)
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 4)
        first_cat = data[0]
        self.assertIn("category_id", first_cat)
        self.assertIn("category_name", first_cat)

    def test_tc17_get_authors_list(self):
        """TC-17: Lấy danh sách tác giả (GET /api/books/authors)"""
        status, data = self._request("/books/authors")
        self.assertEqual(status, 200)
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 5)
        first_author = data[0]
        self.assertIn("author_id", first_author)
        self.assertIn("author_name", first_author)


if __name__ == "__main__":
    unittest.main()
