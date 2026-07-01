/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const email = e.record.get("email");

  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName
    },
    to: [{ address: email }],
    subject: "Welcome to Our Newsletter!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome!</h2>
        <p>Thank you for subscribing to our newsletter.</p>
        <p>You'll now receive updates about new products, special offers, and exclusive content delivered right to your inbox.</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;">We're excited to have you as part of our community!</p>
        </div>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          If you no longer wish to receive emails from us, you can unsubscribe at any time.
        </p>
      </div>
    `
  });
  $app.newMailClient().send(message);

  e.next();
}, "newsletter_subscribers");