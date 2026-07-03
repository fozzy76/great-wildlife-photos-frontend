import React from 'react';
import SEO from '@/components/SEO.jsx';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Privacy Policy | Great Wildlife Photos"
        description="Privacy policy for Great Wildlife Photos and Lynn Starnes wildlife photography print orders."
        path="/privacy"
        robots="noindex,follow"
      />
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm font-medium text-muted-foreground mb-10">
          Last updated: June 2026
        </p>
        
        <div className="space-y-10 text-base leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p>
              Welcome to Lynn Starnes Photography. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website, purchase our fine art prints, or interact with us, and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            <p className="mb-4">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
              <li><strong>Financial Data:</strong> includes payment card details (processed securely via our payment providers; we do not store full card numbers).</li>
              <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., processing and delivering your order).</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Information Sharing</h2>
            <p>
              We may share your personal data with trusted third parties, including our printing and fulfillment partners (such as MerchOne), payment processors (such as Stripe), and IT service providers. We require all third parties to respect the security of your personal data and to treat it in accordance with the law. We do not allow our third-party service providers to use your personal data for their own purposes and only permit them to process your personal data for specified purposes and in accordance with our instructions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Legal Rights</h2>
            <p className="mb-4">Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request access to your personal data.</li>
              <li>Request correction of your personal data.</li>
              <li>Request erasure of your personal data.</li>
              <li>Object to processing of your personal data.</li>
              <li>Request restriction of processing your personal data.</li>
              <li>Request transfer of your personal data.</li>
              <li>Right to withdraw consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us via our Contact page or email us directly at lynn@greatwildlifephotos.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
