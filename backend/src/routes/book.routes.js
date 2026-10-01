const express = require("express");
const router = express.Router();
const bookController = require("../controllers/book.controller");

router.get("/search", bookController.search);
router.get("/categories", bookController.getCategories);
router.get("/authors", bookController.getAuthors);

module.exports = router;
