import DiscountCodeInput from './DiscountCodeInput';

export default function OrderSummaryCard({
  eventName,
  selectedItems,
  subtotal,
  discount,
  total,
  discountCode,
  onDiscountChange,
  onApplyDiscount,
  discountError,
  discountSuccess,
  onContinue,
  continueDisabled
}) {
  return (
    <div className="summary-card sticky-card">
      <div className="summary-header">
        <div className="summary-icon" />
        <div>
          <h3>Summary</h3>
          <p className="summary-helper">Please, choose a ticket type to continue</p>
        </div>
      </div>

      <div className="summary-box">
        <p className="summary-event-name">{eventName}</p>
        <div className="summary-divider" />
        {selectedItems.length > 0 ? (
          selectedItems.map((item, idx) => (
            <div key={idx} className="summary-line-item">
              <span>{item.quantity} × {item.ticketType}</span>
              <strong>{`₵ ${(item.price * item.quantity).toFixed(2)}`}</strong>
            </div>
          ))
        ) : (
          <p className="summary-empty">Select tickets on the left to see your order summary.</p>
        )}
      </div>

      <DiscountCodeInput
        value={discountCode}
        onChange={onDiscountChange}
        onApply={onApplyDiscount}
        error={discountError}
        success={discountSuccess}
      />

      <div className="summary-divider" />

      <div className="summary-totals">
        <span>Total</span>
        <strong>{`₵ ${total.toFixed(2)}`}</strong>
      </div>

      <button
        type="button"
        className={`primary-button ${continueDisabled ? 'primary-button-disabled' : ''}`}
        onClick={onContinue}
        disabled={continueDisabled}
      >
        Continue to Contact
      </button>

      <p className="summary-footnote">Select tickets to continue</p>
    </div>
  );
}
