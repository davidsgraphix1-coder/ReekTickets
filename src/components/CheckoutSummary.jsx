export default function CheckoutSummary({ eventName, selectedItems, subtotal, discount, total, coupon, contactInfo, paymentError, onBack }) {
  return (
    <div className="summary-card sticky-card">
      <div className="summary-header">
        <div className="summary-icon" />
        <div>
          <h3>Summary</h3>
          <p className="summary-helper">Review order details before payment</p>
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
          <p className="summary-empty">No tickets selected.</p>
        )}
        <div className="summary-divider" />
        <div className="summary-line-item muted-row">
          <span>Subtotal</span>
          <strong>{`₵ ${subtotal.toFixed(2)}`}</strong>
        </div>
        {discount > 0 && (
          <>
            <div className="summary-line-item discount-row">
              <span>Discount {coupon?.code || ''}</span>
              <strong>- ₵ {discount.toFixed(2)}</strong>
            </div>
            {coupon?.description && (
              <div className="summary-line-item discount-description">
                <span>{coupon.description}</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="summary-divider" />
      <div className="summary-totals">
        <span>Total</span>
        <strong>{`₵ ${total.toFixed(2)}`}</strong>
      </div>
      {paymentError && <p className="payment-error-text">{paymentError}</p>}
      <button type="button" className="secondary-button full-width" onClick={onBack}>
        Back to tickets
      </button>
    </div>
  );
}
