import './Terms.css';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1>Terms of Use</h1>
        <p className="last-updated">Last updated: April 2026</p>

        <div className="terms-content">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using ReekTickets ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
          </section>

          <section>
            <h2>2. Use License</h2>
            <p>Permission is granted to temporarily use ReekTickets for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse compile, disassemble, or hack any code</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              <li>Conduct any systematic or automated data collection activities without permission</li>
            </ul>
          </section>

          <section>
            <h2>3. Disclaimer</h2>
            <p>The materials on ReekTickets are provided on an 'as is' basis. ReekTickets makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>

          <section>
            <h2>4. Limitations</h2>
            <p>In no event shall ReekTickets or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ReekTickets, even if ReekTickets or a representative has been notified orally or in writing of the possibility of such damage.</p>
          </section>

          <section>
            <h2>5. Accuracy of Materials</h2>
            <p>The materials appearing on ReekTickets could include technical, typographical, or photographic errors. ReekTickets does not warrant that any of the materials on its website are accurate, complete, or current. ReekTickets may make changes to the materials contained on its website at any time without notice.</p>
          </section>

          <section>
            <h2>6. Links</h2>
            <p>ReekTickets has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by ReekTickets of the site. Use of any such linked website is at the user's own risk.</p>
          </section>

          <section>
            <h2>7. Modifications</h2>
            <p>ReekTickets may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.</p>
          </section>

          <section>
            <h2>8. User Accounts and Registration</h2>
            <p>When you create an account on ReekTickets, you agree to:</p>
            <ul>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain confidentiality of your password and account access</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2>9. Organizer Responsibilities</h2>
            <p>Event organizers using ReekTickets agree to:</p>
            <ul>
              <li>Provide accurate event information, including date, time, location, and venue details</li>
              <li>Ensure compliance with all applicable laws and regulations</li>
              <li>Manage ticket sales responsibly and transparently</li>
              <li>Honor refund policies as stated in their event listings</li>
              <li>Not engage in fraudulent activities or misrepresentation</li>
              <li>Maintain appropriate insurance and permits as required by law</li>
            </ul>
          </section>

          <section>
            <h2>10. Attendee Responsibilities</h2>
            <p>Ticket purchasers and event attendees agree to:</p>
            <ul>
              <li>Use tickets only for personal use and not for unauthorized resale</li>
              <li>Comply with all event venue rules and regulations</li>
              <li>Not engage in illegal activities or create disturbances</li>
              <li>Accept venue-specific terms regarding entry, conduct, and safety</li>
            </ul>
          </section>

          <section>
            <h2>11. Payment and Fees</h2>
            <p>All payments on ReekTickets are processed securely through Paystack. By making a purchase, you authorize ReekTickets to charge your payment method for:</p>
            <ul>
              <li>The ticket price as displayed</li>
              <li>Applicable service fees (5-10% depending on event tier)</li>
              <li>Transaction fees (2.5% for Ghana Cedis transactions)</li>
            </ul>
            <p>Refunds are subject to each event organizer's specific refund policy. ReekTickets will not process refunds for attendee decisions to not attend.</p>
          </section>

          <section>
            <h2>12. Prohibited Activities</h2>
            <p>Users agree not to:</p>
            <ul>
              <li>Create multiple accounts for fraudulent purposes</li>
              <li>Engage in price scalping or ticket fraud</li>
              <li>Harass or threaten other users</li>
              <li>Submit false reviews or ratings</li>
              <li>Attempt to gain unauthorized access to ReekTickets systems</li>
              <li>Collect user data without permission</li>
              <li>Engage in any illegal activity</li>
            </ul>
          </section>

          <section>
            <h2>13. Intellectual Property Rights</h2>
            <p>The content, organization, graphics, design, compilation, magnetic translation, digital conversion, and other matters related to ReekTickets are protected under applicable copyrights, trademarks, and other proprietary rights. All rights reserved.</p>
          </section>

          <section>
            <h2>14. Termination of Access</h2>
            <p>ReekTickets may terminate or suspend your account and access to the service immediately, without prior notice or liability, if you breach any of these Terms or for any reason whatsoever.</p>
          </section>

          <section>
            <h2>15. Indemnification</h2>
            <p>You agree to indemnify and hold harmless ReekTickets, its officers, directors, employees, and agents from any claim, demand, loss, liability, or expense arising out of or related to your use of ReekTickets or violation of these Terms.</p>
          </section>

          <section>
            <h2>16. Governing Law and Jurisdiction</h2>
            <p>These Terms shall be interpreted and governed by the laws of Ghana. All disputes shall be subject to the exclusive jurisdiction of the courts located in Accra, Ghana.</p>
          </section>

          <section>
            <h2>17. Severability</h2>
            <p>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>
          </section>

          <section>
            <h2>18. Entire Agreement</h2>
            <p>These Terms, together with our <Link to="/privacy-policy">Privacy Policy</Link> and <Link to="/ticket-agreement">Ticket Agreement</Link>, constitute the entire agreement between you and ReekTickets.</p>
          </section>

          <section>
            <h2>19. Contact Information</h2>
            <p>If you have any questions about these Terms of Use, please contact us at:</p>
            <ul>
              <li>Email: <a href="mailto:support@reektickets.com">support@reektickets.com</a></li>
              <li>Phone: <a href="tel:+233273476701">+233 27 347 6701</a></li>
              <li>Address: Accra, Ghana</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}