import React from "react";

export default function EmptyState({ keyword, onReset }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">🔍</div>
      <h3 className="empty-title">Không tìm thấy sách phù hợp</h3>
      <p className="empty-desc">
        {keyword ? (
          <>
            Không có kết quả nào khớp với từ khóa <strong>"{keyword}"</strong>{" "}
            và các bộ lọc hiện tại.
          </>
        ) : (
          "Vui lòng thử tìm kiếm với từ khóa khác."
        )}
      </p>
      <div className="empty-suggestions">
        <p>Gợi ý:</p>
        <ul>
          <li>Kiểm tra lại lỗi chính tả của từ khóa.</li>
          <li>Thử sử dụng từ khóa ngắn gọn, tổng quát hơn.</li>
          <li>Nới rộng khoảng giá hoặc bỏ bớt tiêu chí lọc.</li>
        </ul>
      </div>
      {onReset && (
        <button type="button" className="btn-empty-reset" onClick={onReset}>
          Xóa bộ lọc & thử lại
        </button>
      )}
    </div>
  );
}
