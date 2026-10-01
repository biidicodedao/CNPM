const bookRepository = require("../repositories/book.repository");

async function searchBooks(query) {
  const keyword = (query.q || "").trim();

  if (!keyword) {
    const error = new Error("Vui lòng nhập từ khóa tìm kiếm");
    error.statusCode = 400;
    throw error;
  }

  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 12, 1), 50);
  const offset = (page - 1) * limit;

  const result = await bookRepository.searchBooks({
    keyword,
    categoryId: query.category ? parseInt(query.category, 10) : null,
    authorId: query.author ? parseInt(query.author, 10) : null,
    minPrice: query.minPrice ? parseFloat(query.minPrice) : null,
    maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : null,
    sortBy: query.sort || null,
    limit,
    offset,
  });

  return {
    keyword,
    page,
    limit,
    total: result.total,
    totalPages: Math.ceil(result.total / limit),
    books: result.books,
  };
}

async function getCategories() {
  return await bookRepository.getCategories();
}

async function getAuthors() {
  return await bookRepository.getAuthors();
}

module.exports = { searchBooks, getCategories, getAuthors };
