import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

export default function CreateEvent() {
  return (
    <div className="page create-event-page fade-in">
      <SEO
        title="Create Event – ReekTickets | Host Events in Ghana"
        description="Host your event on ReekTickets and sell tickets across Ghana. Create shows, concerts, and workshops with secure event management."
        keywords="create event Ghana, host event Ghana, event management Ghana, sell tickets online Ghana"
        ogTitle="Create Event on ReekTickets"
        ogDescription="Host events, sell tickets, and reach attendees across Accra and beyond. Start your event page today."
        ogImage="/public/banner.jpg"
      />
      <div className="page-head glass">
        <h1>Create Event</h1>
        <p>Launch your event and sell tickets across Ghana.</p>
      </div>
      <section className="page-content">
        <p>ReekTickets is the easiest way for organizers to create event listings, manage ticket sales, and reach audiences in Accra and across Ghana.</p>
        <p>Use your dashboard to add event details, set ticket prices, and publish with a secure checkout experience.</p>
        <Link to="/dashboard" className="btn btn-primary">Go to Organizer Dashboard</Link>
      </section>
    </div>
  );
}
