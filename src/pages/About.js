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
            Our goal is to build a trusted, easy-to-use platform that helps organizers launch events,
            empowers vendors to sell more, and gives attendees a seamless way to discover and join
            unforgettable experiences.
          </p>
          <p>
            We focus on local communities and on making ticketing faster, more secure, and more
            reliable for every user. From concerts to conferences, we want every event to feel
            effortless from start to finish.
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
            Founded in 2024, ReekTickets began with a simple vision: make event ticketing in Ghana
            seamless, affordable, and modern. We saw organizers struggling with manual workflows and
            attendees frustrated by unclear event information.
          </p>
          <p>
            Since then, our platform has grown to support a wide range of events, from music
            festivals and workshops to corporate conferences and community meetups. We serve users
            across Ghana, helping them create, market, and attend events with confidence.
          </p>
          <p>
            Our journey continues as we listen to customer feedback, improve our product, and bring
            new features that make event planning and ticketing easier for everyone.
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
            <p>📧 Email: reektickets@gmail.com</p>
            <p>📱 Phone: +233 27 347 6701</p>
            <p>📍 Address: Koforidua, Ghana</p>
          </div>
        </section>
      </div>
    </div>
  );
}