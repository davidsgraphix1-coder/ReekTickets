export default function DiscountCodeInput({ value, onChange, onApply, error, success }) {
  return (
    <div className="discount-box">
      <label className="discount-label">Discount Code</label>
      <div className="discount-row">
        <input
          type="text"
          className="discount-input"
          placeholder="Enter code"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" className="discount-apply-btn" onClick={onApply}>
          Apply
        </button>
      </div>
      {error && <p className="discount-message discount-error">{error}</p>}
      {success && <p className="discount-message discount-success">{success}</p>}
    </div>
  );
}
