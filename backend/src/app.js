const express = require("express");
const cors = require("cors");
const bookRoutes = require("./routes/book.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server đang chạy" });
});

app.use("/api/books", bookRoutes);

app.use(errorHandler);

module.exports = app;
