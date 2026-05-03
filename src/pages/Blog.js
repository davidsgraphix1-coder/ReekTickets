import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import blogPosts from '../data/blogPosts';

export default function Blog() {
  const [featured, ...rest] = blogPosts;

  return (
    <div className="page blog-page fade-in">
      <SEO
        title="ReekTickets Blog – Tickets, Events & Ghana Entertainment"
        description="Read the latest event guides, ticketing tips, and Ghana entertainment news on the ReekTickets blog."
        keywords="event tickets Ghana, events in Accra, ticket booking Ghana, concert tickets Ghana, best ticket platform Ghana"
        ogTitle="ReekTickets Blog – Top Events in Ghana"
        ogDescription="Stay up to date with the best concerts, parties, and event news in Ghana."
        ogImage="/banner.jpg"
      />

      <header className="blog-hero">
        <span className="blog-eyebrow">REEKTICKETS BLOG</span>
        <h1>Stories from the heart of Ghana’s event scene</h1>
        <p>
          Concert recaps, organizer interviews, ticketing tips and behind-the-scenes
          photos from the events powering ReekTickets.
        </p>
      </header>

      {featured && (
        <Link to={`/blog/${featured.slug}`} className="blog-featured">
          <div className="blog-featured-img">
            <img src={featured.image} alt={featured.title} loading="lazy" />
          </div>
          <div className="blog-featured-body">
            <span className="blog-tag">Featured</span>
            <h2>{featured.title}</h2>
            <p>{featured.excerpt}</p>
            <span className="blog-read-more">Read article →</span>
          </div>
        </Link>
      )}

      <div className="blog-grid">
        {rest.map((post) => (
          <article key={post.slug} className="blog-card">
            <Link to={`/blog/${post.slug}`} className="blog-card-img">
              <img src={post.image} alt={post.title} loading="lazy" />
            </Link>
            <div className="blog-content">
              <time className="blog-date" dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </time>
              <h2>
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p>{post.excerpt}</p>
              <Link to={`/blog/${post.slug}`} className="blog-read-more">
                Read article →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
