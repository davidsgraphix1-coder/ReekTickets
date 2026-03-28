export default function About() {
  return (
    <div className="page about-page fade-in">
      <div className="page-head glass">
        <h2>About ReekTickets</h2>
        <p>Your premier destination for event ticketing in Ghana</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h3>Our Mission</h3>
          <p>
            ReekTickets is dedicated to revolutionizing the event ticketing experience in Ghana.
            We connect event organizers with attendees, making it easier than ever to discover,
            create, and attend amazing events across the country.
          </p>
        </section>

        <section className="about-section">
          <h3>What We Do</h3>
          <div className="features-grid">
            <div className="feature-card">
              <h4>🎫 Event Discovery</h4>
              <p>Find and explore exciting events happening in Ghana, from concerts to conferences.</p>
            </div>
            <div className="feature-card">
              <h4>🎭 Event Creation</h4>
              <p>Organizers can easily create and manage their events with our powerful tools.</p>
            </div>
            <div className="feature-card">
              <h4>💰 Secure Payments</h4>
              <p>Safe and secure payment processing with Paystack integration.</p>
            </div>
            <div className="feature-card">
              <h4>📱 Mobile-First</h4>
              <p>Optimized for mobile devices to ensure you can book tickets anywhere, anytime.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h3>Our Story</h3>
          <p>
            Founded in 2024, ReekTickets emerged from a simple idea: make event ticketing in Ghana
            as seamless as possible. We noticed that many event organizers struggled with outdated
            ticketing systems, and attendees had difficulty finding and purchasing tickets for
            local events.
          </p>
          <p>
            Today, we're proud to serve thousands of users across Ghana, from Accra to Tamale,
            helping bring communities together through memorable events.
          </p>
        </section>

        <section className="about-section">
          <h3>Why Choose ReekTickets?</h3>
          <ul className="benefits-list">
            <li>✅ Ghana-focused platform with local payment methods</li>
            <li>✅ Support for multiple user roles (Attendees, Organizers, Vendors, Sales Agents)</li>
            <li>✅ QR code tickets for easy event entry</li>
            <li>✅ Real-time event updates and notifications</li>
            <li>✅ Secure payment processing with Paystack</li>
            <li>✅ Mobile-optimized experience</li>
            <li>✅ 24/7 customer support</li>
          </ul>
        </section>

        <section className="about-section">
          <h3>Contact Us</h3>
          <p>
            Have questions or need support? Reach out to us at:
          </p>
          <div className="contact-info">
            <p>📧 Email: support@reektickets.com</p>
            <p>📱 Phone: +233 XX XXX XXXX</p>
            <p>📍 Address: Accra, Ghana</p>
          </div>
        </section>
      </div>
    </div>
  );
}