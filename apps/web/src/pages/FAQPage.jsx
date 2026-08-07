import React, { useRef } from 'react';
import SEO from '@/components/SEO.jsx';
import { DEFAULT_SEO_IMAGE, baseGraph, breadcrumbSchema, faqSchema, webPageSchema } from '@/lib/seo.js';
import { STATIC_ROUTES } from '@/lib/routeMeta.js';
import { faqSections } from '@/data/faqs.js';


const FAQItem = ({ question, answer }) => {
  const answerRef = useRef(null);
  const iconRef = useRef(null);

  const handleClick = () => {
    const el = answerRef.current;
    const icon = iconRef.current;
    if (!el || !icon) return;
    const isOpen = el.style.display === 'block';
    el.style.display = isOpen ? 'none' : 'block';
    icon.textContent = isOpen ? '+' : '−';
  };

  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={handleClick}
        className="w-full text-left py-5 flex justify-between items-center text-lg font-medium hover:text-primary transition-colors"
      >
        <span>{question}</span>
        <span ref={iconRef} className="ml-4 text-xl shrink-0">+</span>
      </button>
      <div
        ref={answerRef}
        style={{ display: 'none' }}
        className="pb-5 text-muted-foreground text-base leading-relaxed"
      >
        {answer}
      </div>
    </div>
  );
};

const FAQPage = () => {
  return (
    <>
      <SEO
        {...STATIC_ROUTES['/faq']}
        schema={[
          ...baseGraph(),
          webPageSchema({
            path: '/faq',
            name: 'Wildlife Print FAQ',
            description: 'Answers about Great Wildlife Photos print materials, ordering, shipping, returns, and copyright.',
            type: 'FAQPage',
            image: DEFAULT_SEO_IMAGE
          }),
          faqSchema(faqSections),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'FAQ', path: '/faq' }
          ])
        ]}
      />

      <main className="min-h-screen max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-center">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-muted-foreground text-center mb-12">
          Find answers to common questions about our prints, shipping, and policies.
        </p>

        <div className="space-y-12">
          {faqSections.map((section, sectionIndex) => (
            <section
              key={sectionIndex}
              className="bg-card border border-border rounded-2xl p-6 md:p-10 shadow-sm"
            >
              <h2 className="text-2xl font-bold mb-6">{section.title}</h2>
              <div className="w-full">
                {section.items.map((faq, index) => (
                  <FAQItem
                    key={`${sectionIndex}-${index}`}
                    question={faq.question}
                    answer={faq.answer}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
};

export default FAQPage;
