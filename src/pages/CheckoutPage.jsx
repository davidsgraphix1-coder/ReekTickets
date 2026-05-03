import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchEvent, initPaystack, validateCoupon } from '../services/api';
import CheckoutSteps from '../components/CheckoutSteps';
import TicketSelectionCard from '../components/TicketSelectionCard';
import OrderSummaryCard from '../components/OrderSummaryCard';
import ContactInfoStep from '../components/ContactInfoStep';
import CheckoutSummary from '../components/CheckoutSummary';
import './Checkout.css';

const formatCurrency = (value) => `₵ ${Number(value || 0).toFixed(2)}`;

export default function CheckoutPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [quantities, setQuantities] = useState({});
  const [discountCode, setDiscountCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [discountError, setDiscountError] = useState('');
  const [discountSuccess, setDiscountSuccess] = useState('');
  const [contactInfo, setContactInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    note: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [paymentError, setPaymentError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('reek_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setContactInfo((prev) => ({
          ...prev,
          fullName: parsed.fullName || parsed.full_name || prev.fullName,
          email: parsed.email || prev.email,
          phone: parsed.phone || prev.phone
        }));
      } catch (err) {
        // ignore malformed storage
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    const loadEvent = async () => {
      try {
        setLoading(true);
        const data = await fetchEvent(eventId);
        if (!active) return;
        setEvent(data);
        const initial = {};
        (data.ticketTypes || []).forEach((item, index) => {
          initial[index] = 0;
        });
        setQuantities(initial);
        setLoading(false);
      } catch (err) {
        if (!active) return;
        setError('Unable to load event.');
        setLoading(false);
      }
    };
    loadEvent();
    return () => { active = false; };
  }, [eventId]);

  const ticketItems = useMemo(() => Array.isArray(event?.ticketTypes) ? event.ticketTypes : [], [event]);

  const selectedItems = useMemo(() => ticketItems
    .map((ticket, index) => ({
      ticketType: ticket.type || ticket.name || 'General',
      price: Number(ticket.price || 0),
      quantity: Number(quantities[index] || 0),
    }))
    .filter((item) => item.quantity > 0),
  [ticketItems, quantities]);

  const subtotal = useMemo(() => selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [selectedItems]);
  const discountValue = useMemo(() => {
    if (!coupon || !coupon.discount) return 0;
    return Number(subtotal * (Number(coupon.discount) / 100));
  }, [coupon, subtotal]);
  const total = Math.max(0, subtotal - discountValue);

  const handleQuantityChange = (index, quantity) => {
    setQuantities((prev) => ({
      ...prev,
      [index]: Number(quantity)
    }));
    setDiscountError('');
    setDiscountSuccess('');
    setCoupon(null);
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Enter a discount code.');
      setDiscountSuccess('');
      return;
    }
    const res = await validateCoupon(discountCode.trim(), eventId);
    if (res.coupon) {
      setCoupon(res.coupon);
      setDiscountSuccess(`Code applied: ${res.coupon.discount}% off`);
      setDiscountError('');
    } else {
      setCoupon(null);
      setDiscountError(res.message || 'Coupon not found');
      setDiscountSuccess('');
    }
  };

  const handleContactChange = (field, value) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
    setPaymentError('');
  };

  const handleContinue = () => {
    if (selectedItems.length === 0) {
      setError('Please select at least one ticket to continue.');
      return;
    }
    setError('');
    setStep(2);
  };

  const hasSelectedTickets = selectedItems.length > 0;

  const handlePay = async () => {
    const required = ['fullName', 'email', 'phone'];
    const newErrors = {};
    required.forEach((field) => {
      if (!contactInfo[field]?.trim()) newErrors[field] = 'Required';
    });
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      setPaymentError('Complete all required fields before payment.');
      return;
    }
    if (!hasSelectedTickets) {
      setPaymentError('Need at least one ticket selected.');
      return;
    }

    setSubmitLoading(true);
    setPaymentError('');

    const payload = {
      eventId,
      email: contactInfo.email,
      fullName: contactInfo.fullName,
      phone: contactInfo.phone,
      note: contactInfo.note,
      amount: total,
      items: selectedItems,
    };

    const result = await initPaystack(payload);
    setSubmitLoading(false);

    if (result.authorization_url) {
      window.location.href = result.authorization_url;
      return;
    }
    setPaymentError(result.message || 'Could not start payment.');
  };

  if (loading) {
    return <div className="checkout-page"><div className="checkout-loading">Loading checkout…</div></div>;
  }

  if (error) {
    return <div className="checkout-page"><div className="checkout-error">{error}</div></div>;
  }

  if (!event) {
    return <div className="checkout-page"><div className="checkout-error">Event not found.</div></div>;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <header className="checkout-header">
          <div>
            <p className="checkout-title">Checkout</p>
          </div>
          <button type="button" className="close-button" onClick={() => window.history.back()}>
            ×
          </button>
        </header>

        <CheckoutSteps step={step} />

        <div className="checkout-main">
          <div className="checkout-column checkout-column-left">
            {step === 1 ? (
              <section className="section-block">
                <div className="section-title-row">
                  <span className="section-badge">1</span>
                  <div>
                    <h2>Choose Tickets</h2>
                  </div>
                </div>

                <TicketSelectionCard
                  tickets={ticketItems}
                  quantities={quantities}
                  onQuantityChange={handleQuantityChange}
                />
              </section>
            ) : (
              <section className="section-block">
                <div className="section-title-row">
                  <span className="section-badge">2</span>
                  <div>
                    <h2>Contact Information</h2>
                  </div>
                </div>

                <ContactInfoStep
                  contactInfo={contactInfo}
                  onChange={handleContactChange}
                  errors={formErrors}
                  onPay={handlePay}
                  submitLoading={submitLoading}
                />
              </section>
            )}
          </div>

          <aside className="checkout-column checkout-column-right">
            {step === 1 ? (
              <OrderSummaryCard
                eventName={event.title}
                selectedItems={selectedItems}
                subtotal={subtotal}
                discount={discountValue}
                total={total}
                discountCode={discountCode}
                onDiscountChange={setDiscountCode}
                onApplyDiscount={handleApplyDiscount}
                discountError={discountError}
                discountSuccess={discountSuccess}
                onContinue={handleContinue}
                continueDisabled={!hasSelectedTickets}
              />
            ) : (
              <CheckoutSummary
                eventName={event.title}
                selectedItems={selectedItems}
                subtotal={subtotal}
                discount={discountValue}
                total={total}
                coupon={coupon}
                contactInfo={contactInfo}
                paymentError={paymentError}
                onBack={() => setStep(1)}
              />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
