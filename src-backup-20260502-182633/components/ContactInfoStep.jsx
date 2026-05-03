import PaystackPaymentCard from './PaystackPaymentCard';

export default function ContactInfoStep({ contactInfo, onChange, errors, onPay, submitLoading }) {
  return (
    <div className="contact-step-card">
      <div className="form-grid">
        <label className="field-group">
          <span>Full Name</span>
          <input
            type="text"
            value={contactInfo.fullName}
            onChange={(e) => onChange('fullName', e.target.value)}
            placeholder="Enter full name"
            className={errors.fullName ? 'field-error' : ''}
          />
          {errors.fullName && <span className="field-error-text">{errors.fullName}</span>}
        </label>

        <label className="field-group">
          <span>Email Address</span>
          <input
            type="email"
            value={contactInfo.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="Enter email address"
            className={errors.email ? 'field-error' : ''}
          />
          {errors.email && <span className="field-error-text">{errors.email}</span>}
        </label>

        <label className="field-group">
          <span>Phone Number</span>
          <input
            type="tel"
            value={contactInfo.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="Enter phone number"
            className={errors.phone ? 'field-error' : ''}
          />
          {errors.phone && <span className="field-error-text">{errors.phone}</span>}
        </label>

        <label className="field-group full-width">
          <span>Additional Note (Optional)</span>
          <textarea
            value={contactInfo.note}
            onChange={(e) => onChange('note', e.target.value)}
            placeholder="Additional note (optional)"
            rows={4}
          />
        </label>
      </div>

      <div className="payment-section">
        <h3>Payment Method</h3>
        <PaystackPaymentCard />
      </div>

      <button
        type="button"
        className="primary-button full-width"
        onClick={onPay}
        disabled={submitLoading}
      >
        {submitLoading ? 'Processing…' : 'Proceed to Pay'}
      </button>

      <p className="security-text">🔒 Your payment is securely processed via Paystack</p>
    </div>
  );
}
