const pool = require("../config/db");

async function searchBooks({
  keyword,
  categoryId,
  authorId,
  minPrice,
  maxPrice,
  sortBy,
  limit,
  offset,
}) {
  const conditions = [];
  const values = [];
  let idx = 1;

  // Điều kiện từ khóa (tùy chọn: hỗ trợ tìm kiếm cả có dấu và không dấu khi có keyword)
  if (keyword && keyword.trim() !== "") {
    conditions.push(
      `(unaccent(b.book_name) ILIKE unaccent($${idx}) OR unaccent(a.author_name) ILIKE unaccent($${idx}) OR unaccent(c.category_name) ILIKE unaccent($${idx}))`,
    );
    values.push(`%${keyword.trim()}%`);
    idx++;
  }

  // Điều kiện lọc (tùy chọn)
  if (categoryId) {
    conditions.push(`b.category_id = $${idx}`);
    values.push(categoryId);
    idx++;
  }
  if (authorId) {
    conditions.push(`b.author_id = $${idx}`);
    values.push(authorId);
    idx++;
  }
  if (minPrice) {
    conditions.push(`b.price >= $${idx}`);
    values.push(minPrice);
    idx++;
  }
  if (maxPrice) {
    conditions.push(`b.price <= $${idx}`);
    values.push(maxPrice);
    idx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Whitelist cột sort — KHÔNG lấy trực tiếp từ input người dùng
  const SORT_MAP = {
    price_asc: "b.price ASC",
    price_desc: "b.price DESC",
    name_asc: "b.book_name ASC",
    name_desc: "b.book_name DESC",
  };
  const orderBy = SORT_MAP[sortBy] || "b.book_name ASC";

  const dataQuery = `
    SELECT b.book_id, b.book_name, b.price, b.quantity, b.image_url,
           a.author_name, c.category_name
    FROM book b
    JOIN author a ON b.author_id = a.author_id
    JOIN category c ON b.category_id = c.category_id
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT $${idx} OFFSET $${idx + 1}
  `;
  const dataValues = [...values, limit, offset];

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM book b
    JOIN author a ON b.author_id = a.author_id
    JOIN category c ON b.category_id = c.category_id
    ${whereClause}
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, dataValues),
    pool.query(countQuery, values),
  ]);

  return {
    books: dataResult.rows,
    total: parseInt(countResult.rows[0].total, 10),
  };
}

async function getCategories() {
  const result = await pool.query(
    "SELECT category_id, category_name FROM category ORDER BY category_name ASC",
  );
  return result.rows;
}

async function getAuthors() {
  const result = await pool.query(
    "SELECT author_id, author_name FROM author ORDER BY author_name ASC",
  );
  return result.rows;
}

module.exports = { searchBooks, getCategories, getAuthors };
