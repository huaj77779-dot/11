type SeoServicePageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  summary: string;
  audience: string[];
  capabilities: { title: string; text: string }[];
  process: { title: string; text: string }[];
  faqs: { question: string; answer: string }[];
};

export function SeoServicePage({
  eyebrow,
  title,
  intro,
  summary,
  audience,
  capabilities,
  process,
  faqs,
}: SeoServicePageProps) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <main className="seo-page" lang="en">
      <header className="seo-nav">
        <a className="seo-brand" href="/" aria-label="Atelier OS home">
          <i>A</i><span><b>ATELIER OS</b><small>MADE-TO-MEASURE SUPPLY</small></span>
        </a>
        <nav aria-label="Main navigation">
          <a href="/private-label-suits">Private label suits</a>
          <a href="/made-to-measure-suits">Made-to-measure</a>
          <a href="/custom-tailoring-supplier">For tailoring shops</a>
          <a className="seo-nav-cta" href="/#contact">Discuss cooperation</a>
        </nav>
      </header>

      <section className="seo-hero">
        <div>
          <p className="seo-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="seo-lead">{intro}</p>
          <div className="seo-actions">
            <a href="/#contact">Request supplier information</a>
            <a className="secondary" href="/customize">Open ordering portal</a>
          </div>
        </div>
        <figure>
          <img src="/ai-previews/jacket.png" alt="Made-to-measure navy suit produced for a tailoring business" />
          <figcaption>Private-label production · Italian fabrics · Digital ordering</figcaption>
        </figure>
      </section>

      <section className="seo-section seo-summary">
        <div>
          <p className="seo-kicker">B2B MADE-TO-MEASURE</p>
          <h2>A production partner behind your store</h2>
        </div>
        <div>
          <p>{summary}</p>
          <ul>{audience.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className="seo-section">
        <p className="seo-kicker">CAPABILITIES</p>
        <h2>What your tailoring business can order</h2>
        <div className="seo-card-grid">
          {capabilities.map((item, index) => (
            <article key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="seo-section seo-process">
        <p className="seo-kicker">ORDERING WORKFLOW</p>
        <h2>From client measurements to a production-ready order</h2>
        <ol>
          {process.map((item) => (
            <li key={item.title}><h3>{item.title}</h3><p>{item.text}</p></li>
          ))}
        </ol>
      </section>

      <section className="seo-section seo-faq">
        <p className="seo-kicker">BUYER QUESTIONS</p>
        <h2>Frequently asked questions</h2>
        <div>
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="seo-final-cta">
        <div><p className="seo-kicker">START WITH ONE CUSTOMER ORDER</p><h2>Build a reliable made-to-measure supply workflow for your store.</h2></div>
        <a href="/#contact">Contact Atelier OS</a>
      </section>

      <footer className="seo-footer">
        <b>ATELIER OS</b>
        <span>Private-label made-to-measure supply for professional tailoring businesses.</span>
        <nav><a href="/company">Company</a><a href="/quality">Quality</a><a href="/news">Updates</a></nav>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </main>
  );
}
