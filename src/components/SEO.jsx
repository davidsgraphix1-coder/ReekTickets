import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const createOrUpdateMeta = (attrName, key, content) => {
  if (!content) return;
  let element = document.head.querySelector(`meta[${attrName}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const createOrUpdateLink = (rel, href) => {
  if (!href) return;
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

const updateJsonLdScript = (jsonLd) => {
  if (!jsonLd) return;
  let script = document.head.querySelector('script[type="application/ld+json"][id="structured-data"]');
  if (!script) {
    script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('id', 'structured-data');
    document.head.appendChild(script);
  }
  script.innerHTML = JSON.stringify(jsonLd);
};

const removeJsonLdScript = () => {
  const script = document.head.querySelector('script[type="application/ld+json"][id="structured-data"]');
  if (script) document.head.removeChild(script);
};

export default function SEO({
  title,
  description,
  keywords,
  author,
  ogTitle,
  ogDescription,
  ogImage,
  canonical,
  jsonLd,
}) {
  const location = useLocation();

  useEffect(() => {
    const origin = window.location.origin;
    const pageTitle = title || 'ReekTickets – Ghana’s Top #4 Ticketing Platform | Buy Event Tickets Online';
    const pageDescription = description || 'Buy tickets for concerts, parties, and events in Ghana. ReekTickets is a fast, secure, and reliable ticketing platform for event organizers, vendors, and attendees.';
    const pageKeywords = keywords || 'tickets Ghana, buy event tickets Ghana, Accra events, Ghana concerts, online ticketing Ghana, event management Ghana, sell tickets online Ghana, ReekTickets';
    const pageAuthor = author || 'ReekTickets';
    const pageUrl = canonical || `${origin}${location.pathname}`;
    const imageUrl = ogImage || `${origin}/public/banner.jpg`;

    document.title = pageTitle;
    createOrUpdateMeta('name', 'description', pageDescription);
    createOrUpdateMeta('name', 'keywords', pageKeywords);
    createOrUpdateMeta('name', 'author', pageAuthor);
    createOrUpdateMeta('name', 'viewport', 'width=device-width, initial-scale=1.0');
    createOrUpdateMeta('name', 'robots', 'index, follow');
    createOrUpdateMeta('property', 'og:title', ogTitle || pageTitle);
    createOrUpdateMeta('property', 'og:description', ogDescription || pageDescription);
    createOrUpdateMeta('property', 'og:image', imageUrl);
    createOrUpdateMeta('property', 'og:url', pageUrl);
    createOrUpdateMeta('property', 'og:type', 'website');
    createOrUpdateMeta('name', 'twitter:card', 'summary_large_image');
    createOrUpdateMeta('name', 'twitter:title', ogTitle || pageTitle);
    createOrUpdateMeta('name', 'twitter:description', ogDescription || pageDescription);
    createOrUpdateMeta('name', 'twitter:image', imageUrl);
    createOrUpdateLink('canonical', pageUrl);

    if (jsonLd) {
      updateJsonLdScript(jsonLd);
    } else {
      removeJsonLdScript();
    }

    return () => {
      if (jsonLd) removeJsonLdScript();
    };
  }, [title, description, keywords, author, ogTitle, ogDescription, ogImage, canonical, jsonLd, location.pathname]);

  return null;
}
