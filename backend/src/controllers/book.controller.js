const bookService = require("../services/book.service");

async function search(req, res, next) {
  try {
    const result = await bookService.searchBooks(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getCategories(req, res, next) {
  try {
    const categories = await bookService.getCategories();
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
}

async function getAuthors(req, res, next) {
  try {
    const authors = await bookService.getAuthors();
    res.status(200).json(authors);
  } catch (err) {
    next(err);
  }
}

module.exports = { search, getCategories, getAuthors };
