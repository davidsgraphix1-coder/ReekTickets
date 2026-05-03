import SEO from '../components/SEO';

export default function Admin() {
  return (
    <div className="page admin-page fade-in">
      <SEO
        title="Admin – ReekTickets | Manage Your Ticketing Platform"
        description="Access the ReekTickets admin panel for event oversight, reporting, and platform management in Ghana."
        keywords="admin Ghana, ticketing admin Ghana, event management admin, ReekTickets admin"
        ogTitle="Admin – ReekTickets | Manage Your Ticketing Platform"
        ogDescription="Access the ReekTickets admin panel for event oversight, reporting, and platform management in Ghana."
        ogImage="/public/banner.jpg"
        canonical="https://reektickets.com/admin"
      />
      <div className="page-head glass">
        <h1>Admin</h1>
        <p>Manage orders, events, and vendor activity on ReekTickets.</p>
      </div>
      <section className="page-content">
        <p>This page is your control center for ticketing operations and analytics across Ghana’s top events.</p>
      </section>
    </div>
  );
}
