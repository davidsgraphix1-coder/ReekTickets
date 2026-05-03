import SEO from '../components/SEO';

export default function VendorRegister() {
  return (
    <div className="page vendor-register-page fade-in">
      <SEO
        title="Vendor Registration – ReekTickets | Sell Tickets in Ghana"
        description="Join ReekTickets as a vendor and sell event tickets across Ghana. Register today to grow your audience and manage ticket sales easily."
        keywords="vendor registration Ghana, sell tickets Ghana, ticket vendor Ghana, vendor signup Accra"
        ogTitle="Vendor Registration – ReekTickets"
        ogDescription="Register as a vendor on ReekTickets and start selling event tickets across Ghana with secure event management."
        ogImage="/reektickets-actual-logo.png"
        canonical="https://reektickets.com/vendor/register"
      />
      <div className="page-head glass">
        <h1>Vendor Registration</h1>
        <p>Become a ReekTickets vendor and start selling tickets across Ghana.</p>
      </div>
      <section className="page-content">
        <p>ReekTickets helps vendors promote events, sell tickets, and grow their audience in Accra and beyond.</p>
        <p>Fill your vendor application and connect with attendees using secure ticketing tools.</p>
      </section>
    </div>
  );
}
