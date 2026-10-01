import React from "react";

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h4 className="error-title">Thông báo</h4>
        <p className="error-message">{message}</p>
      </div>
      {onRetry && (
        <button type="button" className="btn-error-retry" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  );
}
