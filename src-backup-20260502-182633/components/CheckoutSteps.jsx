export default function CheckoutSteps({ step }) {
  return (
    <div className="checkout-steps">
      <div className={`step-card ${step >= 1 ? 'active' : ''}`}>
        <div className="step-icon">{step > 1 ? '✓' : '1'}</div>
        <div className="step-copy">
          <span className="step-label">STEP 1</span>
          <strong>Select Tickets</strong>
        </div>
      </div>

      <div className="step-line" />

      <div className={`step-card ${step === 2 ? 'active' : ''}`}>
        <div className="step-icon">2</div>
        <div className="step-copy">
          <span className="step-label">STEP 2</span>
          <strong>Contact Info</strong>
        </div>
      </div>
    </div>
  );
}
