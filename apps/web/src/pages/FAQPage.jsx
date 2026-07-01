import React, { useRef } from 'react';

const faqSections = [
  {
    title: "Print Quality & Materials",
    items: [
      {
        question: "What materials are available?",
        answer: "Lynn offers three premium print substrates: Acrylic (vivid color, glass-like depth, modern look), Metal (high contrast, dramatic finish, ideal for bold wildlife images), and Canvas (warm, classic gallery feel). All materials are museum-quality and produced by MerchOne."
      },
      {
        question: "Are the prints archival quality?",
        answer: "Yes. All prints are produced using archival-grade inks and materials designed to last decades without fading when properly displayed. Avoid direct sunlight for best longevity."
      },
      {
        question: "Do prints come ready to hang?",
        answer: "Prints are sold unframed. Lynn has kept the product line focused on the print itself so customers can choose framing that suits their space and style."
      },
      {
        question: "What sizes are available?",
        answer: "Sizes vary by material and photo. Available sizes are shown on each individual product page. If you need a specific size not listed, contact Lynn directly."
      }
    ]
  },
  {
    title: "Ordering & Payment",
    items: [
      {
        question: "How do I place an order?",
        answer: "Browse the gallery, select your photo, choose your material and size, and add to cart. Checkout is handled securely through Stripe. We accept all major credit and debit cards."
      },
      {
        question: "Is my payment information secure?",
        answer: "Yes. All payments are processed by Stripe, a PCI-compliant payment processor. Your card information is never stored on our servers."
      },
      {
        question: "Can I change or cancel my order?",
        answer: "Orders are sent to our print fulfillment partner immediately after payment is confirmed. If you need to make a change, contact Lynn as soon as possible at lynn@greatwildlifephotos.com. We cannot guarantee changes once production has begun."
      },
      {
        question: "Do you offer discounts or promotions?",
        answer: "Subscribe to the newsletter to be the first to know about new photo releases and any special offers."
      }
    ]
  },
  {
    title: "Shipping",
    items: [
      {
        question: "Where do you ship?",
        answer: "We ship within the United States and Canada through MerchOne. For international orders, please contact Lynn directly at lynn@greatwildlifephotos.com - she works with a UK-based print partner for European and international fulfillment."
      },
      {
        question: "How long does shipping take?",
        answer: "Most US and Canada orders are produced and shipped within 5-7 business days. Shipping time varies by destination. You will receive a tracking number once your order ships."
      },
      {
        question: "How much does shipping cost?",
        answer: "Shipping is calculated at checkout based on your location and the size of your order. You will see the exact shipping cost before you confirm payment."
      },
      {
        question: "How are prints packaged?",
        answer: "Every print is carefully packaged to arrive in perfect condition. Large prints are crated or rolled depending on material. If your print arrives damaged, contact Lynn immediately with a photo of the damage - we will arrange a replacement."
      }
    ]
  },
  {
    title: "Returns & Damage",
    items: [
      {
        question: "Do you accept returns?",
        answer: "Because each print is produced on demand specifically for your order, we do not accept returns. Please review your size and material selection carefully before placing your order."
      },
      {
        question: "What if my print arrives damaged?",
        answer: "If your print arrives damaged, contact Lynn at lynn@greatwildlifephotos.com within 7 days of delivery. Please include a clear photo of the damage. We will arrange a replacement print at no charge - we stand behind every order."
      },
      {
        question: "What if I ordered the wrong size?",
        answer: "Unfortunately we cannot exchange prints once they are produced. If you are unsure about sizing, contact Lynn before placing your order and she will help you choose the right size for your space."
      }
    ]
  },
  {
    title: "Copyright & Photography",
    items: [
      {
        question: "Are the photographs copyrighted?",
        answer: "Yes. All photographs are © Lynn Starnes. All rights reserved. Every image is trademarked and protected under US copyright law. Unauthorized reproduction, download, distribution, or commercial use of any image is strictly prohibited."
      },
      {
        question: "Can I use a photo for personal or commercial use?",
        answer: "Purchasing a print gives you the right to display that print in your home or business. It does not grant any digital rights, reproduction rights, or licensing rights. For licensing inquiries, contact Lynn directly."
      },
      {
        question: "Are Lynn's photos available for editorial or press use?",
        answer: "For editorial, press, or licensing inquiries, contact Lynn at lynn@greatwildlifephotos.com. She considers each request individually."
      },
      {
        question: "Has Lynn's work been published or recognized?",
        answer: "Yes. Lynn's polar bear images were named Top 25 in Nature's Best Photography, an international competition judged in partnership with the Smithsonian Institution, in 2018. Her work has been captured across extreme conditions throughout North America over three decades."
      }
    ]
  }
];

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
  );
};

export default FAQPage;