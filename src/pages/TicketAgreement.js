import './Terms.css';
import { Link } from 'react-router-dom';

export default function TicketAgreement() {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1>Ticket Purchase Agreement</h1>
        <p className="last-updated">Last updated: April 2026</p>

        <div className="terms-content">
          <section>
            <h2>1. Ticket Purchase Terms</h2>
            <p>By purchasing a ticket through ReekTickets, you agree to the terms and conditions outlined in this Ticket Purchase Agreement. This agreement is a binding contract between you (the "Buyer") and the event organizer (the "Organizer") for the specific event.</p>
          </section>

          <section>
            <h2>2. Ticket Validity and Use</h2>
            <ul>
              <li>Tickets are valid only for the date, time, and venue specified on the ticket</li>
              <li>Tickets are non-transferable unless explicitly stated by the Organizer</li>
              <li>Physical or digital ticket must be presented for entry</li>
              <li>One ticket admits one person to the event</li>
              <li>Tickets cannot be duplicated, reproduced, or forged</li>
              <li>Resale of tickets without authorization is prohibited</li>
            </ul>
          </section>

          <section>
            <h2>3. Ticket Pricing and Fees</h2>
            <p>The ticket price displayed includes:</p>
            <ul>
              <li>The base event price set by the Organizer</li>
              <li>ReekTickets service fee (3.8%)</li>
              <li>Transaction fee (2.5% for Ghana Cedis transactions)</li>
            </ul>
            <p>Prices are subject to change. You will see the final price including all fees before confirming purchase.</p>
          </section>

          <section>
            <h2>4. Payment</h2>
            <ul>
              <li>Payment must be made in full at the time of purchase</li>
              <li>Payments are processed securely through Paystack</li>
              <li>Only valid payment methods (card, mobile money) are accepted</li>
              <li>A receipt email will be sent upon successful payment</li>
              <li>Payment disputes must be raised within 30 days of purchase</li>
            </ul>
          </section>

          <section>
            <h2>5. Refunds and Cancellations</h2>
            <h3>5.1 Refund Policy</h3>
            <p>Each event organizer sets their own refund policy. Common policies include:</p>
            <ul>
              <li><strong>Full Refund:</strong> Available until a specified date before the event</li>
              <li><strong>Partial Refund:</strong> Available up to a certain point, minus fees</li>
              <li><strong>No Refund:</strong> Non-refundable tickets</li>
            </ul>
            <p>The applicable refund policy for each event is clearly displayed before purchase.</p>
            <h3>5.2 Refund Processing</h3>
            <ul>
              <li>Refunds are initiated by the event Organizer through ReekTickets</li>
              <li>Please allow 5-7 business days for refunds to appear in your account</li>
              <li>Service fees and transaction fees are typically non-refundable</li>
            </ul>
            <h3>5.3 Event Cancellation</h3>
            <ul>
              <li>If an event is cancelled, full refunds will be issued to all ticket holders</li>
              <li>ReekTickets will assist with refund processing and will contact all affected Buyers</li>
              <li>ReekTickets is not liable for consequential damages from cancellations</li>
            </ul>
            <h3>5.4 Non-Refundable Scenarios</h3>
            <p>Refunds will NOT be issued for:</p>
            <ul>
              <li>Buyer's personal decision not to attend</li>
              <li>Loss of the ticket (digital or physical)</li>
              <li>Change in event date/time due to force majeure (natural disasters, etc.)</li>
              <li>Buyer missing the event time</li>
            </ul>
          </section>

          <section>
            <h2>6. Entry and Venue Rules</h2>
            <ul>
              <li>Ticket holders must comply with all venue rules and regulations</li>
              <li>The Organizer reserves the right to refuse entry or remove attendees for disruptive behavior</li>
              <li>No refunds will be issued for removal due to non-compliance with venue rules</li>
              <li>Prohibited items (weapons, illegal substances, etc.) are not permitted</li>
            </ul>
          </section>

          <section>
            <h2>7. Ticket Transfer</h2>
            <ul>
              <li>Unless specified as transferable, tickets are non-transferable</li>
              <li>Transferable events will indicate transfer method at purchase</li>
              <li>Organizers may restrict transfers close to event date</li>
              <li>ReekTickets charges no additional fee for transfers</li>
            </ul>
          </section>

          <section>
            <h2>8. Lost or Damaged Tickets</h2>
            <ul>
              <li>Digital tickets can be retrieved through your ReekTickets account</li>
              <li>Lost physical tickets may be replaced if you can provide proof of purchase</li>
              <li>Replacement fees may apply at the Organizer's discretion</li>
              <li>Screenshots of digital tickets are typically accepted for entry</li>
            </ul>
          </section>

          <section>
            <h2>9. Communication</h2>
            <ul>
              <li>All event updates and communications will be sent to your registered email</li>
              <li>Check your spam/junk folder for important emails</li>
              <li>It is your responsibility to maintain current contact information</li>
              <li>SMS reminders may be sent for ticketed events</li>
            </ul>
          </section>

          <section>
            <h2>10. Liability and Disclaimers</h2>
            <ul>
              <li>ReekTickets is not responsible for event content, quality, or schedule changes</li>
              <li>ReekTickets is not liable for injuries, losses, or damages at venues</li>
              <li>Organizers are responsible for event safety and compliance with regulations</li>
              <li>Buyers assume all risk associated with event attendance</li>
            </ul>
          </section>

          <section>
            <h2>11. Fraud and Unauthorized Use</h2>
            <ul>
              <li>Any fraudulent activity will result in immediate account termination</li>
              <li>Unauthorized resale of tickets may result in legal action</li>
              <li>Blacklist entries may be created for fraudulent users</li>
              <li>Organizers may cancel fraudulently obtained tickets without refund</li>
            </ul>
          </section>

          <section>
            <h2>12. Digital Ticket Terms</h2>
            <ul>
              <li>Digital tickets are delivered via email immediately after purchase</li>
              <li>Screenshots of digital tickets are accepted as proof of entry</li>
              <li>Screen sharing or partial ticket views may not be accepted</li>
              <li>Your ticket code is personal and non-transferable (unless specified)</li>
              <li>Sharing ticket codes allows others to use your ticket</li>
            </ul>
          </section>

          <section>
            <h2>13. Physical Ticket Terms</h2>
            <ul>
              <li>Physical tickets are shipped to your address after purchase</li>
              <li>Shipping times vary based on location and delivery method</li>
              <li>ReekTickets is not liable for lost or damaged tickets in transit</li>
              <li>Request expedited shipping for events close to purchase date</li>
              <li>Damaged tickets may be replaced with proof of damage</li>
            </ul>
          </section>

          <section>
            <h2>14. COVID-19 and Health Protocols</h2>
            <ul>
              <li>Event organizers may implement health and safety protocols</li>
              <li>Compliance with such protocols is required for entry</li>
              <li>Masks and vaccinations may be required depending on venue policy</li>
              <li>Policy updates will be communicated via email</li>
            </ul>
          </section>

          <section>
            <h2>15. Dispute Resolution</h2>
            <ul>
              <li>For disputes, contact ReekTickets customer support within 30 days</li>
              <li>Provide ticket confirmation number and detailed description</li>
              <li>ReekTickets will mediate between Buyer and Organizer</li>
              <li>Unresolved disputes may be escalated to management</li>
            </ul>
          </section>

          <section>
            <h2>16. Modifications to Terms</h2>
            <p>ReekTickets may modify these terms at any time. Updates will be posted here with a new "Last Updated" date. Your continued use of the service indicates acceptance of modified terms.</p>
          </section>

          <section>
            <h2>17. Governing Law</h2>
            <p>This Ticket Purchase Agreement shall be governed by the laws of Ghana. All disputes shall be subject to the exclusive jurisdiction of courts in Accra, Ghana.</p>
          </section>

          <section>
            <h2>18. Customer Support</h2>
            <p>For questions about ticket purchases or this agreement, contact us:</p>
            <ul>
              <li>Email: <a href="mailto:support@reektickets.com">support@reektickets.com</a></li>
              <li>Phone: <a href="tel:+233273476701">+233 27 347 6701</a></li>
              <li>WhatsApp: <a href="https://wa.me/233273476701" target="_blank" rel="noopener noreferrer">+233 27 347 6701</a></li>
            </ul>
          </section>

          <section>
            <h2>Related Documents</h2>
            <p>Please also review our <Link to="/terms">Terms of Use</Link> and <Link to="/privacy-policy">Privacy Policy</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
