import SEO from '../components/SEO';

export default function SalesAgents() {
  return (
    <div className="page sales-agents-page fade-in">
      <SEO
        title="Sales Agents – ReekTickets | Earn by Selling Tickets"
        description="Join ReekTickets as a sales agent and earn commission by selling event tickets across Ghana. Start earning with every ticket booked."
        keywords="sales agents Ghana, ticket sales agent Ghana, earn commission Ghana, event ticket agent Accra"
        ogTitle="Sales Agents – ReekTickets"
        ogDescription="Become a ReekTickets sales agent and earn money by selling tickets for concerts, parties, and events in Ghana."
        ogImage="/reektickets-actual-logo.png"
        canonical="https://reektickets.com/agents"
      />
      <div className="page-head glass">
        <h1>Sales Agents</h1>
        <p>Earn by selling events tickets across Ghana with ReekTickets.</p>
      </div>
      <section className="page-content">
        <p>Partner with ReekTickets and become a certified sales agent. Earn commission for every ticket sold and access event listings instantly.</p>
      </section>
    </div>
  );
}
