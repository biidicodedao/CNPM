function errorHandler(err, req, res, next) {
  console.error("❌ Lỗi:", err.message);

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 ? "Đã có lỗi xảy ra, vui lòng thử lại sau" : err.message;

  res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
