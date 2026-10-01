import React from "react";

export default function BookCard({ book }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="book-card">
      <div className="book-card-image-wrap">
        <div className="book-placeholder-cover">
          <span className="book-icon">📖</span>
          <span className="book-cover-title">{book.book_name}</span>
        </div>
      </div>
      <div className="book-card-body">
        <span className="book-category-tag">{book.category_name}</span>
        <h3 className="book-title" title={book.book_name}>
          {book.book_name}
        </h3>
        <p className="book-author">
          <span className="author-label">Tác giả:</span> {book.author_name}
        </p>
        <div className="book-card-footer">
          <span className="book-price">{formatPrice(book.price)}</span>
          <span
            className={`book-stock ${book.quantity > 0 ? "in-stock" : "out-of-stock"}`}
          >
            {book.quantity > 0 ? `Còn hàng (${book.quantity})` : "Hết hàng"}
          </span>
        </div>
      </div>
    </div>
  );
}
