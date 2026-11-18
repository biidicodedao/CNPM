const path = require("path");
const { Pool } = require("pg");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "TIM_KIEM_SACH",
  user: process.env.DB_USER || "postgres",
  password: String(process.env.DB_PASSWORD || ""),
});

pool.on("connect", () => {
  console.log("✅ Kết nối PostgreSQL thành công");
});

pool.on("error", (err) => {
  console.error("❌ Lỗi kết nối PostgreSQL:", err.message);
});

module.exports = pool;
