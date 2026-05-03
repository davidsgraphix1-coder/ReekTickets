import './Terms.css';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: April 2026</p>

        <div className="terms-content">
          <section>
            <h2>1. Introduction</h2>
            <p>ReekTickets ("we", "us", "our", or "Service") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>
            <p>Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Service.</p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <p>We may collect personal information that you voluntarily provide, including:</p>
            <ul>
              <li>Name and email address</li>
              <li>Phone number</li>
              <li>Home address</li>
              <li>Account username and password</li>
              <li>Payment information (processed securely through Paystack)</li>
              <li>Event preferences and interests</li>
              <li>Communication history with us</li>
            </ul>
            <h3>2.2 Automatically Collected Information</h3>
            <p>When you access ReekTickets, we may automatically collect:</p>
            <ul>
              <li>Browser type and version</li>
              <li>IP address</li>
              <li>Device type and operating system</li>
              <li>Pages visited and time spent</li>
              <li>Referral source</li>
              <li>Cookies and tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use collected information for various purposes:</p>
            <ul>
              <li>To facilitate your ticket purchases and account management</li>
              <li>To process payments and send receipts</li>
              <li>To send event updates, reminders, and booking confirmations</li>
              <li>To provide customer support and respond to inquiries</li>
              <li>To send promotional emails and marketing communications (with your consent)</li>
              <li>To improve and optimize our service</li>
              <li>To detect and prevent fraudulent transactions</li>
              <li>To comply with legal obligations</li>
              <li>To analyze trends and user behavior</li>
            </ul>
          </section>

          <section>
            <h2>4. Sharing Your Information</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. However, we may share information with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Payment processors, email services, analytics providers, and hosting services</li>
              <li><strong>Event Organizers:</strong> Your name, email, and ticket information (only for events you've booked)</li>
              <li><strong>Legal Authorities:</strong> As required by law or court order</li>
              <li><strong>Business Partners:</strong> Only with your explicit consent</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Security</h2>
            <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
            <ul>
              <li>SSL encryption for data transmission</li>
              <li>Secure password storage</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
            </ul>
            <p>However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2>6. Cookies and Tracking Technologies</h2>
            <p>ReekTickets uses cookies to:</p>
            <ul>
              <li>Remember your preferences and login information</li>
              <li>Track site usage and analytics</li>
              <li>Personalize your experience</li>
              <li>Prevent fraudulent activity</li>
            </ul>
            <p>You can control cookie settings through your browser preferences. Disabling cookies may affect certain functionality of our Service.</p>
          </section>

          <section>
            <h2>7. Third-Party Links</h2>
            <p>ReekTickets may contain links to third-party websites. We are not responsible for their privacy practices or content. We encourage you to review their privacy policies before providing any personal information.</p>
          </section>

          <section>
            <h2>8. Your Rights and Choices</h2>
            <p>Depending on your location, you may have certain rights regarding your personal information:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data (subject to legal obligations)</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
            </ul>
          </section>

          <section>
            <h2>9. Marketing Communications</h2>
            <p>We may send you promotional emails about new events, special offers, and service updates. You can opt-out at any time by clicking the "unsubscribe" link in our emails or managing preferences in your account settings.</p>
          </section>

          <section>
            <h2>10. Children's Privacy</h2>
            <p>ReekTickets is not directed to children under 13 years old. We do not knowingly collect personal information from children. If we become aware of such collection, we will delete this information and terminate the minor's account.</p>
          </section>

          <section>
            <h2>11. Data Retention</h2>
            <p>We retain personal information for as long as necessary to:</p>
            <ul>
              <li>Provide our services</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes</li>
            </ul>
            <p>After this period, data is securely deleted or anonymized.</p>
          </section>

          <section>
            <h2>12. International Transfers</h2>
            <p>Your information may be transferred to, stored in, and processed in countries other than Ghana. By using ReekTickets, you consent to such transfers.</p>
          </section>

          <section>
            <h2>13. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Continued use of ReekTickets signifies your acceptance of updated terms.</p>
          </section>

          <section>
            <h2>14. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or our privacy practices, please contact us:</p>
            <ul>
              <li>Email: <a href="mailto:privacy@reektickets.com">privacy@reektickets.com</a></li>
              <li>Phone: <a href="tel:+233273476701">+233 27 347 6701</a></li>
              <li>Address: Accra, Ghana</li>
            </ul>
          </section>

          <section>
            <h2>Related Documents</h2>
            <p>Please also review our <Link to="/terms">Terms of Use</Link> and <Link to="/ticket-agreement">Ticket Agreement</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
