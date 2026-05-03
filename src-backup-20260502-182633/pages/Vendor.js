import SEO from '../components/SEO';

export default function Vendor() {
  return (
    <div className="page vendor-page fade-in">
      <SEO
        title="Vendor – ReekTickets | Sell Tickets Online in Ghana"
        description="Join ReekTickets as a vendor to sell event tickets across Ghana. Grow your business with secure ticketing and fast payments."
        keywords="vendor Ghana, tickets vendor Ghana, sell tickets online Ghana, event vendor Accra"
        ogTitle="Vendor – ReekTickets | Sell Tickets Online in Ghana"
        ogDescription="Join ReekTickets as a vendor to sell event tickets across Ghana. Grow your business with secure ticketing and fast payments."
        ogImage="/public/banner.jpg"
        canonical="https://reektickets.com/vendor"
      />
      <div className="page-head glass">
        <h1>Vendor</h1>
        <p>Sell tickets for your events and reach more attendees across Ghana.</p>
      </div>
      <section className="page-content">
        <p>ReekTickets supports vendors with event listings, ticket management, and secure checkout for customers across Accra and beyond.</p>
      </section>
    </div>
  );
}
