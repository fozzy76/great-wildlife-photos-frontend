import React from 'react';
import { Helmet } from 'react-helmet';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>{`Terms of Service | Lynn Starnes Photography`}</title>
        <meta name="description" content="Terms of Service and conditions for purchasing fine art prints." />
      </Helmet>
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
          Terms of Service
        </h1>
        <p className="text-sm font-medium text-muted-foreground mb-10">
          Last updated: June 2026
        </p>
        
        <div className="space-y-10 text-base leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
            <p>
              Welcome to our website. By accessing or using our services and purchasing our fine art prints, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you are prohibited from using this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">About Great Wildlife Photos</h2>
            <p>
              Our platform provides exclusive access to premium, award-winning wildlife photography. All prints, whether on canvas, metal, acrylic, or fine art paper, are produced using the highest quality archival materials designed to last generations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Orders & Payment</h2>
            <p>
              All orders are subject to acceptance and availability. Prices are subject to change without notice. We reserve the right to refuse or cancel any order for any reason, including limitations on quantities available for purchase, inaccuracies in product or pricing information, or suspected fraud. Secure payment processing is handled via our authorized payment partners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Production & Shipping</h2>
            <p>
              Because each piece is custom-made to order, production times may vary. We strive to process and ship all orders promptly. Shipping costs and delivery estimates are provided at checkout. We are not responsible for delays caused by customs, import duties, or shipping carrier disruptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">No Returns Policy</h2>
            <p>
              Due to the custom, made-to-order nature of our fine art prints, we do not accept returns or exchanges for buyer's remorse or if you change your mind. All sales are final once the production process has begun.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Damaged Prints</h2>
            <p>
              If your print arrives damaged or defective due to a manufacturing error or shipping mishandling, please contact us within 48 hours of delivery. We will require photographic evidence of the damage to the print and the packaging to process a replacement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Copyright & Intellectual Property</h2>
            <p>
              All imagery, text, graphics, and content on this website are the exclusive intellectual property of the photographer and are protected by international copyright laws. Purchasing a print does not transfer any copyright or reproduction rights to the buyer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Licensing</h2>
            <p>
              Any commercial use, reproduction, modification, or distribution of our images without an explicit, written licensing agreement is strictly prohibited. For commercial licensing inquiries, please reach out via our Contact page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Disclaimer of Warranties</h2>
            <p>
              Our website and the materials provided are on an "as is" and "as available" basis. We make no warranties, expressed or implied, and hereby disclaim all other warranties including, without limitation, implied warranties or conditions of merchantability or fitness for a particular purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
            <p>
              In no event shall we or our suppliers be liable for any consequential damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website, even if we have been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of our operating jurisdiction, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to These Terms</h2>
            <p>
              We reserve the right to revise these Terms of Service at any time without notice. By using this website, you are agreeing to be bound by the then-current version of these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us via our website's Contact page or email us directly at lynn@greatwildlifephotos.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}