const pool = require("./backend/src/config/db");

async function seedExpandedData() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("1. Cập nhật Thể loại (Categories)...");
    const categories = [
      { id: 1, name: "Văn học" },
      { id: 2, name: "Công nghệ thông tin" },
      { id: 3, name: "Kỹ năng sống" },
      { id: 4, name: "Thiếu nhi" },
      { id: 5, name: "Kinh tế - Kinh doanh" },
      { id: 6, name: "Tâm lý học" },
      { id: 7, name: "Khoa học - Lịch sử" }
    ];
    for (const cat of categories) {
      await client.query(`
        INSERT INTO category (category_id, category_name)
        VALUES ($1, $2)
        ON CONFLICT (category_id) DO UPDATE SET category_name = EXCLUDED.category_name;
      `, [cat.id, cat.name]);
    }
    await client.query("SELECT setval('category_category_id_seq', (SELECT MAX(category_id) FROM category));");

    console.log("2. Cập nhật Tác giả (Authors)...");
    const authors = [
      { id: 1, name: "Nguyễn Nhật Ánh" },
      { id: 2, name: "Robert C. Martin" },
      { id: 3, name: "Dale Carnegie" },
      { id: 4, name: "Tô Hoài" },
      { id: 5, name: "Kyle Simpson" },
      { id: 6, name: "Haruki Murakami" },
      { id: 7, name: "Paulo Coelho" },
      { id: 8, name: "Yuval Noah Harari" },
      { id: 9, name: "James Clear" },
      { id: 10, name: "Martin Fowler" },
      { id: 11, name: "Andrew Hunt & David Thomas" },
      { id: 12, name: "Stephen R. Covey" },
      { id: 13, name: "Rosie Nguyễn" },
      { id: 14, name: "Antoine de Saint-Exupéry" },
      { id: 15, name: "J.K. Rowling" },
      { id: 16, name: "Daniel Kahneman" },
      { id: 17, name: "Stephen Hawking" },
      { id: 18, name: "Robert Kiyosaki" },
      { id: 19, name: "Napoleon Hill" },
      { id: 20, name: "George Orwell" },
      { id: 21, name: "Harper Lee" },
      { id: 22, name: "F. Scott Fitzgerald" },
      { id: 23, name: "J.D. Salinger" },
      { id: 24, name: "Mark Manson" },
      { id: 25, name: "Hector Garcia" }
    ];
    for (const a of authors) {
      await client.query(`
        INSERT INTO author (author_id, author_name)
        VALUES ($1, $2)
        ON CONFLICT (author_id) DO UPDATE SET author_name = EXCLUDED.author_name;
      `, [a.id, a.name]);
    }
    await client.query("SELECT setval('author_author_id_seq', (SELECT MAX(author_id) FROM author));");

    console.log("3. Cập nhật 8 cuốn sách cũ và chèn 32 cuốn sách mới (Tổng: 40 sách)...");
    const allBooks = [
      // 8 cuốn gốc được cập nhật link ảnh chính xác
      {
        id: 1,
        name: "Lập trình C căn bản",
        author_id: 2,
        category_id: 2,
        publisher: "NXB Trẻ",
        price: 120000.00,
        quantity: 50,
        description: "Giáo trình nhập môn lập trình C chuẩn cho sinh viên CNTT.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780131103627-M.jpg"
      },
      {
        id: 2,
        name: "Lập trình PHP nâng cao",
        author_id: 2,
        category_id: 2,
        publisher: "NXB Trẻ",
        price: 150000.00,
        quantity: 30,
        description: "Lập trình web backend chuyên sâu với PHP, OOP và MySQL.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780596005436-M.jpg"
      },
      {
        id: 3,
        name: "Lập trình Web với JavaScript",
        author_id: 5,
        category_id: 2,
        publisher: "NXB Thông Tin",
        price: 180000.00,
        quantity: 20,
        description: "Thành thạo JavaScript hiện đại từ cơ bản đến nâng cao, ES6+.",
        image_url: "https://covers.openlibrary.org/b/isbn/9781491904244-M.jpg"
      },
      {
        id: 4,
        name: "Clean Code: Nghệ Thuật Viết Mã Sạch",
        author_id: 2,
        category_id: 2,
        publisher: "NXB Prentice Hall",
        price: 250000.00,
        quantity: 15,
        description: "Cẩm nang kinh điển của Uncle Bob về nghệ thuật viết mã nguồn sạch.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg"
      },
      {
        id: 5,
        name: "Đắc Nhân Tâm",
        author_id: 3,
        category_id: 3,
        publisher: "NXB Tổng Hợp",
        price: 90000.00,
        quantity: 100,
        description: "Nghệ thuật giao tiếp, ứng xử và thu phục lòng người kinh điển.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780671027032-M.jpg"
      },
      {
        id: 6,
        name: "Dế Mèn Phiêu Lưu Ký",
        author_id: 4,
        category_id: 4,
        publisher: "NXB Kim Đồng",
        price: 45000.00,
        quantity: 80,
        description: "Tác phẩm văn học thiếu nhi bất hủ về bài học trưởng thành của Dế Mèn.",
        image_url: "https://covers.openlibrary.org/b/isbn/9781408855652-M.jpg"
      },
      {
        id: 7,
        name: "Cho Tôi Xin Một Vé Đi Tuổi Thơ",
        author_id: 1,
        category_id: 1,
        publisher: "NXB Trẻ",
        price: 75000.00,
        quantity: 60,
        description: "Chuyến tàu ký ức tuổi thơ hồn nhiên và cảm động của Nguyễn Nhật Ánh.",
        image_url: "https://covers.openlibrary.org/b/id/12818862-M.jpg"
      },
      {
        id: 8,
        name: "Mắt Biếc",
        author_id: 1,
        category_id: 1,
        publisher: "NXB Trẻ",
        price: 85000.00,
        quantity: 40,
        description: "Câu chuyện tình buồn đơn phương da diết của Ngạn dành cho Hà Lan.",
        image_url: "https://covers.openlibrary.org/b/id/12818863-M.jpg"
      },

      // 32 CUỐN SÁCH MỚI THÊM VÀO
      {
        id: 9,
        name: "The Pragmatic Programmer",
        author_id: 11,
        category_id: 2,
        publisher: "NXB Thông Tin",
        price: 220000.00,
        quantity: 25,
        description: "Hành trình từ lập trình viên nghiệp dư trở thành chuyên gia thực thụ.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780201616224-M.jpg"
      },
      {
        id: 10,
        name: "Refactoring: Tái Cấu Trúc Mã Nguồn",
        author_id: 10,
        category_id: 2,
        publisher: "NXB Thông Tin",
        price: 280000.00,
        quantity: 18,
        description: "Phương pháp cải thiện thiết kế mã nguồn hiện có một cách an toàn.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780201485677-M.jpg"
      },
      {
        id: 11,
        name: "Design Patterns: Mẫu Thiết Kế Hướng Đối Tượng",
        author_id: 2,
        category_id: 2,
        publisher: "NXB Khoa Học",
        price: 290000.00,
        quantity: 12,
        description: "23 mẫu thiết kế kinh điển giúp xây dựng phần mềm linh hoạt.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780201633610-M.jpg"
      },
      {
        id: 12,
        name: "Introduction to Algorithms: Thuật Toán Cơ Bản",
        author_id: 10,
        category_id: 2,
        publisher: "NXB Giáo Dục",
        price: 350000.00,
        quantity: 15,
        description: "Giáo trình thuật toán đồ sộ và uy tín bậc nhất thế giới CLRS.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780262033848-M.jpg"
      },
      {
        id: 13,
        name: "Clean Architecture: Kiến Trúc Phần Mềm Sạch",
        author_id: 2,
        category_id: 2,
        publisher: "NXB Prentice Hall",
        price: 260000.00,
        quantity: 20,
        description: "Quy tắc thiết kế cấu trúc hệ thống phần mềm chịu tải cao và bền vững.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780134494166-M.jpg"
      },
      {
        id: 14,
        name: "You Don't Know JS: Scope & Closures",
        author_id: 5,
        category_id: 2,
        publisher: "NXB Trẻ",
        price: 160000.00,
        quantity: 35,
        description: "Đào sâu cơ chế hoạt động của Scope, Closures và Lexical Scope trong JS.",
        image_url: "https://covers.openlibrary.org/b/isbn/9781491904244-M.jpg"
      },
      {
        id: 15,
        name: "Nhà Giả Kim (The Alchemist)",
        author_id: 7,
        category_id: 1,
        publisher: "NXB Hội Nhà Văn",
        price: 79000.00,
        quantity: 120,
        description: "Hành trình đi tìm kho báu và lắng nghe tiếng gọi số phận của chàng chăn cừu.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780061122415-M.jpg"
      },
      {
        id: 16,
        name: "Rừng Na Uy (Norwegian Wood)",
        author_id: 6,
        category_id: 1,
        publisher: "NXB Hội Nhà Văn",
        price: 110000.00,
        quantity: 50,
        description: "Tiểu thuyết về tuổi trẻ, nỗi cô đơn, mất mát và tình yêu ở Tokyo thập niên 60.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780307277671-M.jpg"
      },
      {
        id: 17,
        name: "Sapiens: Lược Sử Loài Người",
        author_id: 8,
        category_id: 7,
        publisher: "NXB Thế Giới",
        price: 189000.00,
        quantity: 65,
        description: "Góc nhìn toàn cảnh từ thời đồ đá đến kỷ nguyên trí tuệ nhân tạo của loài người.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg"
      },
      {
        id: 18,
        name: "Homo Deus: Lược Sử Tương Lai",
        author_id: 8,
        category_id: 7,
        publisher: "NXB Thế Giới",
        price: 195000.00,
        quantity: 45,
        description: "Dự báo tương lai loài người khi công nghệ sinh học và thuật toán thống trị.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780062464316-M.jpg"
      },
      {
        id: 19,
        name: "Atomic Habits: Thay Đổi Tí Hon Hiệu Quả Bất Ngờ",
        author_id: 9,
        category_id: 3,
        publisher: "NXB Thế Giới",
        price: 149000.00,
        quantity: 110,
        description: "Bí quyết hình thành thói quen tốt và phá vỡ thói quen xấu mỗi ngày 1%.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg"
      },
      {
        id: 20,
        name: "7 Thói Quen Của Người Thành Đạt",
        author_id: 12,
        category_id: 3,
        publisher: "NXB Tổng Hợp",
        price: 160000.00,
        quantity: 80,
        description: "Khung nguyên lý dẫn dắt tư duy tích cực, chủ động và cộng hưởng giá trị.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780743269512-M.jpg"
      },
      {
        id: 21,
        name: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
        author_id: 13,
        category_id: 3,
        publisher: "NXB Hội Nhà Văn",
        price: 80000.00,
        quantity: 95,
        description: "Lời tâm tình và chỉ dẫn hữu ích cho người trẻ tự học và trải nghiệm.",
        image_url: "https://covers.openlibrary.org/b/id/10521482-M.jpg"
      },
      {
        id: 22,
        name: "Hoàng Tử Bé (The Little Prince)",
        author_id: 14,
        category_id: 4,
        publisher: "NXB Kim Đồng",
        price: 55000.00,
        quantity: 100,
        description: "Truyện cổ tích triết lý nhân văn về tình yêu thương, trách nhiệm và tâm hồn.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780156012195-M.jpg"
      },
      {
        id: 23,
        name: "Harry Potter và Hòn Đá Phù Thủy",
        author_id: 15,
        category_id: 4,
        publisher: "NXB Trẻ",
        price: 135000.00,
        quantity: 75,
        description: "Cánh cửa đầu tiên bước vào thế giới phù thủy kỳ diệu tại trường Hogwarts.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780439708180-M.jpg"
      },
      {
        id: 24,
        name: "Harry Potter và Phòng Chứa Bí Mật",
        author_id: 15,
        category_id: 4,
        publisher: "NXB Trẻ",
        price: 145000.00,
        quantity: 60,
        description: "Năm học thứ hai đầy kịch tính của Harry Potter trước quái vật Tử Xà.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780439064873-M.jpg"
      },
      {
        id: 25,
        name: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
        author_id: 1,
        category_id: 1,
        publisher: "NXB Trẻ",
        price: 82000.00,
        quantity: 90,
        description: "Bức tranh đồng quê miền Trung chan chứa tình anh em, tình làng nghĩa xóm.",
        image_url: "https://covers.openlibrary.org/b/id/12818862-M.jpg"
      },
      {
        id: 26,
        name: "Cô Gái Đến Từ Hôm Qua",
        author_id: 1,
        category_id: 1,
        publisher: "NXB Trẻ",
        price: 70000.00,
        quantity: 70,
        description: "Những kỷ niệm học trò ngây thơ, ngọt ngào và rung động đầu đời.",
        image_url: "https://covers.openlibrary.org/b/id/12818863-M.jpg"
      },
      {
        id: 27,
        name: "Tư Duy Nhanh Và Chậm",
        author_id: 16,
        category_id: 6,
        publisher: "NXB Thế Giới",
        price: 210000.00,
        quantity: 40,
        description: "Hai hệ thống tư duy chi phối mọi quyết định và hành vi của con người.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780374533557-M.jpg"
      },
      {
        id: 28,
        name: "Tâm Lý Học Đám Đông",
        author_id: 16,
        category_id: 6,
        publisher: "NXB Thế Giới",
        price: 95000.00,
        quantity: 55,
        description: "Phân tích bản chất, cảm xúc và sự biến chuyển tâm lý của tập thể.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780486419565-M.jpg"
      },
      {
        id: 29,
        name: "Lược Sử Thời Gian",
        author_id: 17,
        category_id: 7,
        publisher: "NXB Trẻ",
        price: 115000.00,
        quantity: 50,
        description: "Khám phá lỗ đen, vụ nổ Big Bang và bí ẩn không gian qua ngòi bút Stephen Hawking.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780553380163-M.jpg"
      },
      {
        id: 30,
        name: "Cha Giàu Cha Nghèo",
        author_id: 18,
        category_id: 5,
        publisher: "NXB Trẻ",
        price: 125000.00,
        quantity: 85,
        description: "Bài học tài chính đột phá để đạt được tự do tài chính từ Robert Kiyosaki.",
        image_url: "https://covers.openlibrary.org/b/isbn/9781612680194-M.jpg"
      },
      {
        id: 31,
        name: "Nghĩ Giàu Và Làm Giàu",
        author_id: 19,
        category_id: 5,
        publisher: "NXB Lao Động",
        price: 110000.00,
        quantity: 90,
        description: "13 nguyên tắc vàng tạo dựng của cải và thành công của Napoleon Hill.",
        image_url: "https://covers.openlibrary.org/b/isbn/9781585424337-M.jpg"
      },
      {
        id: 32,
        name: "Một Chín Tám Tư (1984)",
        author_id: 20,
        category_id: 1,
        publisher: "NXB Văn Học",
        price: 98000.00,
        quantity: 60,
        description: "Kiệt tác tiểu thuyết dystopia tiên tri về xã hội bị giám sát tuyệt đối.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780140283334-M.jpg"
      },
      {
        id: 33,
        name: "Giết Con Chim Nhại",
        author_id: 21,
        category_id: 1,
        publisher: "NXB Văn Học",
        price: 105000.00,
        quantity: 55,
        description: "Câu chuyện cảm động về lương tâm, lòng dũng cảm và công lý tại miền Nam nước Mỹ.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780060935467-M.jpg"
      },
      {
        id: 34,
        name: "Đại Gia Gatsby",
        author_id: 22,
        category_id: 1,
        publisher: "NXB Hội Nhà Văn",
        price: 78000.00,
        quantity: 65,
        description: "Ảo mộng phù hoa và bi kịch của giấc mơ Mỹ trong thập niên cuồng loạn.",
        image_url: "https://covers.openlibrary.org/b/id/8225261-M.jpg"
      },
      {
        id: 35,
        name: "Bắt Trẻ Đồng Xanh",
        author_id: 23,
        category_id: 1,
        publisher: "NXB Hội Nhà Văn",
        price: 85000.00,
        quantity: 50,
        description: "Tiếng nói nổi loạn và khát vọng giữ gìn sự trong sáng của tuổi trẻ.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780316769488-M.jpg"
      },
      {
        id: 36,
        name: "Nghệ Thuật Tinh Tế Của Việc Đếch Quan Tâm",
        author_id: 24,
        category_id: 3,
        publisher: "NXB Công Thương",
        price: 95000.00,
        quantity: 80,
        description: "Học cách buông bỏ những điều vô nghĩa để sống trọn vẹn với giá trị đích thực.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780062457714-M.jpg"
      },
      {
        id: 37,
        name: "Ikigai: Bí Mật Sống Thọ Của Người Nhật",
        author_id: 25,
        category_id: 3,
        publisher: "NXB Dân Trí",
        price: 88000.00,
        quantity: 70,
        description: "Tìm kiếm lý do thức dậy mỗi sớm mai và sống cuộc đời an yên, khỏe mạnh.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780143130727-M.jpg"
      },
      {
        id: 38,
        name: "Quẳng Gánh Lo Đi Và Vui Sống",
        author_id: 3,
        category_id: 3,
        publisher: "NXB Tổng Hợp",
        price: 95000.00,
        quantity: 90,
        description: "Phương pháp xua tan âu lo, căng thẳng để tận hưởng từng ngày trọn vẹn.",
        image_url: "https://covers.openlibrary.org/b/isbn/9780671733353-M.jpg"
      },
      {
        id: 39,
        name: "O Chuột",
        author_id: 4,
        category_id: 4,
        publisher: "NXB Kim Đồng",
        price: 42000.00,
        quantity: 45,
        description: "Tập truyện đồng thoại hóm hỉnh và tinh tế của nhà văn Tô Hoài.",
        image_url: "https://covers.openlibrary.org/b/id/10439521-M.jpg"
      },
      {
        id: 40,
        name: "Võ Sĩ Bọ Ngựa",
        author_id: 4,
        category_id: 4,
        publisher: "NXB Kim Đồng",
        price: 48000.00,
        quantity: 50,
        description: "Những mẩu chuyện ngộ nghĩnh về thế giới côn trùng và muông thú của Tô Hoài.",
        image_url: "https://covers.openlibrary.org/b/id/10543210-M.jpg"
      }
    ];

    for (const b of allBooks) {
      await client.query(`
        INSERT INTO book (book_id, book_name, author_id, category_id, publisher, price, quantity, description, image_url, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (book_id) DO UPDATE SET
          book_name = EXCLUDED.book_name,
          author_id = EXCLUDED.author_id,
          category_id = EXCLUDED.category_id,
          publisher = EXCLUDED.publisher,
          price = EXCLUDED.price,
          quantity = EXCLUDED.quantity,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url;
      `, [b.id, b.name, b.author_id, b.category_id, b.publisher, b.price, b.quantity, b.description, b.image_url]);
    }

    await client.query("SELECT setval('book_book_id_seq', (SELECT MAX(book_id) FROM book));");

    await client.query("COMMIT");
    console.log("✅ Đã cập nhật thành công 40 cuốn sách và đồng bộ dữ liệu CSDL!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Lỗi nạp dữ liệu:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedExpandedData();
