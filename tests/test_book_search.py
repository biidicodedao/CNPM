"""
BỘ KỊCH BẢN KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN BẰNG PYTHON UNITTEST (66 TEST CASES)
ĐỒ ÁN MÔN CÔNG NGHỆ PHẦN MỀM: MODULE TÌM KIẾM SÁCH
Công cụ sử dụng: Python Standard Library `unittest`
Chạy kiểm thử: python -m unittest tests/test_book_search.py -v
"""

import unittest
import urllib.request
import urllib.parse
import json

BASE_URL = "http://localhost:5000/api"

class TestBookSearchComprehensive(unittest.TestCase):
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
        """Hàm helper gửi HTTP GET request và parse JSON response an toàn."""
        url = f"{BASE_URL}{endpoint}"
        if params:
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
    # NHÓM 1: KIỂM THỬ TÌM KIẾM TỪ KHÓA ĐA DẠNG (KEYWORD SEARCH)
    # ============================================================
    def test_tc01_search_it_clean_code(self):
        """TC-01: Tìm sách CNTT 'Clean Code'"""
        status, data = self._request("/books/search", {"q": "Clean Code"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)
        self.assertTrue(any("Clean Code" in b["book_name"] for b in data["books"]))

    def test_tc02_search_it_lap_trinh(self):
        """TC-02: Tìm từ khóa chung 'Lập trình'"""
        status, data = self._request("/books/search", {"q": "Lập trình"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 3)

    def test_tc03_search_it_algorithms(self):
        """TC-03: Tìm sách 'Algorithms'"""
        status, data = self._request("/books/search", {"q": "Algorithms"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)

    def test_tc04_search_literature_mat_biec(self):
        """TC-04: Tìm sách Văn học 'Mắt Biếc'"""
        status, data = self._request("/books/search", {"q": "Mắt Biếc"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)
        self.assertEqual(data["books"][0]["book_name"], "Mắt Biếc")

    def test_tc05_search_literature_rung_na_uy(self):
        """TC-05: Tìm sách Văn học dịch 'Rừng Na Uy'"""
        status, data = self._request("/books/search", {"q": "Rừng Na Uy"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)

    def test_tc06_search_skills_atomic_habits(self):
        """TC-06: Tìm sách Kỹ năng sống 'Atomic Habits'"""
        status, data = self._request("/books/search", {"q": "Atomic Habits"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)

    def test_tc07_search_psychology_tu_duy(self):
        """TC-07: Tìm sách Tâm lý học 'Tư Duy Nhanh Và Chậm'"""
        status, data = self._request("/books/search", {"q": "Tư Duy Nhanh"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)

    def test_tc08_search_children_harry_potter(self):
        """TC-08: Tìm sách Thiếu nhi 'Harry Potter'"""
        status, data = self._request("/books/search", {"q": "Harry Potter"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 2)

    def test_tc09_search_history_sapiens(self):
        """TC-09: Tìm sách Lịch sử 'Sapiens'"""
        status, data = self._request("/books/search", {"q": "Sapiens"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)

    def test_tc10_search_with_leading_trailing_whitespace(self):
        """TC-10: Tìm kiếm từ khóa có khoảng trắng thừa ở đầu/cuối ('  Clean Code  ')"""
        status, data = self._request("/books/search", {"q": "  Clean Code  "})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)

    def test_tc11_search_special_colon_character(self):
        """TC-11: Tìm từ khóa có dấu hai chấm ('Clean Architecture: Kiến Trúc')"""
        status, data = self._request("/books/search", {"q": "Clean Architecture: Kiến Trúc"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)

    def test_tc12_search_numeric_1984(self):
        """TC-12: Tìm từ khóa là số '1984'"""
        status, data = self._request("/books/search", {"q": "1984"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)
        self.assertTrue(any("1984" in b["book_name"] for b in data["books"]))

    # ============================================================
    # NHÓM 2: KIỂM THỬ TÌM KIẾM TIẾNG VIỆT KHÔNG DẤU (UNACCENT)
    # ============================================================
    def test_tc13_unaccent_lap_trinh(self):
        """TC-13: Không dấu 'lap trinh' tìm thấy 'Lập trình'"""
        status, data = self._request("/books/search", {"q": "lap trinh"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 3)
        self.assertTrue(all("lập trình" in b["book_name"].lower() for b in data["books"]))

    def test_tc14_unaccent_mat_biec(self):
        """TC-14: Không dấu 'mat biec' tìm thấy 'Mắt Biếc'"""
        status, data = self._request("/books/search", {"q": "mat biec"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)
        self.assertTrue(any(b["book_name"] == "Mắt Biếc" for b in data["books"]))

    def test_tc15_unaccent_dac_nhan_tam(self):
        """TC-15: Không dấu 'dac nhan tam' tìm thấy 'Đắc Nhân Tâm'"""
        status, data = self._request("/books/search", {"q": "dac nhan tam"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)
        self.assertTrue(any("Đắc Nhân Tâm" in b["book_name"] for b in data["books"]))

    def test_tc16_unaccent_de_men(self):
        """TC-16: Không dấu 'de men' tìm thấy 'Dế Mèn Phiêu Lưu Ký'"""
        status, data = self._request("/books/search", {"q": "de men"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)
        self.assertTrue(any("Dế Mèn" in b["book_name"] for b in data["books"]))

    def test_tc17_unaccent_nha_gia_kim(self):
        """TC-17: Không dấu 'nha gia kim' tìm thấy 'Nhà Giả Kim'"""
        status, data = self._request("/books/search", {"q": "nha gia kim"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)
        self.assertTrue(any("Nhà Giả Kim" in b["book_name"] for b in data["books"]))

    def test_tc18_unaccent_hoang_tu_be(self):
        """TC-18: Không dấu 'hoang tu be' tìm thấy 'Hoàng Tử Bé'"""
        status, data = self._request("/books/search", {"q": "hoang tu be"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)
        self.assertTrue(any("Hoàng Tử Bé" in b["book_name"] for b in data["books"]))

    def test_tc19_unaccent_cha_giau_cha_ngheo(self):
        """TC-19: Không dấu 'cha giau cha ngheo' tìm thấy 'Cha Giàu Cha Nghèo'"""
        status, data = self._request("/books/search", {"q": "cha giau cha ngheo"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)
        self.assertTrue(any("Cha Giàu Cha Nghèo" in b["book_name"] for b in data["books"]))

    def test_tc20_unaccent_author_nguyen_nhat_anh(self):
        """TC-20: Không dấu tên tác giả 'nguyen nhat anh'"""
        status, data = self._request("/books/search", {"q": "nguyen nhat anh"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 4)
        for b in data["books"]:
            self.assertEqual(b["author_name"], "Nguyễn Nhật Ánh")

    def test_tc21_unaccent_author_to_hoai(self):
        """TC-21: Không dấu tên tác giả 'to hoai'"""
        status, data = self._request("/books/search", {"q": "to hoai"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 3)
        for b in data["books"]:
            self.assertEqual(b["author_name"], "Tô Hoài")

    def test_tc22_unaccent_category_cong_nghe_thong_tin(self):
        """TC-22: Không dấu tên thể loại 'cong nghe thong tin'"""
        status, data = self._request("/books/search", {"q": "cong nghe thong tin"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 7)

    # ============================================================
    # NHÓM 3: KIỂM THỬ KHÔNG PHÂN BIỆT CHỮ HOA / CHỮ THƯỜNG
    # ============================================================
    def test_tc23_case_uppercase_clean_code(self):
        """TC-23: Tìm chữ HOA 'CLEAN CODE'"""
        status, data = self._request("/books/search", {"q": "CLEAN CODE"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)

    def test_tc24_case_mixed_lap_trinh(self):
        """TC-24: Tìm chữ hoa thường xen kẽ 'lẬp TrÌnH'"""
        status, data = self._request("/books/search", {"q": "lẬp TrÌnH"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 3)

    def test_tc25_case_mixed_harry_potter(self):
        """TC-25: Tìm chữ xen kẽ 'hArRy PoTtEr'"""
        status, data = self._request("/books/search", {"q": "hArRy PoTtEr"})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 2)

    # ============================================================
    # NHÓM 4: KIỂM THỬ TRƯỜNG HỢP KHÔNG TÌM THẤY (EMPTY STATE)
    # ============================================================
    def test_tc26_not_found_random_gibberish(self):
        """TC-26: Chuỗi ký tự vô nghĩa 'xyz987qwe12345'"""
        status, data = self._request("/books/search", {"q": "xyz987qwe12345"})
        self.assertEqual(status, 200)
        self.assertEqual(data["total"], 0)
        self.assertEqual(len(data["books"]), 0)

    def test_tc27_not_found_impossible_combination(self):
        """TC-27: Tìm sách CNTT nhưng tác giả Tô Hoài (không tồn tại)"""
        status, data = self._request("/books/search", {"category": 2, "author": 4})
        self.assertEqual(status, 200)
        self.assertEqual(data["total"], 0)

    def test_tc28_not_found_impossible_price(self):
        """TC-28: Lọc giá trên trời (minPrice = 50.000.000)"""
        status, data = self._request("/books/search", {"minPrice": 50000000})
        self.assertEqual(status, 200)
        self.assertEqual(data["total"], 0)

    # ============================================================
    # NHÓM 5: KIỂM THỬ BỘ LỌC TỪNG THỂ LOẠI (CATEGORY FILTERS)
    # ============================================================
    def test_tc29_filter_category_van_hoc(self):
        """TC-29: Lọc Category 1 (Văn học)"""
        status, data = self._request("/books/search", {"category": 1})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 8)
        for b in data["books"]:
            self.assertEqual(b["category_name"], "Văn học")

    def test_tc30_filter_category_cntt(self):
        """TC-30: Lọc Category 2 (Công nghệ thông tin)"""
        status, data = self._request("/books/search", {"category": 2})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 7)
        for b in data["books"]:
            self.assertEqual(b["category_name"], "Công nghệ thông tin")

    def test_tc31_filter_category_ky_nang_song(self):
        """TC-31: Lọc Category 3 (Kỹ năng sống)"""
        status, data = self._request("/books/search", {"category": 3})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 6)
        for b in data["books"]:
            self.assertEqual(b["category_name"], "Kỹ năng sống")

    def test_tc32_filter_category_thieu_nhi(self):
        """TC-32: Lọc Category 4 (Thiếu nhi)"""
        status, data = self._request("/books/search", {"category": 4})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 5)
        for b in data["books"]:
            self.assertEqual(b["category_name"], "Thiếu nhi")

    def test_tc33_filter_category_kinh_te(self):
        """TC-33: Lọc Category 5 (Kinh tế - Kinh doanh)"""
        status, data = self._request("/books/search", {"category": 5})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 2)
        for b in data["books"]:
            self.assertEqual(b["category_name"], "Kinh tế - Kinh doanh")

    def test_tc34_filter_category_tam_ly(self):
        """TC-34: Lọc Category 6 (Tâm lý học)"""
        status, data = self._request("/books/search", {"category": 6})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 2)
        for b in data["books"]:
            self.assertEqual(b["category_name"], "Tâm lý học")

    def test_tc35_filter_category_khoa_hoc(self):
        """TC-35: Lọc Category 7 (Khoa học - Lịch sử)"""
        status, data = self._request("/books/search", {"category": 7})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 3)
        for b in data["books"]:
            self.assertEqual(b["category_name"], "Khoa học - Lịch sử")

    # ============================================================
    # NHÓM 6: KIỂM THỬ BỘ LỌC TÁC GIẢ (AUTHOR FILTERS)
    # ============================================================
    def test_tc36_filter_author_robert_martin(self):
        """TC-36: Lọc theo Robert C. Martin (ID = 2)"""
        status, data = self._request("/books/search", {"author": 2})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 4)
        for b in data["books"]:
            self.assertEqual(b["author_name"], "Robert C. Martin")

    def test_tc37_filter_author_nguyen_nhat_anh(self):
        """TC-37: Lọc theo Nguyễn Nhật Ánh (ID = 1)"""
        status, data = self._request("/books/search", {"author": 1})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 4)
        for b in data["books"]:
            self.assertEqual(b["author_name"], "Nguyễn Nhật Ánh")

    def test_tc38_filter_author_to_hoai(self):
        """TC-38: Lọc theo Tô Hoài (ID = 4)"""
        status, data = self._request("/books/search", {"author": 4})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 3)
        for b in data["books"]:
            self.assertEqual(b["author_name"], "Tô Hoài")

    def test_tc39_filter_author_jk_rowling(self):
        """TC-39: Lọc theo J.K. Rowling (ID = 15)"""
        status, data = self._request("/books/search", {"author": 15})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 2)
        for b in data["books"]:
            self.assertEqual(b["author_name"], "J.K. Rowling")

    def test_tc40_filter_author_yuval_harari(self):
        """TC-40: Lọc theo Yuval Noah Harari (ID = 8)"""
        status, data = self._request("/books/search", {"author": 8})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 2)
        for b in data["books"]:
            self.assertEqual(b["author_name"], "Yuval Noah Harari")

    # ============================================================
    # NHÓM 7: KIỂM THỬ BỘ LỌC KHOẢNG GIÁ (PRICE RANGE FILTERS)
    # ============================================================
    def test_tc41_price_cheap_range(self):
        """TC-41: Sách giá rẻ [40.000 - 60.000]"""
        status, data = self._request("/books/search", {"minPrice": 40000, "maxPrice": 60000})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)
        for b in data["books"]:
            p = float(b["price"])
            self.assertTrue(40000 <= p <= 60000)

    def test_tc42_price_medium_range(self):
        """TC-42: Sách giá vừa [70.000 - 150.000]"""
        status, data = self._request("/books/search", {"minPrice": 70000, "maxPrice": 150000})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 10)
        for b in data["books"]:
            p = float(b["price"])
            self.assertTrue(70000 <= p <= 150000)

    def test_tc43_price_premium_range(self):
        """TC-43: Sách cao cấp [200.000 - 400.000]"""
        status, data = self._request("/books/search", {"minPrice": 200000, "maxPrice": 400000})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 5)
        for b in data["books"]:
            p = float(b["price"])
            self.assertTrue(200000 <= p <= 400000)

    def test_tc44_price_min_only(self):
        """TC-44: Chỉ truyền minPrice = 250.000 (không giới hạn maxPrice)"""
        status, data = self._request("/books/search", {"minPrice": 250000})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)
        for b in data["books"]:
            self.assertGreaterEqual(float(b["price"]), 250000)

    def test_tc45_price_max_only(self):
        """TC-45: Chỉ truyền maxPrice = 60.000 (không giới hạn minPrice)"""
        status, data = self._request("/books/search", {"maxPrice": 60000})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)
        for b in data["books"]:
            self.assertLessEqual(float(b["price"]), 60000)

    def test_tc46_price_inverted(self):
        """TC-46: Khoảng giá ngược minPrice > maxPrice (min=200k, max=50k)"""
        status, data = self._request("/books/search", {"minPrice": 200000, "maxPrice": 50000})
        self.assertEqual(status, 200)
        self.assertEqual(data["total"], 0, "Không thể có sách có giá vừa >= 200k vừa <= 50k")

    # ============================================================
    # NHÓM 8: KIỂM THỬ SẮP XẾP KẾT QUẢ (SORTING)
    # ============================================================
    def test_tc47_sort_price_asc(self):
        """TC-47: Sắp xếp giá tăng dần (price_asc)"""
        status, data = self._request("/books/search", {"sort": "price_asc", "limit": 40})
        self.assertEqual(status, 200)
        prices = [float(b["price"]) for b in data["books"]]
        self.assertEqual(prices, sorted(prices), "Mảng giá phải tăng dần")

    def test_tc48_sort_price_desc(self):
        """TC-48: Sắp xếp giá giảm dần (price_desc)"""
        status, data = self._request("/books/search", {"sort": "price_desc", "limit": 40})
        self.assertEqual(status, 200)
        prices = [float(b["price"]) for b in data["books"]]
        self.assertEqual(prices, sorted(prices, reverse=True), "Mảng giá phải giảm dần")

    def test_tc49_sort_name_asc_subset(self):
        """TC-49: Sắp xếp tên A-Z (name_asc) cho tập sách CNTT tiếng Anh"""
        status, data = self._request("/books/search", {"q": "Clean", "sort": "name_asc"})
        self.assertEqual(status, 200)
        names = [b["book_name"] for b in data["books"]]
        self.assertGreaterEqual(len(names), 2)
        self.assertEqual(names, sorted(names))

    def test_tc50_sort_name_desc_subset(self):
        """TC-50: Sắp xếp tên Z-A (name_desc)"""
        status, data = self._request("/books/search", {"q": "Lập trình", "sort": "name_desc"})
        self.assertEqual(status, 200)
        names = [b["book_name"] for b in data["books"]]
        self.assertEqual(names, sorted(names, reverse=True))

    def test_tc51_sort_invalid_fallback(self):
        """TC-51: Tham số sort không hợp lệ phải fallback an toàn về name_asc"""
        status, data = self._request("/books/search", {"sort": "hack_column_injection"})
        self.assertEqual(status, 200, "Không được crash khi sort không nằm trong whitelist")
        self.assertGreaterEqual(data["total"], 40)

    # ============================================================
    # NHÓM 9: KIỂM THỬ PHÂN TRANG (PAGINATION)
    # ============================================================
    def test_tc52_pagination_page_1(self):
        """TC-52: Trang 1 với limit = 6"""
        status, data = self._request("/books/search", {"page": 1, "limit": 6})
        self.assertEqual(status, 200)
        self.assertEqual(data["page"], 1)
        self.assertEqual(data["limit"], 6)
        self.assertEqual(len(data["books"]), 6)
        self.assertGreaterEqual(data["totalPages"], 7)

    def test_tc53_pagination_page_2_no_overlap(self):
        """TC-53: Trang 2 không trùng lặp sách với Trang 1"""
        _, p1 = self._request("/books/search", {"page": 1, "limit": 6})
        _, p2 = self._request("/books/search", {"page": 2, "limit": 6})
        ids_p1 = {b["book_id"] for b in p1["books"]}
        ids_p2 = {b["book_id"] for b in p2["books"]}
        self.assertTrue(ids_p1.isdisjoint(ids_p2), "Trang 1 và Trang 2 không được trùng bản ghi")

    def test_tc54_pagination_last_page(self):
        """TC-54: Tải trang cuối cùng"""
        _, init_data = self._request("/books/search", {"limit": 6})
        last_page = init_data["totalPages"]
        status, data = self._request("/books/search", {"page": last_page, "limit": 6})
        self.assertEqual(status, 200)
        self.assertGreater(len(data["books"]), 0)
        self.assertLessEqual(len(data["books"]), 6)

    def test_tc55_pagination_out_of_bounds(self):
        """TC-55: Vượt quá số trang tối đa (page = 9999)"""
        status, data = self._request("/books/search", {"page": 9999, "limit": 6})
        self.assertEqual(status, 200)
        self.assertEqual(len(data["books"]), 0)

    def test_tc56_pagination_limit_cap_at_50(self):
        """TC-56: Tham số limit bị chặn tối đa 50 bản ghi"""
        status, data = self._request("/books/search", {"limit": 999})
        self.assertEqual(status, 200)
        self.assertLessEqual(data["limit"], 50)

    def test_tc57_pagination_negative_page_normalized(self):
        """TC-57: Trang âm (page = -3) tự động chuẩn hóa về page = 1"""
        status, data = self._request("/books/search", {"page": -3})
        self.assertEqual(status, 200)
        self.assertEqual(data["page"], 1)

    # ============================================================
    # NHÓM 10: KIỂM THỬ BẢO MẬT & PHÒNG CHỐNG SQL INJECTION
    # ============================================================
    def test_tc58_sqli_tautology(self):
        """TC-58: SQL Injection dạng Tautology (' OR '1'='1)"""
        status, data = self._request("/books/search", {"q": "' OR '1'='1"})
        self.assertEqual(status, 200)
        self.assertEqual(data["total"], 0, "Không được leak dữ liệu bằng mệnh đề OR")

    def test_tc59_sqli_stacked_drop(self):
        """TC-59: SQL Injection dạng Stacked Queries ('; DROP TABLE...)"""
        status, data = self._request("/books/search", {"q": "'; DROP TABLE book; --"})
        self.assertEqual(status, 200)
        self.assertEqual(data["total"], 0)
        # Kiểm tra bảng book còn nguyên 40 cuốn
        _, check = self._request("/books/search")
        self.assertEqual(check["total"], 40, "Bảng book phải còn nguyên vẹn")

    def test_tc60_sqli_union_select(self):
        """TC-60: SQL Injection dạng UNION SELECT"""
        status, data = self._request("/books/search", {"q": "' UNION SELECT 1, 'HACK', 0, 0, '', '', '' --"})
        self.assertEqual(status, 200)
        self.assertEqual(data["total"], 0)

    def test_tc61_sqli_comment_syntax(self):
        """TC-61: SQL Injection chứa comment '--' hoặc '/*'"""
        status, data = self._request("/books/search", {"q": "Clean Code'--"})
        self.assertEqual(status, 200)
        self.assertEqual(data["total"], 0)

    # ============================================================
    # NHÓM 11: KIỂM THỬ TÌM KIẾM KẾT HỢP ĐA TIÊU CHÍ (COMBINED CRITERIA)
    # ============================================================
    def test_tc62_combined_keyword_and_category(self):
        """TC-62: Kết hợp Từ khóa + Thể loại"""
        status, data = self._request("/books/search", {"q": "Clean", "category": 2})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 2)
        for b in data["books"]:
            self.assertIn("clean", b["book_name"].lower())
            self.assertEqual(b["category_name"], "Công nghệ thông tin")

    def test_tc63_combined_keyword_and_author(self):
        """TC-63: Kết hợp Từ khóa + Tác giả"""
        status, data = self._request("/books/search", {"q": "Harry", "author": 15})
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 2)
        for b in data["books"]:
            self.assertEqual(b["author_name"], "J.K. Rowling")

    def test_tc64_combined_all_criteria(self):
        """TC-64: Kết hợp đầy đủ 5 tiêu chí (q + category + author + price + sort)"""
        status, data = self._request("/books/search", {
            "q": "Lược sử",
            "category": 7,
            "author": 8,
            "minPrice": 150000,
            "sort": "price_asc",
            "page": 1,
            "limit": 5
        })
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 2)
        for b in data["books"]:
            self.assertEqual(b["category_name"], "Khoa học - Lịch sử")
            self.assertEqual(b["author_name"], "Yuval Noah Harari")
            self.assertGreaterEqual(float(b["price"]), 150000)

    # ============================================================
    # NHÓM 12: KIỂM THỬ ENDPOINTS DANH MỤC & TÁC GIẢ
    # ============================================================
    def test_tc65_categories_endpoint(self):
        """TC-65: GET /api/books/categories trả về đủ 7 thể loại"""
        status, data = self._request("/books/categories")
        self.assertEqual(status, 200)
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 7)
        cat_names = [c["category_name"] for c in data]
        self.assertIn("Kinh tế - Kinh doanh", cat_names)
        self.assertIn("Tâm lý học", cat_names)
        self.assertIn("Khoa học - Lịch sử", cat_names)

    def test_tc66_authors_endpoint(self):
        """TC-66: GET /api/books/authors trả về đủ 25 tác giả"""
        status, data = self._request("/books/authors")
        self.assertEqual(status, 200)
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 25)
        author_names = [a["author_name"] for a in data]
        self.assertIn("J.K. Rowling", author_names)
        self.assertIn("Yuval Noah Harari", author_names)
        self.assertIn("James Clear", author_names)


if __name__ == "__main__":
    unittest.main()
