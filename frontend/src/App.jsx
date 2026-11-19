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
          <div className="navbar-badge">02_BS5_SearchBook</div>
        </div>
      </nav>

      <main className="main-content">
        <SearchPage />
      </main>

      <footer className="footer">
        <p>
          © 2026 Nhóm 02 - Đồ án Công nghệ phần mềm: Module Tìm kiếm sách (02_BS5_SearchBook)
        </p>
      </footer>
    </div>
  );
}
