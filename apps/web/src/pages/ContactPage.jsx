import React from 'react';
import { Helmet } from 'react-helmet';
import { Mail } from 'lucide-react';
import ContactForm from '@/components/ContactForm.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';

const ContactPage = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us - Great Wildlife Photos</title>
        <meta name="description" content="Get in touch with Great Wildlife Photos. We're here to help with any questions about our wildlife photography prints." />
      </Helmet>

      <div className="min-h-screen bg-background py-12 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you have a question about a print, a custom request, or an international order - Lynn reads every message personally and responds within 1–2 business days.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Contact Form */}
            <div className="bg-card rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-card rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-semibold mb-6">Contact information</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <a
                        href="mailto:lynn@greatwildlifephotos.com"
                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        lynn@greatwildlifephotos.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-card shadow-lg border-none">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Custom Photo Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Don't see a subject you're looking for? Lynn is always adding new images to her collection. If you're looking for a specific animal, location, or season, send her a message - she may already have it, or she may be heading back out into the field soon.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-lg border-none">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">International Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Lynn ships within the US and Canada through MerchOne. For international orders - particularly to Europe - please contact Lynn directly. She works with a UK-based print partner to source orders internationally and avoid excessive tariffs, ensuring you receive a quality print at a fair price.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;