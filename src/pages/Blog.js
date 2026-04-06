import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import blogPosts from '../data/blogPosts';

export default function Blog() {
  return (
    <div className="page blog-page fade-in">
      <SEO
        title="ReekTickets Blog – Tickets, Events & Ghana Entertainment"
        description="Read the latest event guides, ticketing tips, and Ghana entertainment news on the ReekTickets blog."
        keywords="event tickets Ghana, events in Accra, ticket booking Ghana, concert tickets Ghana, best ticket platform Ghana"
        ogTitle="ReekTickets Blog – Top Events in Ghana"
        ogDescription="Stay up to date with the best concerts, parties, and event news in Ghana."
        ogImage="/public/banner.jpg"
      />
      <div className="blog-header">
        <h1>ReekTickets Blog</h1>
        <p>News, guides and event recommendations for Ghana’s leading ticket platform.</p>
      </div>
      <div className="blog-grid">
        {blogPosts.map((post) => (
          <article key={post.slug} className="blog-card">
            <img src={post.image} alt={post.title} loading="lazy" />
            <div className="blog-content">
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              <Link to={`/blog/${post.slug}`} className="btn btn-secondary">Read Article</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
