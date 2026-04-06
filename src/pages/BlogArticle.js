import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import blogPosts from '../data/blogPosts';

export default function BlogArticle() {
  const { slug } = useParams();
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    return (
      <div className="page blog-article-page fade-in">
        <h1>Article not found</h1>
        <p>The requested blog post does not exist. Try another article.</p>
        <Link to="/blog" className="btn btn-secondary">Back to Blog</Link>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: [window.location.origin + post.image],
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: 'ReekTickets',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ReekTickets',
      logo: {
        '@type': 'ImageObject',
        url: window.location.origin + '/logo512.png',
      },
    },
    description: post.excerpt,
  };

  return (
    <div className="page blog-article-page fade-in">
      <SEO
        title={`${post.title} | ReekTickets Blog`}
        description={post.excerpt}
        ogTitle={post.title}
        ogDescription={post.excerpt}
        ogImage={post.image}
        jsonLd={jsonLd}
      />
      <nav aria-label="breadcrumb" className="breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to="/blog">Blog</Link>
        <span>›</span>
        <span>{post.title}</span>
      </nav>
      <article className="blog-article">
        <img src={post.image} alt={post.title} loading="lazy" className="blog-hero" />
        <h1>{post.title}</h1>
        <p className="blog-date">Published on {post.date}</p>
        {post.content.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        <Link to="/blog" className="btn btn-secondary">Back to Blog</Link>
      </article>
    </div>
  );
}
