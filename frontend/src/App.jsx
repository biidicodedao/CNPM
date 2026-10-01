import React from "react";
import SearchPage from "./pages/SearchPage";
import "./App.css";

export default function App() {
  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <span className="logo-icon">📖</span>
            <span className="logo-text">BOOKSTORE SEARCH</span>
          </div>
          <div className="navbar-badge">Module Tìm Kiếm Sách</div>
        </div>
      </nav>

      <main className="main-content">
        <SearchPage />
      </main>

      <footer className="footer">
        <p>
          © 2026 - Đồ án Công nghệ phần mềm: Module Tìm kiếm sách trong Cửa hàng
          bán sách
        </p>
      </footer>
    </div>
  );
}
