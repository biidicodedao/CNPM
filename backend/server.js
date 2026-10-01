require("dotenv").config();
const app = require("./src/app");
const pool = require("./src/config/db");

const PORT = process.env.PORT || 5000;

// Test kết nối DB và kích hoạt extension unaccent trước khi start server
pool.query("SELECT NOW()", async (err, result) => {
  if (err) {
    console.error("❌ Không thể kết nối database:", err.message);
    process.exit(1);
  }
  console.log("🕐 Thời gian server DB:", result.rows[0].now);

  try {
    await pool.query("CREATE EXTENSION IF NOT EXISTS unaccent");
    console.log("✅ Extension unaccent đã sẵn sàng");
  } catch (extErr) {
    console.warn("⚠️ Cảnh báo khởi tạo unaccent:", extErr.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
  });
});
